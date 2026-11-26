import argparse
import hashlib
import json
import struct
import sys
import zlib
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


STATUSES = {"visible", "occluded", "out-of-frame", "mismatch"}
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def label(value, field):
    require(isinstance(value, str) and value.strip(), f"Missing {field}")
    return value.strip()


def local_file(root, value, relative_to=None):
    parts = urlsplit(label(value, "path"))
    path = Path(unquote(parts.path))
    require(not (parts.scheme or parts.netloc or path.is_absolute()), f"Use a relative local path: {value}")
    resolved = ((relative_to or root) / path).resolve()
    require(resolved.is_relative_to(root) and resolved.is_file(), f"Missing or outside the room folder: {value}")
    return resolved


def check_png(path):
    data = path.read_bytes()
    require(data.startswith(PNG_SIGNATURE) and len(data) >= 45, f"Invalid PNG: {path.name}")
    offset, seen_pixels, seen_end = 8, False, False
    while offset + 12 <= len(data):
        length, kind = struct.unpack_from(">I4s", data, offset)
        end = offset + 8 + length
        require(end + 4 <= len(data), f"Truncated PNG: {path.name}")
        checksum = struct.unpack_from(">I", data, end)[0]
        require(zlib.crc32(data[offset + 4:end]) == checksum, f"Damaged PNG chunk: {path.name}")
        if offset == 8:
            require(kind == b"IHDR" and length == 13, f"Missing PNG header: {path.name}")
            width, height = struct.unpack_from(">II", data, offset + 8)
            require(width > 0 and height > 0, f"Invalid image size: {path.name}")
        if kind == b"IDAT" and length:
            seen_pixels = True
        offset = end + 4
        if kind == b"IEND":
            seen_end = length == 0
            break
    require(seen_pixels and seen_end and offset == len(data), f"Incomplete PNG: {path.name}")
    return hashlib.sha256(data).hexdigest()


class SheetLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
        self.links = []
        self.ids = set()

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        require(tag != "base", "Use ordinary links relative to the HTML file, without a base element")
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag == "img" and attrs.get("src"):
            label(attrs.get("alt"), f"alt text for {attrs['src']}")
            self.images.append(attrs["src"])
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])


def check_sheet(root, sheet, expected):
    links = SheetLinks()
    links.feed(sheet.read_text(encoding="utf-8"))
    images = {local_file(root, image, sheet.parent) for image in links.images}
    clickable = set()
    for href in links.links:
        url = urlsplit(href)
        if href.startswith("#"):
            require(unquote(url.fragment) in links.ids, f"Missing sheet anchor: {href}")
        elif not (url.scheme or url.netloc):
            clickable.add(local_file(root, href, sheet.parent))
    for image in expected:
        require(image in images and image in clickable, f"PNG must appear and be clickable in the sheet: {image.name}")


def check_room(manifest_path):
    root = manifest_path.resolve().parent
    data = json.loads(manifest_path.read_text(encoding="utf-8-sig"))
    plan = local_file(root, data["plan"])
    sheet = local_file(root, data["sheet"])
    views = data["views"]
    require(isinstance(views, list) and len(views) >= 2, "At least two views are needed for a cross-view check")
    by_id, directions = {}, set()
    pngs, hashes = {plan}, {check_png(plan)}

    for view in views:
        key = label(view["id"], "view ID")
        direction = label(view["direction"], f"direction for {key}").casefold()
        path = local_file(root, view["file"])
        require(key not in by_id and direction not in directions, f"Repeated view or direction: {key}")
        require(path not in pngs, f"Repeated image path: {path.name}")
        digest = check_png(path)
        require(digest not in hashes, f"Duplicate image content: {path.name}")
        by_id[key] = path
        directions.add(direction)
        pngs.add(path)
        hashes.add(digest)
    require(data["reference"] in by_id, "The reference ID must identify a listed view")
    check_sheet(root, sheet, pngs)

    anchors = data["anchors"]
    require(isinstance(anchors, list) and anchors, "List the anchors checked against the views")
    names, mismatches = set(), []
    for anchor in anchors:
        name = label(anchor["name"], "anchor name")
        require(name.casefold() not in names, f"Duplicate anchor: {name}")
        names.add(name.casefold())
        observations = anchor["views"]
        require(set(observations) == set(by_id), f"Missing or extra view observations for {name}")
        pictured = False
        for view, observation in observations.items():
            status = observation["status"]
            note = label(observation.get("note"), f"observation for {name} in {view}")
            require(status in STATUSES, f"Unknown status for {name} in {view}: {status}")
            pictured |= status in {"visible", "mismatch"}
            if status == "mismatch":
                mismatches.append(f"{name} / {view}: {note}")
        require(pictured, f"No view shows {name}")
    require(not mismatches, "Unresolved mismatches:\n" + "\n".join(mismatches))

    print(f"OK: {len(views)} distinct PNG views, plan, HTML links, and {len(anchors)} annotated anchors.")
    print("This checks PNG chunk integrity, links, and recorded observations. Open the images to check their content.")


def main():
    parser = argparse.ArgumentParser(description="Check the files and observations of a game room sheet.")
    parser.add_argument("manifest", type=Path)
    args = parser.parse_args()
    try:
        check_room(args.manifest)
    except (AttributeError, KeyError, OSError, TypeError, ValueError) as error:
        print(f"Room sheet check failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

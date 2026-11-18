"""Проверка растрового файла без изменения исходника. Требуется Pillow."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys

from PIL import Image, UnidentifiedImageError


def parse_size(value: str) -> tuple[int, int]:
    match = re.fullmatch(r"([1-9][0-9]*)[xX]([1-9][0-9]*)", value)
    if not match:
        raise argparse.ArgumentTypeError("Размер должен иметь вид 128x128, оба числа положительные")
    return int(match[1]), int(match[2])


def inspect_asset(path: Path, expected_size: tuple[int, int] | None = None,
                  require_transparency: bool = False) -> dict:
    """Декодировать все кадры; наличие alpha-канала не равно прозрачности."""
    with Image.open(path) as image:
        image.verify()

    frames = []
    issues = []
    with Image.open(path) as image:
        image_format = image.format
        for index in range(getattr(image, "n_frames", 1)):
            image.seek(index)
            image.load()
            alpha = image.convert("RGBA").getchannel("A")
            histogram = alpha.histogram()
            transparent_pixels = sum(histogram[:255])
            bounds = alpha.getbbox()
            frames.append({
                "index": index,
                "size": list(image.size),
                "mode": image.mode,
                "alpha_range": list(alpha.getextrema()),
                "nonopaque_pixels": transparent_pixels,
                "fully_transparent_pixels": histogram[0],
                "visible_bounds": list(bounds) if bounds else None,
            })
            if expected_size is not None and image.size != expected_size:
                issues.append(f"Кадр {index}: размер {image.size}, требуется {expected_size}")
            if require_transparency and transparent_pixels == 0:
                issues.append(f"Кадр {index}: нет фактически прозрачных пикселей")
            if bounds is None:
                issues.append(f"Кадр {index}: полностью невидимое изображение")

    return {
        "path": str(path.resolve()),
        "format": image_format,
        "bytes": path.stat().st_size,
        "frame_count": len(frames),
        "frames": frames,
        "requirements": {
            "size": list(expected_size) if expected_size else None,
            "transparency": require_transparency,
            "visible_content": True,
        },
        "passed": not issues,
        "issues": issues,
        "scope": "Декодирование, размеры, alpha и видимые границы. Художественная и runtime-проверка не выполнялись.",
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path)
    parser.add_argument("--size", type=parse_size, help="Требуемые размеры, например 128x128")
    parser.add_argument("--require-transparency", action="store_true",
                        help="Требовать не полностью непрозрачные пиксели в каждом кадре")
    args = parser.parse_args(argv)
    try:
        result = inspect_asset(args.path, args.size, args.require_transparency)
    except (OSError, ValueError, EOFError, UnidentifiedImageError,
            Image.DecompressionBombError) as error:
        result = {"path": str(args.path), "passed": False, "issues": [str(error)]}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())

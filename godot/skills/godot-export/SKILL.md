---
name: godot-export
description: "Prepare and verify Godot builds for selected desktop, web, mobile or other supported targets. Use for export presets, templates, packaging and artifact acceptance."
metadata:
  origin: "Database: Godot primary documentation and GameDev reference analysis"
---

# Godot Export and Release

## When to Activate

Build or diagnose a game artifact. Supported targets depend on the actual engine, language, renderer, SDK and platform toolchain.

## Workflow

1. Confirm exact engine/build, matching export templates, intended preset/mode, target architecture and required SDK/signing facilities. .NET, web, mobile, XR and console capabilities must be verified for the selected version.
2. Inspect preset names and inclusion/exclusion/remap rules without printing credentials or signing secrets. Preserve platform-specific overrides and keep local keys outside tracked configuration.
3. Resolve an explicit project directory and output artifact path. Verify the selected executable help and create only the intended output directory; exports can import resources and execute editor tooling.
4. Check dynamic/raw resource dependencies, case-sensitive paths and runtime data availability. Package every required companion file and notices; do not assume EXE or PCK presence proves a self-contained build.
5. Validate the actual exported artifact in an isolated destination with a QA profile and no dependency on source folders/editor caches. Distinguish debug and release and source versus shipped revision/hash.
6. On the required platform test launch, critical flows, saves, shutdown and relevant graphics/audio/input. Web adds browser/hosting constraints; mobile adds device permissions/lifecycle; console/XR requires its specific access and hardware.
7. Report generated artifact, version/target, performed acceptance and remaining access/toolchain requirements. Publishing, signing with production credentials or uploading a store release is a separately authorized action.

## Anti-Patterns

- Silently changing renderer/language/engine to make a preset succeed.
- Promising C# web or any console port without current compatibility evidence.
- Testing a source checkout and calling the release artifact accepted.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md).

## Primary Sources

- [Exporting projects](https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html)
- [CLI export options](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html)
- [Web export constraints](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html)
- [Console support](https://godotengine.org/consoles/)

Sources inspected on 2026-11-07. Check the selected engine's versioned docs before
using version-sensitive APIs; stable documentation can move or mark pages outdated.

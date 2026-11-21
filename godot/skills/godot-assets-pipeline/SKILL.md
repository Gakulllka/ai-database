---
name: godot-assets-pipeline
description: "Import and maintain Godot art, models, audio, fonts and resource dependencies. Use for asset integration, provenance, UID/import settings and export-content issues."
metadata:
  origin: "Database: Godot primary documentation and GameDev reference analysis"
---

# Godot Asset Pipeline

## When to Activate

Add, replace, move or inspect art/audio/models/fonts in an existing or new game, including generated assets.

## Workflow

1. Establish source-of-truth assets, runtime copies, licenses/provenance, import settings and the scenes/code that consume them. Keep original provided files and stable IDs where the project uses them.
2. Choose requirements before producing assets: 2D canvas/pivot/alpha/filtering or 3D units/orientation/rig/materials/LOD, plus target compression, audio format/loop and font coverage.
3. Use existing image/media/Blender workflows only when needed and available. Their presence as skills is not proof that a generator, exporter or plugin is installed.
4. Import source assets through the selected Godot version. Preserve relevant import/UID sidecars and review generated scene/resource dependencies; caches under .godot are not authoritative source assets.
5. Use resource loading for imported resources and explicit file loading for raw data as appropriate. Verify raw-file export filters; an editor-visible external file may not be in the package.
6. Inspect alpha/pivots, visual bounds, model scale/rig, audio loops and localization on actual consumers. Similar or byte-identical assets can have distinct uses; trace references before deletion.
7. Validate the built artifact from an isolated location, including dynamically loaded resources and case-sensitive paths, without relying on editor caches or parent folders.

## Anti-Patterns

- Deleting a visually similar file without checking its identity and consumers.
- Regenerating user art to solve a resource-path bug.
- Editing only an import cache or assuming successful source loading proves the asset shipped.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md).

## Primary Sources

- [Import process](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/import_process.html)
- [Version control](https://docs.godotengine.org/en/stable/tutorials/best_practices/version_control_systems.html)
- [3D scene import](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes/index.html)

Sources inspected on 2026-11-07. Check the selected engine's versioned docs before
using version-sensitive APIs; stable documentation can move or mark pages outdated.

# Godot Asset and Project Files

> Extends [common/coding-style.md](../common/coding-style.md) and
> [common/security.md](../common/security.md) for asset/source integrity.

Preserve source art, audio, models and their provenance. Change only the requested
asset or import behavior; a preview/display problem does not by itself authorize
regenerating all artwork or deleting variants. Store generated outputs and source
inputs according to the consuming project's conventions.

- Track references through scenes, Resources, import settings and UID/path metadata
  before moving or renaming assets. Respect path case on case-sensitive targets.
- Separate authored files and intentional import settings from regenerable cache.
  Use ignore rules for the selected Godot version: Godot 3, 4.0 and later 4.x do
  not have identical generated-file or credential conventions.
- Do not commit `.godot/` cache in contemporary 4.x projects, but do not discard
  source metadata/UID sidecars merely because the editor created them.
- Determine whether an imported material, animation or other Resource is shared
  before mutating it for one instance. Preserve upstream import sources and
  deliberate overrides instead of editing a cache product as the source of truth.
- Check asset dimensions, compression, loop modes and platform import options
  against the target; image/audio existence does not prove engine import or export.
- Retain attribution/license evidence for external content. A sample game's assets
  and artistic direction do not become universal defaults for other games.

Primary references: [version control](https://docs.godotengine.org/en/stable/tutorials/best_practices/version_control_systems.html),
[shared Resources](https://docs.godotengine.org/en/stable/classes/class_resource.html).

---
name: godot-save-load
description: "Design and change Godot saves, settings, migrations and restore behavior. Use for user data, progression integrity, replay or compatibility across game versions."
metadata:
  origin: "Database: Godot primary documentation and GameDev reference analysis"
---

# Godot Saves and Persistence

## When to Activate

Implement or debug persistence in any genre, including offline/online profile data and project-specific migration policies.

## Workflow

1. Locate actual res:// and user:// paths and existing schema/version/migration policy. Establish a separate QA profile before running code that may save, reset or migrate data.
2. Define persistent authoritative state separately from Nodes, transient animation/audio and derived views. Save stable identifiers and data, not accidental live-object references.
3. Validate types, bounds, finite numbers, required fields and supported versions before changing live state. Never load executable object payloads from untrusted saves or overwrite a corrupt file merely because parsing failed.
4. Choose the project commit strategy: write/flush/close a temporary file, verify result, retain required backup and replace within the intended filesystem. Do not promise crash-proof atomicity on every platform.
5. Make restore/retry/idempotence explicit. It must not issue duplicate rewards, consume unexpected RNG or replay gameplay effects just to reconstruct presentation.
6. For deterministic replays, record required inputs/version assumptions. Fingerprint rejection, recovery and migration are project decisions; do not impose the reference game policy.
7. Test new/missing/corrupt/older saves, interrupted or concurrent writes where relevant, failed save on exit, and load after real scene or application restart. Preserve player data and report actual migration evidence.

## Anti-Patterns

- Testing against normal player saves or resetting them as a troubleshooting shortcut.
- Treating JSON parsing as complete schema validation.
- Assuming data survives an export/reinstall on every platform or that a save from a newer version is silently compatible.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md).

## Primary Sources

- [Saving games](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html)
- [Resource and user paths](https://docs.godotengine.org/en/stable/tutorials/io/data_paths.html)
- [FileAccess](https://docs.godotengine.org/en/stable/classes/class_fileaccess.html)

Sources inspected on 2026-11-07. Check the selected engine's versioned docs before
using version-sensitive APIs; stable documentation can move or mark pages outdated.

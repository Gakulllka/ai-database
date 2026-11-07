# Godot Patterns

> Extends [common/patterns.md](../common/patterns.md) for 2D and 3D Godot projects.

## Project Profile

Read `project.godot` and the existing instructions before choosing implementation
patterns. Record the engine/version, language, renderer, entry scene, autoloads,
plugins, target platforms and existing state/save ownership. A source directory
alone does not prove that its current build runs.

## Scenes and Lifetimes

- Compose reusable scenes with explicit dependencies; avoid reaching through
  unrelated ancestor hierarchies when a reference or signal expresses the contract.
- Distinguish a Node's parent from its serialization `owner`. Adding a child at
  runtime does not automatically make it part of a saved `PackedScene`.
- Resolve child-dependent setup at the appropriate lifecycle point. `_ready()`
  normally runs once per Node lifetime; re-entering the tree does not automatically
  rerun it. Design repeated activation separately.
- Give signal subscriptions, tweens, timers, audio and asynchronous jobs a clear
  lifetime. After an `await`, account for scene removal, cancellation and freed
  objects before applying results.
- Preserve process/pause behavior. A paused simulation and a stopped animation
  are different states; test the behavior the task actually changes.

## Resources and Rules

Classify Resources as shared definitions or per-instance mutable state. Check
duplication/local-to-scene behavior for the selected engine, especially nested and
external subresources. Do not assume a shallow copy isolates the full data graph.
Keep save identities, balance decisions, authority and random-state ownership in
the game layer that owns them; presentation must not silently award progression.

Use [godot-development](../../skills/godot-development/SKILL.md) for task routing,
[godot-scenes-resources](../../skills/godot-scenes-resources/SKILL.md) for scene/data
changes and [language sources](../../skills/gdscript-patterns/references/sources.md)
for version-sensitive semantics.

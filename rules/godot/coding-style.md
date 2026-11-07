# Godot Coding Style

> Extends [common/coding-style.md](../common/coding-style.md) for Godot projects.

## Scope and Language

- Establish the actual engine major/minor version, language and project conventions
  before using an API or rewriting syntax. Existing Godot 3 projects stay Godot 3
  unless migration is part of the task.
- For GDScript, follow the project's established style and the matching version's
  guide: tabs, `snake_case` functions/variables/files, `PascalCase` classes and
  `UPPER_SNAKE_CASE` constants. Preserve public names consumed by scenes or data.
- Use Godot C# API names and C# conventions in `.cs` files; do not mechanically
  translate GDScript calls. See [godot-csharp](../../skills/godot-csharp/SKILL.md).
- Prefer explicit types at stable boundaries and where inference is ambiguous.
  Preserve justified dynamic code instead of hiding uncertainty with casts.

## State and Ownership

Godot Nodes, Resources and scene instances are mutable engine objects. Updating
their intended state is an idiomatic exception to generic immutability. Make the
owner and lifetime clear; use copies for independent data snapshots where useful.
Avoid duplicating entire scene trees merely to change one property.

A Resource can be shared by multiple instances. Before changing a material,
animation, configuration resource or nested collection, determine whether the
change should affect all users or only the current instance. Select isolation
using the actual version's Resource semantics.

## Change Boundaries

- Keep gameplay rules separate from presentation side effects when they have
  different owners or test needs; do not impose a new framework on every game.
- Preserve serialized export names, scene paths and signals, or migrate their
  consumers deliberately. A symbol rename may also require a scene/data change.
- New input actions, timings, physics layers and budgets belong in the project's
  documented settings/data rather than unexplained literals.

For language details and verified sources, use
[gdscript-patterns](../../skills/gdscript-patterns/SKILL.md) or
[godot-csharp](../../skills/godot-csharp/SKILL.md).

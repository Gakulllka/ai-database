---
name: gdscript-patterns
description: "Write and review version-correct GDScript, types, signals and engine lifecycle code. Use for .gd changes, parse/type failures and Godot script behavior."
metadata:
  origin: "Database: verified Godot primary documentation"
---

# GDScript Patterns

## When to Activate

- Write or review `.gd` code in a 2D, 3D, UI, tool or server project.
- Diagnose parsing, type inference, signal, lifecycle or asynchronous-state bugs.
- Adapt a language/API pattern to the project's actual Godot version.

Start with [godot-development](../godot-development/SKILL.md) to establish the
project profile. GDScript resembles Python in some syntax but has its own type,
object and engine APIs. Confirm the version before borrowing an example.

## Language and Contracts

Follow existing project conventions; the default Godot guide uses tabs,
`snake_case` functions/variables/files and `PascalCase` class names. Preserve
serialized export names, signal names and script paths unless their consumers
are migrated. Prefer a small explicit contract over speculative generic machinery.

Use types on meaningful boundaries, callback parameters and ambiguous values.
`:=` infers from the expression; it cannot recover a more specific type from
`Variant` or a general engine return type automatically. Check whether collection
typing and other syntax exist in the project's minor version.

Use `is` when an unexpected type is a defect. Use `as` for an intentional optional
cast and check for `null`; it can conceal a mismatched object otherwise. Avoid
turning warning suppression into a substitute for understanding the returned type.

## Nodes, Signals and Asynchronous Work

Child references and tree operations need the correct lifecycle stage.
`@onready` is for ready-time initialization; `_ready()` normally runs once per
Node lifetime. Repeated scene activation needs its own reset/activation contract.

Connect to the intended instance once for the intended lifetime. Prefer a direct
reference or typed signal over fragile string-based cross-scene access when the
project version supports it. Preserve editor-established connections when editing
scene files. Awaiting a signal does not guarantee that the original scene or state
still exists on resumption; recheck ownership/cancellation before mutation.

Node properties and owned gameplay state are mutable. Shared Resource definitions
must be distinguished from per-instance runtime state; see
[godot-scenes-resources](../godot-scenes-resources/SKILL.md).

## Processing and Errors

Choose idle, physics and input callbacks for their actual responsibility. Respect
the called movement API's units instead of automatically multiplying every value
by `delta`. Separate authoritative state changes from cosmetic effects when that
boundary matters to replay, saves or tests.

Handle error return values and optional loads/queries deliberately. Avoid empty
fallbacks that report success. Assertions document developer invariants; they do
not replace handling malformed external data or a user-facing failure path.

## Version-Aware Work

Read [version and lifecycle notes](references/version-and-lifecycle.md) for Godot
3/4 migration, inherited callbacks, editor scripts or re-entering scenes.
Read the relevant [primary source](references/sources.md) for a disputed API.
Do not convert an existing project merely to make an example compile.

## Verification

Use the matching engine and the project's established checks. Report the exact
script/scene and diagnostics; parser success alone does not prove gameplay,
physics, UI or rendering behavior. See [godot-testing](../godot-testing/SKILL.md).

## Anti-Patterns

- Treating GDScript as Python or mixing Godot 3 syntax with Godot 4 APIs.
- Blind `as` casts, Variant inference or warning suppression hiding a contract bug.
- Reconnecting every activation without checking lifetime, or using a freed Node
  after an awaited event.
- Assuming a Resource edit is local to one scene instance.
- Copying a sample game's names, balance rules or state architecture into every game.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md),
[godot-csharp](../godot-csharp/SKILL.md).

---
name: godot-csharp
description: "Develop and diagnose Godot C#/.NET scripts, bindings, exports and signal lifetimes. Use for Godot .cs or .csproj changes and managed build/runtime failures."
metadata:
  origin: "Database: verified Godot primary documentation"
---

# Godot C# and .NET

## When to Activate

- Change Godot `.cs`, `.csproj`, managed dependencies or C# scene bindings.
- Diagnose source-generation/build, exported-property, signal or disposed-object errors.
- Verify whether a chosen engine/.NET/target-platform combination is supported.

## Establish Compatibility

Start with [godot-development](../godot-development/SKILL.md). Identify the exact
Godot build, whether it includes .NET support, `.csproj` Godot SDK/target framework,
`global.json` if present, installed SDK/architecture and desired export targets.
The standard editor does not itself establish a working C# toolchain.

Read the matching version's prerequisite/platform matrix before promising a
mobile or web build. SDK/runtime/template requirements and target limitations
change across releases. Do not replace the engine, retarget the framework or
rewrite NuGet settings merely because a package cannot be restored.

## Engine Bindings and Scene Contracts

- Use Godot's C# API names/properties and generated identifiers; generic .NET
  knowledge alone does not establish the engine binding name or Variant support.
- Keep an attached script's class/file identity consistent. In contemporary Godot
  4 C# projects, engine-derived script classes are `partial` for source generation.
- Use the right engine callback and lifetime. `_Ready()` follows Node readiness,
  not a guarantee that initialization repeats every time the node is re-added.
- `[Export]` fields/properties must use supported Variant-compatible types.
  Preserve serialized names and defaults or migrate affected scenes deliberately;
  build before relying on newly generated Inspector/signal information.
- Godot vector/transform types are value types in C#. Change a local copy then
  assign the property, rather than trying to modify a component of a returned
  struct. Cache repeated native property access in measured hot paths when useful.

## Signals and Managed Lifetimes

Use the version's typed events and generated `SignalName` identifiers where
appropriate. Custom signal delegates follow the required declaration shape, and
Godot signals are emitted through `EmitSignal`, not ordinary event `Invoke`.

Pair subscriptions with their intended lifetime, especially when the sender
outlives the receiver. Capturing lambdas and custom signal connections have
disconnection caveats; keep a removable handler when needed. Do not assume every
managed reference or connection becomes safe merely because a Node left the tree.

After an async operation, handle cancellation and verify engine-object validity
before touching it. Background Tasks must respect Godot's thread/API restrictions;
marshal results through an appropriate main-thread boundary.

## Verification

Separate package restore, managed compilation, Godot import/scene instantiation
and exported-target execution. A successful `dotnet build` does not verify that
scene attachments, native dependencies, resources or export templates work.
Use actual project commands and [godot-testing](../godot-testing/SKILL.md).

Read [compatibility and lifetime notes](references/compatibility-and-lifetimes.md)
for SDK/target changes or subscription/async failures. Consult the selected
[primary source](references/sources.md) for binding details.

## Anti-Patterns

- Treating the standard Godot executable or an arbitrary installed .NET runtime
  as proof of a compatible C# build environment.
- Translating GDScript names mechanically or exporting unsupported CLR objects.
- Assuming all mobile/web targets work for every Godot C# version.
- Using scene Nodes from arbitrary worker threads or disposed objects after await.
- Repeatedly subscribing capturing lambdas without a matching lifetime strategy.
- Calling managed compilation proof of target gameplay or export acceptance.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md),
[gdscript-patterns](../gdscript-patterns/SKILL.md).

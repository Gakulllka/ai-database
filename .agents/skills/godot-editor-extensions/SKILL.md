---
name: godot-editor-extensions
description: "Build and review Godot tool scripts, editor plugins and optional native extensions. Use for editor automation, custom inspectors/importers or GDExtension integration."
metadata:
  origin: "Database: verified Godot primary documentation"
---

# Godot Editor and Native Extensions

## When to Activate

Change editor-time behavior, a tool/import plugin or native extension. Start by
establishing which feature requires editor/native integration; ordinary gameplay
code does not need an editor plugin or C++ dependency.

## Inspect Before Loading

Identify the exact Godot build, language/runtime, existing `addons/`, plugin
configuration, tool scripts, importers and native libraries. Editor imports and
plugin activation can execute project code and change source resources. Inspect
their behavior before using editor launch/import as a harmless validation step.
Read the [extension references](references/extension-contracts.md) for the mode used.

Use an isolated fixture/copy for unfamiliar or mutating editor tooling. Preserve
the user's existing scope; adding an instruction or reviewing source does not
authorize downloading, enabling or upgrading plugins.

## Tool Scripts and Editor Plugins

- In GDScript, `@tool` enables editor execution; C# uses its corresponding tool
  attribute and a working build. Use the engine's editor-hint check to distinguish
  editor behavior from runtime behavior where their effects differ.
- Keep tool initialization repeatable. Inspect setter callbacks and dependencies
  that execute while properties, scenes or imports are being updated.
- Pair registered controls/types/importers, event connections and allocated
  resources with cleanup on plugin exit. Test repeated enable/disable and scene
  reload; successful first activation does not prove safe teardown.
- Use the editor's undo/redo system for user-facing edits where appropriate and
  verify that changes enter the intended scene/resource history.
- Keep node ownership and saved-resource identity explicit when generating scene
  content. Do not free or rewrite nodes the editor is actively manipulating.
- Separate generated outputs from authored inputs; preserve unrelated scenes and
  project settings. Make cancellation/error paths leave understandable state.

## Native Extensions

For GDExtension, establish the binding/API version, engine precision/build,
platform/architecture, debug/release artifacts and external native dependencies.
Inspect `.gdextension` feature tags and compatibility declarations against real
binaries; a declaration does not prove ABI or package compatibility.

Use the intended `godot-cpp`/binding version and project build commands. Compatibility
has version-specific exceptions, including historical major/minor boundaries;
do not promise one binary works on every Godot 4 build. Godot 3 native integration
uses its own workflow and must not be mechanically treated as GDExtension.

## Verify Both Editor and Export

Test the narrow editor task, undo/redo, reload, disable, failure/cancel and clean
shutdown in an isolated project when execution is authorized. For runtime native
features, also test the actual exported platform with its required libraries.
Record engine/build, binding and artifact matrix, commands and observable results.
Parsing a script or building a library alone is not plugin/runtime acceptance.

## Anti-Patterns

- Enabling downloaded plugins or tool scripts to discover what they do.
- Running destructive scene changes repeatedly from an editor processing callback.
- Registering editor resources without matching removal and cleanup.
- Assuming C# editor support implies every export target is supported.
- Shipping only the host's native debug library or trusting compatibility tags alone.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md),
[godot-performance](../godot-performance/SKILL.md),
[godot-export](../godot-export/SKILL.md).

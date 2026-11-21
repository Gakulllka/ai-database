# GDScript Version and Lifecycle Decisions

## Select the Documentation Branch

Establish the actual binary version and `project.godot` profile. Use its matching
documentation branch, including minor-release compatibility notes when relevant.
The moving `stable`/`latest` branches do not establish the project's installed API.

Godot 3 and 4 differ in annotations, signal/coroutine syntax and many class/API
names. A migration may also change behavior, assets and renderer requirements.
The converter's output requires review and target testing; onboarding alone does
not authorize migration. See the official
[3-to-4 guide](https://docs.godotengine.org/en/stable/tutorials/migrating/upgrading_to_godot_4.html).

In Godot 4, overriding lifecycle functions does not implicitly execute the parent
implementation. Call the inherited implementation deliberately when the class
contract needs it. Check the original code before adding a call that would double
initialize state in a different version.

## Lifetime Checklist

- Distinguish construction, entering the tree, children being ready, repeat
  activation and removal. A node can re-enter without getting another `_ready()`.
- If a design requires another ready callback, understand `request_ready()` and
  its scope; do not use it as a universal reset mechanism.
- Keep references valid across scene transitions and awaits. A retained reference
  is not proof that the engine object is still usable.
- Decide whether a signal should remain connected while a reusable object is
  inactive, disconnected, pooled or removed.
- `@tool` code executes in the editor. Separate intended editor behavior and
  runtime behavior using the version's APIs, and inspect side effects before
  opening/importing unfamiliar code.

Primary references:
[Node lifecycle](https://docs.godotengine.org/en/stable/classes/class_node.html),
[editor execution](https://docs.godotengine.org/en/stable/tutorials/plugins/running_code_in_the_editor.html).

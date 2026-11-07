# Extension Contracts and Primary Sources

Read on 2026-11-07. These `stable` links are a discovery route; choose the exact
engine branch and binding version when building or loading an extension.

| Topic | Primary source | Use |
|---|---|---|
| Editor-time script behavior | [Running code in the editor](https://docs.godotengine.org/en/stable/tutorials/plugins/running_code_in_the_editor.html) | Tool mode, editor hints and scene-editing side effects |
| Plugin lifecycle | [Making plugins](https://docs.godotengine.org/en/stable/tutorials/plugins/editor/making_plugins.html) | Plugin configuration, initialization, cleanup and C# build prerequisite |
| Undo history | [EditorUndoRedoManager](https://docs.godotengine.org/en/stable/classes/class_editorundoredomanager.html) | Correct scene/resource history and context selection |
| Native binding/version constraints | [About godot-cpp](https://docs.godotengine.org/en/stable/tutorials/scripting/cpp/about_godot_cpp.html) | Extension versus engine module and precision/version compatibility |
| Loading and exported binaries | [The .gdextension file](https://docs.godotengine.org/en/stable/engine_details/engine_api/gdextension/gdextension_file.html) | Minimum/maximum version fields, reload behavior and platform feature tags |

Treat an extension as executable project code. For a change, identify entrypoints,
edited resources, registrations, cleanup obligations and the minimum isolated
acceptance task. Reuse the repository's existing build/release process instead of
creating a second plugin manager or pinning a new engine version implicitly.

Do not broaden a source-review task into installation or deployment. When execution
is already authorized, validate the concrete resources and target involved rather
than asking again for routine steps within that scope.

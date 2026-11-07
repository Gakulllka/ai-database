# GDScript and Godot Core Sources

Verified by reading official documentation on 2026-11-07. Select the target
engine's version in the documentation before using an API; these links use the
moving stable branch for discovery.

| Topic | Primary source | Use |
|---|---|---|
| Naming, formatting and consistency | [GDScript style](https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_styleguide.html) | Preserve idiomatic project conventions |
| Types, inference and casts | [Static typing](https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/static_typing.html) | Confirm syntax and avoid hidden null casts |
| Version migration | [Godot 3 to 4](https://docs.godotengine.org/en/stable/tutorials/migrating/upgrading_to_godot_4.html) | Review syntax and behavioral changes |
| Node lifecycle and ownership | [Node](https://docs.godotengine.org/en/stable/classes/class_node.html) | Ready/re-entry, freeing and serialization ownership |
| Shared and local resources | [Resource](https://docs.godotengine.org/en/stable/classes/class_resource.html) | Check instance isolation and version-specific duplication |
| Composition | [Scene organization](https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html) | Design explicit scene dependencies |
| Frame/physics responsibilities | [Processing](https://docs.godotengine.org/en/stable/tutorials/scripting/idle_and_physics_processing.html) | Choose the right update boundary |
| Background work | [Thread-safe APIs](https://docs.godotengine.org/en/stable/tutorials/performance/thread_safe_apis.html) | Check allowed engine interactions |
| Editor execution | [Tool scripts](https://docs.godotengine.org/en/stable/tutorials/plugins/running_code_in_the_editor.html) | Distinguish editor and runtime side effects |
| Source/cache and credential conventions | [Version control](https://docs.godotengine.org/en/stable/tutorials/best_practices/version_control_systems.html) | Use the correct version's ignore rules |

When a short tutorial and a class reference disagree about lifecycle, investigate
the selected engine's class contract and source instead of generalizing the
tutorial wording. In particular, re-entry and first-time readiness are distinct.

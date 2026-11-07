# Godot C# Primary Sources

Verified by reading official pages on 2026-11-07. The moving stable branch is a
discovery aid; use the engine's matching documentation version for implementation.

| Topic | Primary source | Use |
|---|---|---|
| Toolchain and target prerequisites | [C# basics](https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/c_sharp_basics.html) | Verify .NET-enabled build, SDK, architecture and platform limits |
| Bindings and API names | [C# differences](https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/c_sharp_differences.html) | Resolve PascalCase APIs, properties, structs and engine globals |
| Events and lifecycle exceptions | [C# signals](https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/c_sharp_signals.html) | Custom signals, emission and subscription cleanup |
| Inspector and scene serialization | [C# exported properties](https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/c_sharp_exports.html) | Validate export types and defaults |
| Readiness and object tree lifetime | [Node](https://docs.godotengine.org/en/stable/classes/class_node.html) | Review callback timing, removal and freeing |
| Background work | [Thread-safe APIs](https://docs.godotengine.org/en/stable/tutorials/performance/thread_safe_apis.html) | Check which engine operations may run off the main thread |

Additional facts such as an installed SDK or a successful build must come from
the actual environment. Documentation proves intended support, not that this
project has the required toolchain or passes its target checks.

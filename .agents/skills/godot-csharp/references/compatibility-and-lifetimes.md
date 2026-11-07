# Godot C# Compatibility and Lifetimes

## Build and Target Profile

Treat the Godot editor/build, `Godot.NET.Sdk`, target framework, installed .NET
SDK, architecture, native plug-ins and export templates as one compatibility
profile. Keep existing explicit pins unless the task requests a migration.
Inspect restore errors before modifying repository-wide or user-wide NuGet
settings; a missing package can be an environment/network/configuration issue.

At the documentation check on 2026-11-07, the stable C# basics page describes
Godot 4 C# web export as unavailable and mobile support as experimental with
target-specific limitations. It also lists different minimum SDK requirements
for desktop and Android in its Godot 4.5 guidance. These observations are not a
permanent universal matrix: verify the exact engine branch and target at task time.

Primary references: [C# basics](https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/c_sharp_basics.html),
[C# platform support](https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/index.html).

## Binding and Lifetime Decisions

Distinguish a managed object reference from the lifetime of its underlying
`GodotObject`. For a callback after scene replacement, cancellation or deferred
freeing, check that applying the result is still appropriate and the engine
object remains valid. Use the selected version's API, not a generic null check
as a universal lifetime test.

Godot performs automatic signal cleanup in many cases, but the C# signal guide
documents exceptions for captured lambdas and custom signals. When cleanup must
be explicit, keep the original delegate and disconnect it at the corresponding
lifetime boundary. A second equivalent lambda is a different handler.

Follow the Node contract for readiness/re-entry. Do not infer repeated `_Ready()`
calls from a loose tutorial description. Define repeated activation explicitly.
Avoid waiting for or mutating active scene objects on worker Tasks; engine thread
rules still apply to C#.

For save or network DTOs, map supported primitive/collection fields deliberately.
Do not assume every CLR object can be an exported property or a signal argument.

Primary references: [signals](https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/c_sharp_signals.html),
[Node lifecycle](https://docs.godotengine.org/en/stable/classes/class_node.html),
[thread-safe APIs](https://docs.godotengine.org/en/stable/tutorials/performance/thread_safe_apis.html).

# Godot Performance

> Extends [common/performance.md](../common/performance.md) for game workloads.

## Measure the Actual Target

Record engine build, renderer, target hardware, representative scene and scenario.
Separate CPU script/physics/navigation work, GPU rendering, asset loading, memory
and audio. Use the project's frame-time/memory budgets; do not invent one FPS or
draw-call target for all genres and devices. Compare the same workload before
and after an optimization.

## Engine-Specific Costs

- Select idle versus physics callbacks by responsibility. Apply time scaling with
  the relevant API's units; some movement APIs consume velocity and handle their
  own step. Avoid multiplying by delta a second time mechanically.
- Avoid repeated expensive scene searches, loads, allocations or native-language
  interop in a hot loop when profiling identifies them as significant. Keep useful
  values locally without caching references beyond their valid lifetime.
- Check resource sharing, texture/mesh/audio budgets and object lifetime before
  solving memory use by blindly duplicating assets or pooling everything.
- Keep visual-only effects from advancing simulation or consuming gameplay random
  state unless that coupling is an explicit game rule.
- The active SceneTree is not generally thread-safe. Background work must respect
  the selected engine's API/thread settings and hand results back through a safe
  boundary; `Task.Run` or a thread does not make Node access safe.

Headless timing is evidence for that headless workload. It does not establish a
renderer's performance or visual quality on the intended GPU.

Primary references: [processing](https://docs.godotengine.org/en/stable/tutorials/scripting/idle_and_physics_processing.html),
[thread-safe APIs](https://docs.godotengine.org/en/stable/tutorials/performance/thread_safe_apis.html).

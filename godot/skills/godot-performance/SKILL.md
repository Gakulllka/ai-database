---
name: godot-performance
description: "Profile and improve Godot CPU, GPU, memory, physics and loading behavior. Use for measured frame-time, stutter, simulation or resource-performance problems."
metadata:
  origin: "Database: Godot primary documentation and GameDev reference analysis"
---

# Godot Performance

## When to Activate

Investigate poor performance in 2D/3D or optimize a demonstrated bottleneck while preserving game behavior.

## Workflow

1. Define target device/build/renderer, representative workload, frame-time/loading/memory budget and baseline. Separate sustained cost, spikes and loading stalls.
2. Profile the responsible subsystem rather than guessing from code size: script/scene tree, physics, navigation, draw/GPU, allocations, import or I/O.
3. Use a reproducible scenario with recorded seed/settings where meaningful. Keep measurement probes from consuming gameplay RNG, changing ticks or producing an unbounded event log.
4. Change the measured hotspot narrowly: reduce repeated work/lookups, control active processing/voices/instances, batch or pool only when useful and check the ownership/cleanup cost.
5. For GPU work, use actual renderer/device counters and scenes. Headless simulation throughput is not a GPU frame-rate result; use godot-shaders-rendering for feature/renderer constraints.
6. Compare before/after distributions and relevant worst cases, not a single favorable frame. Recheck correctness, persistence and lifecycle under the optimized path.
7. Record scope and tradeoffs. Do not impose one frame rate, physics backend, visibility policy or simulation horizon on every game.

## Anti-Patterns

- Optimizing without a reproducible bottleneck or measuring only an empty scene.
- Using average FPS alone to hide stutter or changing game balance to improve a benchmark.
- Treating one workstation or editor run as every export target performance profile.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md).

## Primary Sources

- [Optimization principles](https://docs.godotengine.org/en/stable/tutorials/performance/general_optimization.html)
- [Godot profiler](https://docs.godotengine.org/en/stable/tutorials/scripting/debug/the_profiler.html)
- [Performance monitors](https://docs.godotengine.org/en/stable/tutorials/scripting/debug/debugger_panel.html)

Sources inspected on 2026-11-07. Check the selected engine's versioned docs before
using version-sensitive APIs; stable documentation can move or mark pages outdated.

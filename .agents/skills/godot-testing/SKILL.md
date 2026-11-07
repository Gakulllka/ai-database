---
name: godot-testing
description: "Select and run meaningful Godot script, scene, gameplay and target checks with isolated user data. Use before claiming a Godot change, build or game behavior works."
metadata:
  origin: "Database: Godot primary documentation and GameDev reference analysis"
---

# Godot Verification

## When to Activate

Verify a 2D/3D, GDScript/C#, asset, save, networking or export change; match evidence to the specific claim.

## Workflow

1. Identify engine/build, project root, trusted plugins/tool code, language, target and available test harness. Reuse existing tests; optional GUT/gdUnit or other plugins require compatibility checks rather than automatic installation.
2. Select changed logic and affected integration tests. Keep simulation/model assertions separate from scene/UI/rendering checks. Expected results come from requirements, not merely from the implementation.
3. Use the selected executable --version and --help to verify flags: unknown Godot flags may be ignored. --check-only with --script parses that script, not all game behavior; --import launches editor/import activity and may execute tool/plugins/native code.
4. Run bounded commands with explicit project/output and isolated QA user data. Inspect exit status, timeout, logs and meaningful assertion/result counts; an early quit or process exit zero alone may miss script errors.
5. Exercise lifecycle/timing where relevant: enter/ready/rebind/exit, physics/map synchronization, pause, resize/input, retry, save restore and clean shutdown. Avoid arbitrary waits that hide the state under test.
6. Add real rendering, audio, hardware input, network-peer or target-build checks only where required and available. Headless mode uses no ordinary display/audio output and cannot accept those properties.
7. Report revision, engine, commands, environment and actual results. Keep stale failures/untested branches visible; historical pass totals and synthetic fixtures are not current whole-game acceptance.

## Optional Isolated Godot 4 Fixtures

[run-smoke.js](scripts/run-smoke.js) creates fresh 2D and 3D projects from this
skill's own assets; it never accepts or loads a consumer game. Supply an explicit
engine and owned QA output directory. It verifies the executable/version/help,
checks movement, resource independence, scene ownership and signal lifecycle,
and requires positive evidence as well as clean process output.

```text
node <absolute-skill-path>/scripts/run-smoke.js --engine <Godot4-executable> --output <owned-QA-directory>
```

The fixtures use unique OS user-data profile names and explicit local logs; the
engine may create those QA profile directories. No normal player profile is used.
These are small Godot 4 headless checks, not proof of a game's 2D/3D completeness,
C# support, exported target, graphics, sound or network acceptance.

## Anti-Patterns

- Running long unchanged balance sweeps again without a new failure, change or unresolved concern.
- Calling a parser/import check a complete game test or assuming one class sample covers every class.
- Starting an unknown project or executing autoload/plugin code before considering its save/network/editor side effects.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](SKILL.md).

## Primary Sources

- [Command-line flags and limits](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html)
- [Data paths](https://docs.godotengine.org/en/stable/tutorials/io/data_paths.html)
- [Debugging](https://docs.godotengine.org/en/stable/tutorials/scripting/debug/overview_of_debugging_tools.html)

Sources inspected on 2026-11-07. Check the selected engine's versioned docs before
using version-sensitive APIs; stable documentation can move or mark pages outdated.

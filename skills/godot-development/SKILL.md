---
name: godot-development
description: "Start, inspect and change Godot projects across 2D/3D and GDScript/C#. Use to establish the actual engine, project profile and relevant development workflow."
metadata:
  origin: "Database: Godot primary documentation and GameDev reference analysis"
---

# Godot Development

## When to Activate

Work on a new or existing Godot game, prototype, tool or reusable component.
Use ECC planning/review/verification with the actual project profile; this entry
does not prescribe a genre, renderer, viewport, language or directory layout.

## Establish the Actual Profile

Find the intended `project.godot`; a repository can contain several projects.
Read its project instructions, scene/script conventions, tests and target presets.
Confirm the engine executable/version, standard versus .NET build, supported SDK,
2D/3D/mixed content, renderer, target platforms, plugins and native extensions.
`config/features` is a project compatibility hint, not proof of the binary version.
A 3D physics setting alone does not identify a game as 3D.

The optional [read-only inspector](scripts/inspect-project.js) summarizes selected
configuration and file-type hints without launching Godot or exposing export keys:

```text
node <absolute-skill-path>/scripts/inspect-project.js <project-directory>
```

It is a bounded text inspection, not a Godot parser, security audit or readiness
certificate. Inspect [project-profile.md](references/project-profile.md) when
creating/updating the project's existing `AGENTS.md`. Never copy the reference
game's story, balance, file names, user paths or historical green results.

## Route by Task

| Concern | Workflow |
|---|---|
| GDScript | [gdscript-patterns](../gdscript-patterns/SKILL.md) |
| C# / .NET | [godot-csharp](../godot-csharp/SKILL.md) |
| Nodes, scenes, resources, UID and ownership | [godot-scenes-resources](../godot-scenes-resources/SKILL.md) |
| 2D movement/worlds | [godot-2d](../godot-2d/SKILL.md) |
| 3D movement/worlds | [godot-3d](../godot-3d/SKILL.md) |
| Simulation and game rules | [godot-gameplay](../godot-gameplay/SKILL.md) |
| UI, input and localization | [godot-ui-input](../godot-ui-input/SKILL.md) |
| Animation, sound and shutdown | [godot-animation-audio](../godot-animation-audio/SKILL.md) |
| Art/model/audio import | [godot-assets-pipeline](../godot-assets-pipeline/SKILL.md) |
| Persistence and migrations | [godot-save-load](../godot-save-load/SKILL.md) |
| Pathfinding and avoidance | [godot-navigation](../godot-navigation/SKILL.md) |
| Multiplayer and RPC | [godot-networking](../godot-networking/SKILL.md) |
| Materials, shaders and GPU | [godot-shaders-rendering](../godot-shaders-rendering/SKILL.md) |
| Editor plugins, tool scripts, GDExtension | [godot-editor-extensions](../godot-editor-extensions/SKILL.md) |
| Profiling and optimization | [godot-performance](../godot-performance/SKILL.md) |
| Verification | [godot-testing](../godot-testing/SKILL.md) |
| Export and distribution | [godot-export](../godot-export/SKILL.md) |

Read only the relevant branches and current versioned primary docs. Treat Godot 3
and 4 APIs/serialization separately; upgrades, renderer changes and plugin installs
need their own task scope. GDScript/C# and desktop/web/mobile support are not
interchangeable capabilities.

## Change and Verify

Trace the owning scene, state, resource sharing, callers, signals and persistence
before editing. Preserve editor-authored layout and existing public/save contracts.
Use measured, reversible changes; clarify unresolved game rules rather than
hardcoding sample values. Nodes/resources are stateful objects: apply the Godot
rules' scoped mutation guidance instead of generic immutability literally.

Launching the editor/importer may execute `@tool`, plugins and native code and
write import/editor state. Establish that scope before running an unfamiliar
project. Use an isolated project and user-data target for QA. Validate changed
logic, integration and actual required targets; headless results do not establish
visual, audio, controller, GPU or whole-game acceptance.

Use `godot-reviewer` for independent domain review and `godot-build-resolver` for
import, script, .NET or export failures. Reuse ECC's architecture, impact analysis
and test-governance skills rather than creating a separate process per game.

## Anti-Patterns

- Inferring the installed engine from a file name or a single feature tag.
- Globally applying the reference project's 2D/Windows/Forward+ configuration.
- Rewriting an existing game to match a new folder template while onboarding.
- Promising every renderer, platform or plugin is supported before checking it.
- Treating a packaged file or historical report as current target evidence.

## Primary Sources

[Project settings](https://docs.godotengine.org/en/stable/classes/class_projectsettings.html),
[scene organization](https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html),
[command line](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html).

Check the documentation matching the selected engine; `stable` changes over time.

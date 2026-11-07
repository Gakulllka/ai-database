# Godot Project Profile

Record confirmed facts in the existing project `AGENTS.md` and documentation.
Use [the Godot example](../../../examples/godot-project-AGENTS.md) for onboarding,
preserving local instructions and the user's actual scope.

| Fact | Evidence |
|---|---|
| Godot project root(s) | Explicit `project.godot` files |
| Engine version/build | Selected executable `--version`, not file name alone |
| Language/SDK | Scripts, `.csproj`, SDK settings and installed .NET Godot build |
| 2D/3D/mixed | Scenes, scripts and design, not one unrelated project property |
| Renderer/graphics backend | Project settings, feature overrides and actual startup |
| Platforms and controls | Existing presets, device requirements and input actions |
| Main/standalone scenes | Actual project settings and scene references |
| Plugins/native code | Enabled editor plugins, `@tool`, `.gdextension`, autoloads |
| Source assets and rights | Source files, import settings and provenance records |
| Persistence compatibility | Save schemas, migration policy and separate QA profile |
| Test/export commands | Existing commands and observed behavior in this version |
| Acceptance status | Source revision, artifact hash, target, evidence and unresolved failures |

Genre, economy, story, language, viewport, art style, physics rate, platform/backend,
directory structure and exact shutdown/save policy are project decisions.
Keep existing tests and player saves intact while investigating.

Missing profile fields do not justify an invented engine path or an automatic
upgrade. An empty project can start with an explicit unknown status and the
shared instruction links; resolve facts before executing a dependent operation.

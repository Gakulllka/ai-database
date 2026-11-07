# Godot Agent Routing

> Extends [common/agents.md](../common/agents.md) for Godot tasks.

Use ECC's planner, architect, reviewer, test and documentation workflows according
to task scope. The game dimension or scripting language alone does not require a
new team or a complete re-audit of the repository.

| Work | Domain role or material |
|---|---|
| Godot code, scene/resource and lifecycle review | [godot-reviewer](../../agents/godot-reviewer.md) |
| Parse, import, C# build or export failure | [godot-build-resolver](../../agents/godot-build-resolver.md) |
| Implementation or project onboarding | [godot-development](../../skills/godot-development/SKILL.md) |
| GDScript language/API question | [gdscript-patterns](../../skills/gdscript-patterns/SKILL.md) |
| Godot .NET binding question | [godot-csharp](../../skills/godot-csharp/SKILL.md) |
| Verification and acceptance | [godot-testing](../../skills/godot-testing/SKILL.md) |

Supply reviewers with the actual engine/language/renderer/target profile, focused
diff, affected scenes and available evidence. Do not present a previous build's
result as proof of the current source.

Roles are instructions and do not create tool access. Use the host's available
delegation mechanism; if independent execution is unavailable, perform the relevant
checks locally and describe that limit. A reviewer reports findings without
silently rewriting the implementation or launching the owner's real game saves.

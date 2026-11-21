# Codex roles adapted from ECC

The parent scopes each read-only task with the goal, target paths or revision,
acceptance criteria and available evidence. Pass the verified Database checkout
root or the project's installed `.database/library` directory for supporting
guidance. Paths beginning with `common/` or `development/` are relative to
that location. Codex discovers the installed role definitions under `.codex/agents/`.
The parent can select a supported model and reasoning effort at launch. Subagents
inherit the parent's sandbox and approval settings. These roles also limit their
work to read-only inspection in their instructions.

| Database role | Returns to the parent | Pinned upstream source |
| --- | --- | --- |
| [planner](../../codex-agents/planner.toml) | Ordered implementation plan with observable acceptance checks and unresolved decisions | [ECC planner](https://github.com/affaan-m/ECC/blob/4adeee6732a12d1540f49a4d50a38ce8c97f9a53/agents/planner.md) |
| [security-reviewer](../../../development/codex-agents/security-reviewer.toml) | Findings grounded in the actor, resource, guard and effect | [ECC security-reviewer](https://github.com/affaan-m/ECC/blob/4adeee6732a12d1540f49a4d50a38ce8c97f9a53/agents/security-reviewer.md) |
| [test-reviewer](../../../development/codex-agents/test-reviewer.toml) | Gaps in how existing tests protect changed behavior | [ECC pr-test-analyzer](https://github.com/affaan-m/ECC/blob/4adeee6732a12d1540f49a4d50a38ce8c97f9a53/agents/pr-test-analyzer.md) |
| [build-error-resolver](../../../development/codex-agents/build-error-resolver.toml) | Build cause, proposed correction and verification command | [ECC build-error-resolver](https://github.com/affaan-m/ECC/blob/4adeee6732a12d1540f49a4d50a38ce8c97f9a53/agents/build-error-resolver.md) |

The upstream material is distributed under the [MIT license](../../licenses/LICENSE).

# Codex agent orchestration

The main AI coordinates the task, delegates scoped work, verifies evidence and
integrates the result. Prefer this workflow for substantive work when delegation
is authorized and available. A small task can use one worker; unavailable
delegation is an explicit limitation, not a reason to invent an agent result.

Read the [orchestration guide](../../docs/agents/orchestration.md). Each assignment
names the goal, relevant paths/revision, evidence, expected output, permitted
actions and write boundary. Pass the verified Database root or installed
`.database/library` location for shared guidance.

Choose the available model and reasoning effort for each assignment. Use a
supported explicit launch override when useful; otherwise inherit the host's
settings. Packaged roles do not pin these choices. Preserve user role overrides
and global settings. For custom roles, use a supported fresh-context launch;
full-history forks may prevent role/model overrides.

| Installed pack | Available roles |
| --- | --- |
| common | explorer, docs-researcher, planner, reviewer, database-curator |
| development | security-reviewer, test-reviewer, build-error-resolver |
| 1c | 1c-reviewer, 1c-build-resolver |
| godot | godot-reviewer, godot-build-resolver |

Use only roles present in the selected project or verified pack. Prefer domain
reviewers for their scope. Run independent reads/checks concurrently; isolate
writes by file or worktree. The parent owns conflict resolution and acceptance.
Keep independent reviews scoped to inspection and findings; do not let an author
approve their own changes.

Role instructions request read-only work. Actual sandbox and approval permissions
are inherited from the parent; a TOML field is not proof of independent isolation.
Do not expand permissions or execute actions outside the task's authorization.

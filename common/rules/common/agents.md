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
| common | explorer, docs-researcher, architect, planner, reviewer, database-curator |
| development | implementation-worker, language-reviewer, e2e-runner, security-reviewer, test-reviewer, build-error-resolver |
| 1c | 1c-reviewer, 1c-build-resolver |
| godot | godot-reviewer, godot-build-resolver |

Use only roles present in the selected project or verified pack. Prefer domain
reviewers for their scope. Run independent reads/checks concurrently; isolate
writes by file or worktree. The parent owns conflict resolution and acceptance.
Keep independent reviews scoped to inspection and findings; do not let an author
approve their own changes.

Architect recommends structure and interfaces; planner sequences the accepted
solution. Assign implementation-worker the actual stack, relevant skills, explicit
write paths, permitted commands/generated outputs and acceptance checks. Use
language-reviewer for independent stack-specific findings and e2e-runner for the
integrated user journey. E2E writes only assigned tests/artifacts, not product fixes.
Send failures back to the owning implementation worker. Keep the parent as the
decision and integration point.

Analysis/review roles request read-only work. Implementation and E2E roles may
write only within their assigned scope. Actual sandbox and approval permissions
are inherited from the parent; a TOML field is not proof of independent isolation.
Do not expand permissions or execute actions outside the task's authorization.

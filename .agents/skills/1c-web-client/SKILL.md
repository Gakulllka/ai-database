---
name: 1c-web-client
description: "Inspect a 1C web publication or automate an authorized web-client scenario. Use for 1C browser navigation, forms and web smoke/regression evidence."
metadata:
  origin: "Database: adapted from Codex_1C_Workspace_v3"
---

# 1C Web Client

## When to Activate

Inspect a 1C web publication or automate an authorized web-client scenario. Use for 1C browser navigation, forms and web smoke/regression evidence.

## Workflow

1. Establish the consumer project, explicit publication URL, test infobase, authorized scenario and currently available browser mechanism.
2. For bundled helpers, keep CWD at the consumer root or set ECC_1C_PROJECT_ROOT explicitly. Browser state/artifacts belong to that project, not the shared skill directory.
3. Use explicit web-client credentials only when needed; do not scrape them from MCP configuration or assume service credentials apply to an interactive user.
4. Run only the permitted read/non-writing steps for smoke. Use 1c-testing to define business assertions and any separately authorized data-changing scenarios.
5. Publication, stopping Apache and removing publications are manual-mode guides here: server-administration scripts were not imported. Define exact scope, service exposure, authentication and rollback for such a task.

## Operation References

Read only the operation being used and its required resources. Helpers are owned
by [1c-platform-tools](../1c-platform-tools/SKILL.md); resolve their paths from
that skill and execute with explicit consumer-project inputs.

- [web-info](../1c-platform-tools/operations/web-info/operation.md)
- [web-test](../1c-platform-tools/operations/web-test/operation.md)
- [web-publish](../1c-platform-tools/operations/web-publish/operation.md)
- [web-stop](../1c-platform-tools/operations/web-stop/operation.md)
- [web-unpublish](../1c-platform-tools/operations/web-unpublish/operation.md)

## Anti-Patterns

- Starting or publishing Apache just to inspect an existing source tree.
- Silently exposing all HTTP/OData services or downloading a server from a mutable URL.
- Using form-open success as proof of posting/calculation correctness.
- Writing browser-session files into the shared Database for all projects.

## Related Skills

[1c-development](../1c-development/SKILL.md),
[1c-testing](../1c-testing/SKILL.md),
[1c-platform-tools](../1c-platform-tools/SKILL.md).

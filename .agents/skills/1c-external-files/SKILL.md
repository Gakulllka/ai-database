---
name: 1c-external-files
description: "Create, unpack, validate and build 1C external processors and reports (EPF/ERF), including BSP registration. Use for external-file source workflows."
metadata:
  origin: "Database: adapted from Codex_1C_Workspace_v3"
---

# 1C External Processors and Reports

## When to Activate

Create, unpack, validate and build 1C external processors and reports (EPF/ERF), including BSP registration. Use for external-file source workflows.

## Workflow

1. Determine EPF versus ERF, source directory, platform version and how the target configuration supports external files.
2. Use dump to inspect an existing binary only with the installed platform tool. Keep the original artifact and source provenance.
3. Initialize or edit source metadata, forms and modules; reuse the managed-form, data-composition and template skills where appropriate.
4. Use BSP helpers only against the actual BSP registration interface/version in the target configuration; do not assume an API exists everywhere.
5. Validate source, build with the selected platform and test the allowed opening/command scenario. Building an EPF/ERF is not installing it in an infobase.

## Operation References

Read only the operation being used and its required resources. Helpers are owned
by [1c-platform-tools](../1c-platform-tools/SKILL.md); resolve their paths from
that skill and execute with explicit consumer-project inputs.

- [epf-bsp-add-command](../1c-platform-tools/operations/epf-bsp-add-command/operation.md)
- [epf-bsp-init](../1c-platform-tools/operations/epf-bsp-init/operation.md)
- [epf-build](../1c-platform-tools/operations/epf-build/operation.md)
- [epf-dump](../1c-platform-tools/operations/epf-dump/operation.md)
- [epf-init](../1c-platform-tools/operations/epf-init/operation.md)
- [epf-validate](../1c-platform-tools/operations/epf-validate/operation.md)
- [erf-build](../1c-platform-tools/operations/erf-build/operation.md)
- [erf-dump](../1c-platform-tools/operations/erf-dump/operation.md)
- [erf-init](../1c-platform-tools/operations/erf-init/operation.md)
- [erf-validate](../1c-platform-tools/operations/erf-validate/operation.md)

## Anti-Patterns

- Using a stale external-file binary as evidence of current source behavior.
- Guessing a platform executable path or registering a processor as part of source-only work.
- Hardcoding one BSP version into a reusable project.

## Related Skills

[1c-development](../1c-development/SKILL.md),
[1c-testing](../1c-testing/SKILL.md),
[1c-platform-tools](../1c-platform-tools/SKILL.md).

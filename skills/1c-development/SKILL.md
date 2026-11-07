---
name: 1c-development
description: "Plan and implement 1C:Enterprise changes using the actual platform, BSP, metadata and source-dump context. Use for starting or changing a 1C/BSL project."
metadata:
  origin: "Database: adapted from Codex_1C_Workspace_v3"
---

# 1C Development

Use ECC's existing planning, implementation, review and verification workflow with
the platform-specific facts below. A configuration source tree, a loaded
configuration and a running infobase are three separate states.

## When to Activate

- Onboard a 1C configuration, extension, external processor or report.
- Change a business calculation, posting behavior, form or metadata relationship.
- Investigate a defect whose result depends on periods, rights or platform context.

## Establish the Project Context

Read the project's instructions and identify, from evidence:

- Platform version and configuration/extension compatibility mode.
- Configuration name/version, supplier support and embedded BSP version, if any.
- Source format: Designer XML, EDT, unpacked external file or another format.
- Which source tree is authoritative, its export time and the corresponding infobase.
- Client mode, relevant module and execution context, available tools and test setup.
- Authorized work: source changes, local checks, configuration loading, database
  update or data-changing acceptance scenarios. Record these as separate stages.

Unknown facts stay unknown. Do not invent a platform installation, connection,
metadata object, project suffix or command. Use the
[project profile](references/project-profile.md) to record facts in the project's
existing `AGENTS.md`; avoid creating a second project-knowledge system.

## Select the Narrow Workflow

| Task | Skill |
|---|---|
| BSL code, contexts, queries and transactions | [1c-bsl-patterns](../1c-bsl-patterns/SKILL.md) |
| Configuration, metadata, roles and subsystems | [1c-metadata](../1c-metadata/SKILL.md) |
| Borrowing objects and method interception | [1c-extensions](../1c-extensions/SKILL.md) |
| Managed forms and their handlers | [1c-managed-forms](../1c-managed-forms/SKILL.md) |
| Data composition schemas | [1c-data-composition](../1c-data-composition/SKILL.md) |
| Spreadsheet templates and layouts | [1c-mxl-templates](../1c-mxl-templates/SKILL.md) |
| External processors/reports and BSP registration | [1c-external-files](../1c-external-files/SKILL.md) |
| XDTO and XML contracts | [1c-xdto](../1c-xdto/SKILL.md) |
| Infobase import/export/update | [1c-infobase](../1c-infobase/SKILL.md) |
| Web client and publication inspection | [1c-web-client](../1c-web-client/SKILL.md) |
| Test evidence and business acceptance | [1c-testing](../1c-testing/SKILL.md) |

## Implement and Diagnose

Separate the general business rule from illustrative dates, amounts and identifiers.
Inspect the changed object's callers, event handlers, queries, registers and forms.
Reuse mechanisms present in the actual BSP/configuration version before adding
parallel implementations. Clarify material ambiguity; the user's existing task
authorization covers routine source work within its scope.

For a defect, follow [root-cause diagnosis](references/root-cause.md). For a change
with downstream effects, use ECC `change-impact` and the relevant review role.
Review source changes with `1c-reviewer`; use `1c-build-resolver` for platform or
format failures. Use native delegation only when it is available.

Report changed objects, checks and their evidence, remaining uncertainties,
configuration-load status and infobase-update status independently.

## Anti-Patterns

- Treating an old dump as proof of the current database state.
- Loading/updating an infobase as a side effect of preparing source files.
- Generalizing the source archive's `_ЕМК` suffix, task comments or approval loops.
- Replacing ECC's Git, documentation or test policies with the source project's.
- Calling a form-open smoke check proof of business correctness.

## Related Skills

Use `product-capability`, `change-impact`, `test-collaboration` and
`verification-loop` where their actual workflows apply. Technical helpers are
owned by [1c-platform-tools](../1c-platform-tools/SKILL.md).

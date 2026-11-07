---
name: 1c-data-composition
description: "Inspect and change 1C data composition schemas (SKD/DCS), datasets, parameters, resources and variants. Use for report structure and query changes."
metadata:
  origin: "Database: adapted from Codex_1C_Workspace_v3"
---

# 1C Data Composition Schemas

## When to Activate

Inspect and change 1C data composition schemas (SKD/DCS), datasets, parameters, resources and variants. Use for report structure and query changes.

## Workflow

1. Inspect datasets, query text, links, parameters, calculated fields, resources, settings and variants using the narrow info mode.
2. Identify report semantics: period boundaries, selection rules, grouping level, totals, empty input and rights-sensitive data.
3. Use edit for a local change; compile for a new schema and decompile for an intentional rebuild. Preserve variant and expression relationships.
4. Keep runtime values in parameters and verify links/grouping do not multiply rows or totals. Read 1c-bsl-patterns for query rules.
5. Validate schema structure; compare expected and actual report values in the target environment when available. Preserve a regression case for changed totals.

## Operation References

Read only the operation being used and its required resources. Helpers are owned
by [1c-platform-tools](../1c-platform-tools/SKILL.md); resolve their paths from
that skill and execute with explicit consumer-project inputs.

- [skd-compile](../1c-platform-tools/operations/skd-compile/operation.md)
- [skd-decompile](../1c-platform-tools/operations/skd-decompile/operation.md)
- [skd-edit](../1c-platform-tools/operations/skd-edit/operation.md)
- [skd-info](../1c-platform-tools/operations/skd-info/operation.md)
- [skd-validate](../1c-platform-tools/operations/skd-validate/operation.md)

## Anti-Patterns

- Deriving the expected result from the changed report itself.
- Round-tripping a complex schema just to add one filter.
- Treating a valid dataset query as proof that every saved variant works.

## Related Skills

[1c-development](../1c-development/SKILL.md),
[1c-testing](../1c-testing/SKILL.md),
[1c-platform-tools](../1c-platform-tools/SKILL.md).

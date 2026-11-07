---
name: 1c-mxl-templates
description: "Inspect and change 1C spreadsheet templates and object layouts. Use for MXL XML, print areas, formatting and template attachment or removal."
metadata:
  origin: "Database: adapted from Codex_1C_Workspace_v3"
---

# 1C Spreadsheet Templates

## When to Activate

Inspect and change 1C spreadsheet templates and object layouts. Use for MXL XML, print areas, formatting and template attachment or removal.

## Workflow

1. Inspect the actual template format, named areas, parameters, row/column sizes, merges and print behavior.
2. Make a narrow template change or generate a new template from an explicit definition; preserve areas referenced by BSL.
3. When attaching/removing a layout, check parent metadata and every code reference to its name.
4. Validate the source structure, then render/print through the project environment for visual acceptance when available.
5. Test representative text length, empty data and multi-page output if the change affects layout. Report visual checks separately from XML checks.

## Operation References

Read only the operation being used and its required resources. Helpers are owned
by [1c-platform-tools](../1c-platform-tools/SKILL.md); resolve their paths from
that skill and execute with explicit consumer-project inputs.

- [mxl-compile](../1c-platform-tools/operations/mxl-compile/operation.md)
- [mxl-decompile](../1c-platform-tools/operations/mxl-decompile/operation.md)
- [mxl-info](../1c-platform-tools/operations/mxl-info/operation.md)
- [mxl-validate](../1c-platform-tools/operations/mxl-validate/operation.md)
- [template-add](../1c-platform-tools/operations/template-add/operation.md)
- [template-remove](../1c-platform-tools/operations/template-remove/operation.md)

## Anti-Patterns

- Calling an XML validation result a visual print acceptance.
- Renaming a named area without tracing its BSL consumers.
- Deleting an object template merely because it is absent from one current form.

## Related Skills

[1c-development](../1c-development/SKILL.md),
[1c-testing](../1c-testing/SKILL.md),
[1c-platform-tools](../1c-platform-tools/SKILL.md).

---
name: 1c-managed-forms
description: "Inspect, construct and edit 1C managed forms and handlers. Use for form XML, bindings, commands, layout and client/server form behavior."
metadata:
  origin: "Database: adapted from Codex_1C_Workspace_v3"
---

# 1C Managed Forms

## When to Activate

Inspect, construct and edit 1C managed forms and handlers. Use for form XML, bindings, commands, layout and client/server form behavior.

## Workflow

1. Inspect the existing form, main attribute, element IDs, data paths, commands and module handlers before changing layout.
2. Read form-patterns only for the layout pattern being built. Preserve bindings, event names and IDs required by existing logic.
3. Use a targeted edit for an existing form; compile/decompile is for a deliberately new or restructured form and may not preserve every feature.
4. Check handler execution context and the cost of server calls with 1c-bsl-patterns. Form state and infobase objects are different representations.
5. Run structural validation and platform checks, then an authorized form smoke. Verify business calculations separately with 1c-testing.

## Operation References

Read only the operation being used and its required resources. Helpers are owned
by [1c-platform-tools](../1c-platform-tools/SKILL.md); resolve their paths from
that skill and execute with explicit consumer-project inputs.

- [form-add](../1c-platform-tools/operations/form-add/operation.md)
- [form-compile](../1c-platform-tools/operations/form-compile/operation.md)
- [form-decompile](../1c-platform-tools/operations/form-decompile/operation.md)
- [form-edit](../1c-platform-tools/operations/form-edit/operation.md)
- [form-info](../1c-platform-tools/operations/form-info/operation.md)
- [form-patterns](../1c-platform-tools/operations/form-patterns/operation.md)
- [form-remove](../1c-platform-tools/operations/form-remove/operation.md)
- [form-validate](../1c-platform-tools/operations/form-validate/operation.md)
- [help-add](../1c-platform-tools/operations/help-add/operation.md)
- [img-grid](../1c-platform-tools/operations/img-grid/operation.md)

## Anti-Patterns

- Equating a generated valid XML tree with a working form in the target platform.
- Renumbering unrelated elements or changing a data binding during a layout-only edit.
- Assuming a screenshot proves handler or calculation correctness.

## Related Skills

[1c-development](../1c-development/SKILL.md),
[1c-testing](../1c-testing/SKILL.md),
[1c-platform-tools](../1c-platform-tools/SKILL.md).

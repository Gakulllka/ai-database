---
name: 1c-extensions
description: "Create and review 1C extensions, borrowed objects and method interceptors. Use for CFE changes and compatibility after the base configuration changes."
metadata:
  origin: "Database: adapted from Codex_1C_Workspace_v3"
---

# 1C Configuration Extensions

## When to Activate

Create and review 1C extensions, borrowed objects and method interceptors. Use for CFE changes and compatibility after the base configuration changes.

## Workflow

1. Identify the actual base configuration, platform/BSP version, extension purpose and compatibility mode.
2. Inspect the original object or method immediately before borrowing or patching it; retain identifiers and method signatures.
3. Select the least invasive supported interception mode. Before/After, Instead and ChangeAndValidate have different behavior; read the selected operation guide.
4. Check interaction with other extensions and changes to the base method. A previous successful patch is not evidence of applicability after an update.
5. Validate the extension source and its relationship to the base source. Loading, checking applicability in an infobase and activation are separate target operations.

## Operation References

Read only the operation being used and its required resources. Helpers are owned
by [1c-platform-tools](../1c-platform-tools/SKILL.md); resolve their paths from
that skill and execute with explicit consumer-project inputs.

- [cfe-borrow](../1c-platform-tools/operations/cfe-borrow/operation.md)
- [cfe-diff](../1c-platform-tools/operations/cfe-diff/operation.md)
- [cfe-init](../1c-platform-tools/operations/cfe-init/operation.md)
- [cfe-patch-method](../1c-platform-tools/operations/cfe-patch-method/operation.md)
- [cfe-validate](../1c-platform-tools/operations/cfe-validate/operation.md)

## Anti-Patterns

- Claiming Instead interception preserves the base behavior automatically.
- Silently lowering safe mode, enabling an extension or changing the database while preparing source files.
- Keeping a copied base method without checking changes to its original.

## Related Skills

[1c-development](../1c-development/SKILL.md),
[1c-testing](../1c-testing/SKILL.md),
[1c-platform-tools](../1c-platform-tools/SKILL.md).

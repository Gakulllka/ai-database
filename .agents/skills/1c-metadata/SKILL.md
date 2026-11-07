---
name: 1c-metadata
description: "Inspect and change 1C configuration XML, metadata objects, roles and navigation. Use for CF source structures, object composition, rights or subsystem changes."
metadata:
  origin: "Database: adapted from Codex_1C_Workspace_v3"
---

# 1C Configuration and Metadata

## When to Activate

Inspect and change 1C configuration XML, metadata objects, roles and navigation. Use for CF source structures, object composition, rights or subsystem changes.

## Workflow

1. Identify source format and XML dump/schema version. These helpers target their documented Designer XML format; do not run them blindly on EDT sources.
2. Inspect the configuration/object first with the matching info operation. Record identifiers, child objects, references, role rights and supplier support.
3. Choose a targeted edit for an existing object. Use compile/init for a new object and decompile only when deliberate restructuring is needed.
4. Preserve unrelated UUIDs, type qualifiers, object composition and parent references. Review deletions for downstream metadata and BSL dependencies.
5. Validate the changed object and containing configuration; then run the project platform check when available. Changing support status or permissions is a separate requested action.

## Operation References

Read only the operation being used and its required resources. Helpers are owned
by [1c-platform-tools](../1c-platform-tools/SKILL.md); resolve their paths from
that skill and execute with explicit consumer-project inputs.

- [cf-edit](../1c-platform-tools/operations/cf-edit/operation.md)
- [cf-info](../1c-platform-tools/operations/cf-info/operation.md)
- [cf-init](../1c-platform-tools/operations/cf-init/operation.md)
- [cf-validate](../1c-platform-tools/operations/cf-validate/operation.md)
- [meta-compile](../1c-platform-tools/operations/meta-compile/operation.md)
- [meta-decompile](../1c-platform-tools/operations/meta-decompile/operation.md)
- [meta-edit](../1c-platform-tools/operations/meta-edit/operation.md)
- [meta-info](../1c-platform-tools/operations/meta-info/operation.md)
- [meta-remove](../1c-platform-tools/operations/meta-remove/operation.md)
- [meta-validate](../1c-platform-tools/operations/meta-validate/operation.md)
- [role-compile](../1c-platform-tools/operations/role-compile/operation.md)
- [role-edit](../1c-platform-tools/operations/role-edit/operation.md)
- [role-info](../1c-platform-tools/operations/role-info/operation.md)
- [role-validate](../1c-platform-tools/operations/role-validate/operation.md)
- [subsystem-compile](../1c-platform-tools/operations/subsystem-compile/operation.md)
- [subsystem-edit](../1c-platform-tools/operations/subsystem-edit/operation.md)
- [subsystem-info](../1c-platform-tools/operations/subsystem-info/operation.md)
- [subsystem-validate](../1c-platform-tools/operations/subsystem-validate/operation.md)
- [interface-edit](../1c-platform-tools/operations/interface-edit/operation.md)
- [interface-validate](../1c-platform-tools/operations/interface-validate/operation.md)
- [support-edit](../1c-platform-tools/operations/support-edit/operation.md)
- [v8-xsd-fetch](../1c-platform-tools/operations/v8-xsd-fetch/operation.md)

## Anti-Patterns

- Replacing an entire XML object to change one property.
- Using one XML format version for every platform or treating role validation as proof of user-level access.
- Downloading schemas or changing supplier support merely to inspect an object.

## Related Skills

[1c-development](../1c-development/SKILL.md),
[1c-testing](../1c-testing/SKILL.md),
[1c-platform-tools](../1c-platform-tools/SKILL.md).

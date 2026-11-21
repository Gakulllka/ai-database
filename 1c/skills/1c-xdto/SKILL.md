---
name: 1c-xdto
description: "Inspect and change 1C XDTO packages and XML schemas. Use for XSD-based exchange contracts, types, properties, namespaces and XML integration changes."
metadata:
  origin: "Database: adapted from Codex_1C_Workspace_v3"
---

# 1C XDTO and XML Contracts

## When to Activate

Inspect and change 1C XDTO packages and XML schemas. Use for XSD-based exchange contracts, types, properties, namespaces and XML integration changes.

## Workflow

1. Identify the authoritative XSD/package, namespace, entry type, consumers and actual platform format.
2. Inspect required properties, multiplicity, type references and reverse usages before editing.
3. Use edit for a local contract change, compile for a new XSD-based package and decompile when an external schema is intentionally required.
4. Preserve namespace/type identity and evaluate compatibility with existing exchange payloads and consumer BSL.
5. Validate structure and permitted sample payloads, then test the actual exchange boundary if available; avoid logging personal data or credentials.

## Operation References

Read only the operation being used and its required resources. Helpers are owned
by [1c-platform-tools](../1c-platform-tools/SKILL.md); resolve their paths from
that skill and execute with explicit consumer-project inputs.

- [xdto-compile](../1c-platform-tools/operations/xdto-compile/operation.md)
- [xdto-decompile](../1c-platform-tools/operations/xdto-decompile/operation.md)
- [xdto-edit](../1c-platform-tools/operations/xdto-edit/operation.md)
- [xdto-info](../1c-platform-tools/operations/xdto-info/operation.md)
- [xdto-validate](../1c-platform-tools/operations/xdto-validate/operation.md)

## Anti-Patterns

- Changing a namespace as a cosmetic rename.
- Treating generated XSD as proof that the counterparty accepts the contract.
- Inventing mandatory fields based on one sample payload.

## Related Skills

[1c-development](../1c-development/SKILL.md),
[1c-testing](../1c-testing/SKILL.md),
[1c-platform-tools](../1c-platform-tools/SKILL.md).

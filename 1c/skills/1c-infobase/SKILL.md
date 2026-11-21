---
name: 1c-infobase
description: "Select and perform explicitly scoped 1C infobase inspection, export, import or update workflows. Use for database registry, CF/DT/XML and extension administration."
metadata:
  origin: "Database: adapted from Codex_1C_Workspace_v3"
---

# 1C Infobase Operations

## When to Activate

Select and perform explicitly scoped 1C infobase inspection, export, import or update workflows. Use for database registry, CF/DT/XML and extension administration.

## Workflow

1. Resolve the exact infobase and whether it is file/server, test/production, its platform version and the action the user authorized.
2. Separate registry/source inspection, export, import, configuration load, database schema update, extension changes and business-data mutations.
3. Before a mutating operation, establish the project backup/rollback procedure and maintenance constraints; do not substitute a CF export for a full data backup.
4. Read the selected operation and its supported arguments. Use explicit paths and a local-only registry; do not infer a target from the shared Database location.
5. Capture sanitized command results, exit status and logs. Report configuration and infobase state separately and stop on failure instead of continuing into the next stage.

## Operation References

Read only the operation being used and its required resources. Helpers are owned
by [1c-platform-tools](../1c-platform-tools/SKILL.md); resolve their paths from
that skill and execute with explicit consumer-project inputs.

- [db-cfe-admin](../1c-platform-tools/operations/db-cfe-admin/operation.md)
- [db-create](../1c-platform-tools/operations/db-create/operation.md)
- [db-dump-cf](../1c-platform-tools/operations/db-dump-cf/operation.md)
- [db-dump-dt](../1c-platform-tools/operations/db-dump-dt/operation.md)
- [db-dump-xml](../1c-platform-tools/operations/db-dump-xml/operation.md)
- [db-list](../1c-platform-tools/operations/db-list/operation.md)
- [db-load-cf](../1c-platform-tools/operations/db-load-cf/operation.md)
- [db-load-dt](../1c-platform-tools/operations/db-load-dt/operation.md)
- [db-load-git](../1c-platform-tools/operations/db-load-git/operation.md)
- [db-load-xml](../1c-platform-tools/operations/db-load-xml/operation.md)
- [db-repo](../1c-platform-tools/operations/db-repo/operation.md)
- [db-run](../1c-platform-tools/operations/db-run/operation.md)
- [db-update](../1c-platform-tools/operations/db-update/operation.md)

## Anti-Patterns

- Using db-load-git to reset or clone over an unrelated consumer repository.
- Loading/restoring/updating a database to validate a downloaded skill pack.
- Committing .v8-project.json with passwords or assuming the registry was already ignored.
- Describing CF, DT and XML exports as interchangeable backups.

## Related Skills

[1c-development](../1c-development/SKILL.md),
[1c-testing](../1c-testing/SKILL.md),
[1c-platform-tools](../1c-platform-tools/SKILL.md).

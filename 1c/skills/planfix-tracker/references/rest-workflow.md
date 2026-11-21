# Planfix REST workflow

## Connection and permissions

- Check the [Planfix API reference](https://help.planfix.com/restapidocs/) and the schema published by the target account. Its specification interface may send real requests. Use documentation and synthetic fixtures for rehearsal.
- For REST, use the configured HTTPS account endpoint with a bearer token read by the request client from its local secret store. Verify the REST account and authenticated user with `GET /userinfo` and read the requested task. [REST authorization](https://planfix.com/help/REST_API_Authorization) and [scope list](https://planfix.com/help/REST_API%3A_Access_Levels_List_%E2%80%93_scope) describe the two checks. Scope and the employee's permissions both matter.
- For MCP, use tools exposed by the already authorized connection for the right account. An operation being absent from MCP does not authorize a REST write. [Planfix MCP documentation](https://planfix.com/help/Planfix_MCP).

## Operations

| Intended action | REST route and verification |
| --- | --- |
| Read a task | `GET /task/{id}` with the needed fields. Compare the number and account with the user's request. |
| Search tasks or read comments | `POST /task/list` or `POST /task/{id}/comments/list`. They are read operations. Use documented filters, fields and pagination. |
| Create a task | `POST /task/` using the current `TaskCreateRequest` schema and the actual template. Read the returned number with `GET /task/{id}`. |
| Update task or status | `POST /task/{id}` using the current `TaskUpdateRequest`. Use `GET /object/{id}/statuses` or `GET /process/task/{id}/statuses` as applicable to the task. Match the actual status and respect the account's transition rules. Read the task again. |
| Add a comment | `POST /task/{id}/comments/` using the current `CommentCreateRequest`. Read the comment by its returned ID or check the target task's comment list. |
| Log time | Discover the account's `datatag` definition and fields. Check existing task comments or the documented entry list for matching date, task, employee and work. `POST /task/{id}/datatags/` creates a data tag entry with a comment. Reread each returned key with `GET /datatag/entry/{key}` and check the agreed values. |

Use the account's real fields and status IDs. Task numbers, template names, field IDs, and time tracking schemas vary by account. Do not carry them from examples into a live request.

## Retry and verification

- For queued HTTP `202` updates, poll the exact target read within a bounded interval. If the value is still unconfirmed, report it as pending. [Planfix REST behavior](https://planfix.com/help/REST_API).
- On timeout after sending a write, read back before doing anything else with that operation. When the endpoint supports `Idempotency-Key`, reuse the original key only for an identical authorized request. If the outcome cannot be determined, stop and report it. A retry with a different key can duplicate a task, comment or time entry.
- For a scope or access error, distinguish missing token scope from permissions on the specific task, comment, or data tag. Do not try alternate users, tokens, list queries, or routes to bypass the denial.
- Verify semantic status and fields, not just HTTP success. If Planfix normalizes text whitespace, compare the intended meaning. Report failed entries separately and avoid replaying entries that already exist.

## Example handoff for 1C

An authorized task says that a sales document loses its chosen warehouse after reopening. Separate the reported symptom from confirmed behavior. Find the exact document form and user role, reproduce on an authorized test infobase, and check the saved value after reopening both a new and an older document. Draft a short comment with what changed and what was observed. Add the comment or change the task's status only if the user authorized that write.

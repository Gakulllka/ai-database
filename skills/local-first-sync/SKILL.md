---
name: local-first-sync
description: "Design and review local-first synchronization across client storage, pending edits and a shared server. Use for stale responses, concurrent edits, reconnects, deletion propagation or sync permission failures."
metadata:
  origin: "Database: DELTA reference analysis"
---

# Local-First Synchronization

## When to Activate

- Local edits become visible before a shared server confirms them.
- A pull, reconnect or delayed acknowledgement loses edits or restores deletions.
- Sync behavior changes across users, workspaces, domains or permission changes.

Keep the project's existing storage and transport. This workflow does not require
a new sync library, CRDT, timestamp policy or always-online architecture.

## Establish the Protocol

Trace one edit through local persistence, pending work, transport, server merge,
acknowledgement and later pull. Name the authority for each field and operation.
Distinguish stable record identity from a business number or display position.

Separate these concepts even if the implementation stores them together:

| Concept | Meaning |
|---|---|
| Confirmed base | Server state and revision the client has actually observed |
| Current view | Confirmed state plus local edits, including unconfirmed edits |
| Pending work | Mutations still requiring acceptance or explicit resolution |
| In-flight batch | Exact mutation IDs/revisions sent in one request |
| Scope | Account, workspace/domain and session generation owning that work |

Record whether a response is a complete scoped snapshot, a delta, a page or a
partial success. Absence from a partial response does not imply deletion.
Do not send untouched scopes merely because they exist in the client cache.
Validate wire data before merging it into durable state.

## Preserve Edits Across Races

- Reconcile an incoming response with the current local state and pending work,
  rather than replacing state captured when the request began.
- Retire only the mutations that an acknowledgement actually accepts. An edit
  made during the request remains pending after the earlier request succeeds.
- Serialize or version dependent writes. Schedule accumulated work after an
  in-flight batch completes; avoid overlapping retries that reorder updates.
- Bind each request and result to its original scope/session generation. Cancel
  or ignore a response arriving after logout, account change or scope switch;
  never apply it to whichever workspace is currently active.
- Persist pending work according to the promised offline behavior. A successful
  in-memory update is not durable if storage failed or its quota was exceeded.

Choose conflict resolution from the product's data-loss tolerance: revision
checks, field merges, explicit conflict UI or a justified last-write policy.
Document tie handling, clock assumptions and concurrent delete/update behavior.
Client wall-clock timestamps and a local-wins tie rule alone do not establish
global ordering or convergence. Do not label such a protocol a CRDT.

For HTTP revision checks, a server-enforced strong ETag with `If-Match` can guard
against lost updates. Handle failed preconditions through reconciliation;
blindly resending the same stale replacement does not resolve the conflict.
See [RFC 9110 conditional requests](https://www.rfc-editor.org/rfc/rfc9110.html#section-13).

## Deletion, Recovery and Permissions

Represent deletion so a delayed client can learn it; keep tombstones out of
ordinary visible lists without stripping them from required sync messages.
Define explicit restore semantics instead of reviving records incidentally.

Garbage collection needs a protocol guarantee: acknowledgement coverage, a
supported offline horizon, or a required full resync when a cursor expires.
Select retention from that guarantee, not an arbitrary number of days. A full
resync must reconcile or quarantine unsent local edits before discarding state;
it must not replay an obsolete record as a new create after its tombstone expired.

Enforce record/scope permissions on the server for every write and applicable
read. Client UI restrictions are not authorization. Recheck permission changes
while work is pending. Show denied/auth-expired, offline, conflict and service
failure distinctly; an HTTP response is not evidence of a network outage.
Keep rejected work inspectable without allowing it to leak into another scope.

Use bounded retries for retryable failures and the existing deduplication or
mutation-status mechanism for ambiguous timeouts. Stop automatic replay on
permission, validation or unresolved conflict failures until their cause changes.
A successful mutation acknowledgement does not make its entire response newer
than subsequent local edits or every other server response.

## Verify Observable Failure Modes

Use controlled response ordering and isolated storage, not production accounts.
Cover the changed failure modes with assertions about records and pending work:

- Pull starts, local edit occurs, stale pull returns: the edit survives.
- Edit B occurs while A is in flight: acknowledgement of A does not erase B.
- Lost acknowledgement/retry: one accepted mutation, no duplicated create.
- Delete then stale pull/reconnect: no accidental resurrection.
- Scope switch/logout before response: no cross-scope mutation or data exposure.
- Permission revoked mid-queue: denied state, no infinite retry or false success.
- Expired cursor/tombstone history: explicit resync preserves unresolved edits.
- Local storage failure: visible unsaved state rather than a durability claim.

Report separately what was proven by pure merge tests, client/server integration
and real multi-client/reconnect checks. Existing tests remain the executable fact.

## Anti-Patterns

- Replacing all local rows with a pull or clearing every pending edit on HTTP 200.
- Using display numbers as universal identity or timestamps as authorization.
- Deleting tombstones because the main screen no longer displays the records.
- Treating a scope change as permission to reuse another scope's pending queue.
- Adopting a reference project's merge rules or retention intervals unchanged.

## Related Skills

- `contract-first` (canonical `skills/contract-first/SKILL.md` in Database): define observable sync messages.
- [backend-patterns](../backend-patterns/SKILL.md): provider implementation.
- [security-review](../security-review/SKILL.md): authorization boundaries.
- [test-collaboration](../test-collaboration/SKILL.md): durable behavioral evidence.

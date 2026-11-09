# Task and Attempt Completion

Use this protocol when workers can be retried, reassigned, or feed dependent
tasks. Keep it in the existing board, run record, or handoff artifacts; do not
introduce a new service for a one-off parallel task.

## Bind the assignment

Distinguish the run/session, the stable work item, and its current execution
attempt. Record the assigned worker, branch/worktree, expected output, relevant
revision, and acceptance/dependency gates before dispatch. Give every retry or
reassignment a new attempt identity, even when the task or terminal is reused.

Use the host's task/dispatch handles when available. Otherwise record coordinator
labels alongside the authorized launch and its output location, and have the
worker echo them. Labels correlate evidence; they do not authenticate a sender
or grant authority. A self-reported ID must agree with the trusted assignment
record and the originating worker/runtime context.

## Reassignment and timeout

A timeout does not prove that the old worker stopped. Mark its attempt as
superseded before a replacement is assigned; retain the old work and evidence.
Confirm it has stopped writing or isolate the replacement in a distinct
worktree/output location so the attempts cannot overwrite each other's work.
Do not erase a worktree or reset another worker's changes to prepare a retry.

An older result remains inspectable, but cannot settle the replacement attempt.
Reuse useful changes only through the normal integration/review path, recording
which current artifact incorporates them.

## Evaluate a completion report

Read the current assignment record before acting on a report:

1. Match run, task, attempt, assigned worker, and output location using trusted
   launch/runtime evidence. Do not infer ownership from the focused terminal,
   arrival order, timestamp, or a familiar task name.
2. A result from another run or a superseded attempt cannot advance the current
   task or unblock its dependents. Preserve it as a stale/unmatched result.
3. Confirm the reported artifact and evidence refer to the actual revision under
   review. Missing identity, inaccessible evidence, or conflicting reports leave
   completion unconfirmed; inspect the authoritative record instead of guessing.
4. A current successful report makes the result available for review. Accept it
   only when the declared artifact, checks, scope, and integration gates are met.
   A failed report or non-zero launcher exit remains a failed attempt, with a
   blocker and next action; it is not completion of the requested work.
5. Release each dependent only when its declared prerequisite gate is satisfied,
   binding it to that accepted input revision. A different revision needs the
   affected checks again. Do not equate worker exit, task acceptance, and merge.

For the same attempt and accepted artifact revision, a repeated identical
completion is an acknowledgment of existing state: do not accept, merge, launch
dependents, or release a worker twice. If outcome or revision differs, reconcile
against trusted current evidence before changing state; do not let the newest
message silently replace the accepted result.

When a host or legacy launcher lacks attempt metadata, maintain the mapping in
the coordinator's existing record and inspect the authorized invocation and its
specific output before accepting it. If that binding cannot be established,
report completion as unconfirmed. Do not claim the host rejects stale messages
or durably deduplicates them unless that runtime behavior was actually verified.
This guidance does not add those guarantees to the bundled ECC launcher.

## Handoff

Record the current task/attempt, accepted artifact revision or unconfirmed
result, checks and gate decisions, unresolved blockers, and which dependents
were released. Preserve the distinction between a worker's claim and verified
coordinator state. If runtime checks are unavailable, state the limitation.

For example, task `T` was reassigned from attempt `A1` to `A2`. A late success
from `A1` cannot finish `A2`, even if its tests passed. A verified `A2` result
may pass the declared dependency gate; its repeated receipt changes nothing.

## Source

Informed by Orca's task/dispatch and lifecycle-settlement model in the pinned
[orchestration documentation](https://github.com/stablyai/orca/blob/83f8e6340d2e45df644efc1af72e4f3df49b915f/docs/site/content/docs/cli/orchestration.mdx)
and [completion handler](https://github.com/stablyai/orca/blob/83f8e6340d2e45df644efc1af72e4f3df49b915f/src/cli/handlers/orchestration/message-send-handler.ts).
The source license is MIT. This is original coordination guidance, not a port
of Orca's experimental runtime or a requirement to install it.

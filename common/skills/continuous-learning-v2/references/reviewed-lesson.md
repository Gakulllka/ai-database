# Reviewed lesson format

Use a single trigger and action. This example uses the existing instinct field names so a project can retain its established note format. It is a synthetic documentation example, not a recorded observation.

```markdown
---
id: read-before-retrying-generated-file
trigger: "when a generated output may already exist after an interrupted run"
confidence: 0.7
domain: "workflow"
source: "session-observation"
scope: project
project_id: "a1b2c3d4e5f6"
project_name: "fixture-project"
---

# Check the existing output before retry

## Action

Read the expected output path and verify the result before repeating the write.

## Evidence

- 2026-01-15, fixture run A: a completed file persisted after the caller timed out.
- 2026-01-16, fixture run B: the incomplete case had no output and could be retried safely.

## Limit

Use the operation's own reconciliation or ownership rules for remote or irreversible writes.
```

| Confidence | Evidence |
| --- | --- |
| 0.3 | Tentative pattern or one incomplete observation. Collect a check. |
| 0.5 | One clear observation in a known context. Keep the narrow scope. |
| 0.7 | Several agreeing observations or a successful targeted retest. Record the limit. |
| 0.9 | Repeated checks including a materially different case and no unresolved counterexample. |

The levels express strength of evidence. An explicit user preference can be binding in its approved scope regardless of whether it generalizes.

For prior instincts, preserve their project identity and source. Review copied or sanitized files separately before importing. Resolve an unknown project ID before writing. Minimize transcript content and omit credentials, private logs and irrelevant personal data.

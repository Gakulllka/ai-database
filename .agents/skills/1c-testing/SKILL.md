---
name: 1c-testing
description: "Select and report static, platform, smoke and business regression checks for 1C changes. Use when verifying BSL, metadata, forms, extensions or calculations."
metadata:
  origin: "Database: adapted from Codex_1C_Workspace_v3"
---

# 1C Testing and Evidence

## When to Activate

Verify a 1C change, investigate a regression or prepare acceptance evidence. Follow
ECC's testing workflow and the project's actual test commands; do not import the
archive's rule that functional checks always need a separate request.

## Choose What the Check Proves

| Layer | What it can establish | What it does not establish |
|---|---|---|
| Text/XML/JSON validation | Parseability and checked structural invariants | Platform acceptance or business correctness |
| BSL Language Server | Configured static diagnostics for selected sources | A running configuration's behavior |
| Designer/EDT checks | Actual platform compilation/metadata results in the target version | Correct totals or workflows |
| Smoke | The specific launch/open/read/non-writing actions exercised | Correct calculations for other inputs |
| Functional/regression | Expected vs actual results for specified business cases | Untested cases or other environments |

Imported XML validators are in [1c-platform-tools](../1c-platform-tools/SKILL.md).
Use the installed platform/BSL LS command from the project; consult its version's
help before constructing a new invocation. Do not require a new test framework or
invent coverage percentages when no coverage measurement ran.

## Build Meaningful Scenarios

Derive expected values independently from the business rule. Select relevant cases:
normal operation, empty input, alternate/adjacent period, month/year boundary,
rounding, user-right restrictions, cancellation and repeated execution. Inspect
downstream consumers for shared calculation or posting changes.

Use an isolated test infobase for scenarios that create, write, post or delete
business objects. Source editing permission does not authorize database writes or
schema updates. Reuse the user's existing authorization and target boundaries.

For a smoke-only task, perform the permitted technical steps and identify the
functional cases that remain untested. Opening a form alone is never a calculation
test. Without 1C access, report platform/runtime checks as not performed.

## Result

Record target/version, source revision, commands or actions, observed exit codes,
expected/actual values and relevant artifacts. Report source readiness,
configuration loading, infobase update and business acceptance separately.
Use the project's existing test registry; `test-collaboration` and
`verification-loop` already own general evidence/reporting workflows.

## Anti-Patterns

- Reporting synthetic fixtures or grep checks as a real 1C session.
- Suppressing a validator's nonzero exit because an earlier generation succeeded.
- Running a data-changing scenario against a guessed or production connection.
- Claiming coverage or compatibility without measurement in the target version.

## Related Skills

[1c-development](../1c-development/SKILL.md),
[1c-bsl-patterns](../1c-bsl-patterns/SKILL.md),
[1c-web-client](../1c-web-client/SKILL.md).

# Testing Requirements

Use the project's actual test commands and required coverage targets (including
the inherited 80% target where applicable). Coverage is one signal; assert the
behavior, failure shape and relevant boundary conditions affected by the change.
Select unit, integration, contract, E2E or smoke checks according to the risk.

For code that benefits from TDD, use the selected stack's testing skills and
**tdd-workflow**: reproduce the failure, observe the failing test, implement the
smallest correction and rerun the relevant checks. Preserve existing frameworks.
Do not add implementation-mirroring tests for a trivial reversible edit.

## Independent test review

Delegate material test-gap analysis to **test-reviewer** from development.
It inspects changed behavior, assertions, fixtures/mocks, error paths and relevant
integration boundaries using **test-collaboration** and **ai-regression-testing**.
It does not edit tests, replace the implementation worker or prove runtime success
from inspection.

For 1C or Godot, include their actual platform/engine checks and use the domain
reviewer. If a specialized role is unavailable, use the installed reviewer with
explicit scope and record the limit.

## Failures and evidence

For integrated user journeys, **e2e-runner** selects the actual platform profile
from the installed development guidance. Supply the target, expected behavior,
permitted test data/actions, test-file writes and artifact locations. It may run
authorized tests and isolated interactions, but product fixes remain with the
implementation-worker. Do not install a runner or upload screenshots/traces just
because an upstream example suggests it. Unavailable checks remain unverified.

Check isolation, assumptions, fixture fidelity and the real entry point. Fix the
implementation unless evidence shows the test contract is wrong. Do not delete,
weaken or quarantine a test just to obtain a pass; record the risk and permitted
manual verification when automation is unavailable.

Report the command, outcome and what it establishes. Keep static inspection,
synthetic fixtures, real execution, target acceptance and unresolved checks
distinct. Respect project-owned business acceptance criteria.

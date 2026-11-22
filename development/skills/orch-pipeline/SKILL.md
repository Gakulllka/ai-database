---
name: orch-pipeline
description: Shared orchestration engine behind the orch-* skill family — the gated Research-Plan-TDD-Review-Commit pipeline, size classifier, agent and command map, and two human gates (plan approval, commit confirmation) that orch-* operation skills delegate to. Use indirectly via orch-add-feature, orch-fix-defect, orch-change-feature, orch-refine-code, or orch-build-mvp; read directly only when adding an orch operation or tuning shared phases.
metadata:
  origin: Database
---

# Orchestrator Pipeline (shared engine)

The `orch-*` skills classify the request and choose phases from this shared
pipeline. Follow the [Database orchestration guide](../../../common/docs/agents/orchestration.md)
and [execution profiles](../../docs/agents/execution-profiles.md) for role selection
and scoped assignments.

> Invoke an operation skill (`orch-add-feature`, `orch-fix-defect`, …) rather
> than this engine directly. This file is the reference they point at.

## When to Use

- Loaded indirectly whenever an `orch-*` operation skill runs.
- Read directly only when adding a new operation to the family or tuning the
  shared phases, gates, or agent map.

## The operation family

| Skill | Operation | Trigger | First move |
|-------|-----------|---------|------------|
| `orch-add-feature` | feature | capability does not exist yet | research + plan a new slice |
| `orch-change-feature` | tweak | works, but desired behavior differs | amend existing behavior *and its tests* |
| `orch-fix-defect` | fix | broken; behavior is wrong | reproduce as a failing test, then fix |
| `orch-refine-code` | refactor | behavior stays, structure improves | restructure while keeping tests green |
| `orch-build-mvp` | mvp | bootstrap from a design/spec doc | ingest doc → vertical slices |

## Step 0 — Classify size (right-sizing)

Ceremony scales to blast radius. Score the request on three signals, take the
**highest** tier any signal reaches, and state the result in one line so the user
can override:

| Tier | Files touched | New dependency / contract | Design ambiguity | Phases that run |
|------|---------------|---------------------------|------------------|-----------------|
| trivial | 1, a few lines | none | none — the change is obvious | 4 → 5 → 6 |
| small | 1 file / 1 function | none | clear once you read the code | (1 light) → 4 → 5 → 6 |
| standard | 2–5 files | maybe a new internal module | one real choice to make | 1 → 2 → 4 → 5 → 6 |
| large | many / cross-cutting | new external dep, public API, or a spec doc | multiple open questions | 1 → 2 → (3) → 4 → 5 → 6 |

Phase 0 (Intake) always runs and is omitted from the mask column above. The
tie-breaker: anything touching a security trigger (below) or a public API /
contract is **at least** standard, regardless of file count.

## The phases

- **0. Intake** — restate the request. For `orch-build-mvp`, read the spec/design
  doc and extract scope, locked decisions, and a feature list.
- **1. Research & Reuse** — inspect the repository and installed dependencies
  first. For non-trivial additions, compare maintained implementations and
  current primary documentation with relevant, available connectors or CLIs.
  Follow the [development workflow](../../../common/rules/common/development-workflow.md)
  and record any limits that affect the decision.
- **2. Plan** — use `architect` for structural choices and `planner` for
  the resulting plan. Output a `task_list` of thin vertical slices with acceptance
  checks. → **GATE 1.**
- **3. Scaffold** — for `orch-build-mvp`, assign the first end-to-end slice to
  `implementation-worker` with its acceptance checks.
- **4. Implement (TDD)** — give `implementation-worker` the stack, relevant
  skills, write scope and checks. Apply [tdd-workflow](../tdd-workflow/SKILL.md)
  according to the operation's first move.
- **5. Review** — give the final diff and check results to an independent
  `reviewer` or `language-reviewer`. Add `security-reviewer` for the triggers below.
- **6. Commit** — conventional commits (`feat:` / `fix:` / `refactor:` / …), one
  per logical chunk. → **GATE 2.**

## The two gates

This family is **gated, not autonomous**:

1. **GATE 1 — after Plan.** Present the `task_list`; do not write implementation
   code until the user approves.
2. **GATE 2 — before Commit.** Present the diff summary and proposed messages;
   do not commit until the user confirms.

Everything between the gates flows without stopping.

## Role and tool availability

- `common` supplies `explorer` for tracing, `architect` and `planner` for
  design and planning, and `reviewer` for general review.
- `development` supplies `implementation-worker`, `language-reviewer` for
  the actual stack, `security-reviewer` for security triggers, and
  `build-error-resolver` when a build fails. Prefer the installed 1C or Godot
  reviewer and build resolver for their respective domains.
- Verify role availability in the current host. If an installed named role
  cannot be launched but delegation is available, give a scoped generic
  subagent the relevant role instructions and skills and report that fallback.
  If delegation is unavailable, perform the work within the parent's scope
  and record independent review as unavailable and incomplete.
- Use a project command only after confirming that it exists and its contract
  fits the assignment and permissions.

## Security-review trigger

Pull in `security-reviewer` when the diff touches any of: authentication or
authorization, user-input handling, database queries, file-system paths,
external API calls, cryptography, or secrets / credentials. (Per `common/rules/common/security.md`.)

## Handoff artifacts

The pipeline carries no hidden state — the planning docs *are* the handoff:

- `task_list` (from Plan) drives the Implement loop.
- Larger work may also emit PRD / architecture / system_design under the repo's
  `docs/` per `common/rules/common/development-workflow.md`.
- Review findings (CRITICAL / HIGH) must be resolved before Gate 2.

## Verification

- size tier was stated and matched the work
- Gate 1 (plan) and Gate 2 (commit) were both honored
- security triggers received independent review or the report records that
  it was unavailable
- commits are conventional and scoped to one logical change
- new / changed behavior has tests; coverage ≥ 80% per `common/rules/common/testing.md`

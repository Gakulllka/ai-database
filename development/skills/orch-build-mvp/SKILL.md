---
name: orch-build-mvp
description: Orchestrate bootstrapping a working MVP from a design or spec document — ingest the SDD/PRD, plan thin vertical slices, scaffold the first end-to-end slice, then drive a generator-evaluator build loop with review and gated feat commits. Use when a design or spec document must become a running MVP through planned vertical slices.
metadata:
  origin: Database
---

# orch-build-mvp

Actor · action · target: **orch · build · mvp**. Thin wrapper over the shared
engine in [`orch-pipeline`](../orch-pipeline/SKILL.md).

## When to Use

- The user has a **design / spec document** (SDD, PRD, system_design) and wants a
  working vertical slice bootstrapped from it.
- Takes a doc path as its argument, e.g. `civicpulse/docs/SDD-v0.6.md`.

## Operation settings

- **Default size floor:** large — this is the full pipeline including Scaffold.
- **Phase mask:** 0 (read the spec) → 1 → 2 (heavy) → 3 (scaffold) → 4 → 5 → 6.
- **First move (phase 0 → 2):** read the doc; extract scope, locked decisions,
  and the feature list; order it into **thin vertical slices** (one end-to-end
  path first, not all-models-then-all-views). Phase 3 stands up that first slice.

## How It Works

1. Run the `orch-pipeline` engine with the settings above.
2. Give `implementation-worker` one slice at a time with a bounded write
   scope and observable acceptance checks. Have an independent reviewer check
   the runnable slice against the spec and test evidence. Send failures to the
   worker to revise the slice and rerun the affected checks. Have the reviewer
   reassess the revised slice against the spec and updated test evidence. The
   parent sets an attempt or time limit for each slice. Stop when the checks
   pass, progress stalls, or the limit is reached. Report unresolved checks
   and why the loop stopped. An existing local generator-evaluator harness is
   optional if its availability and execution contract are verified.
3. Stop at **Gate 1** (slice plan) and **Gate 2** (pre-commit). Commit the
   scaffold and each slice as separate `feat:` commits.
4. Add `security-reviewer` for any slice touching a security trigger.

## Example

```
orch-build-mvp: civicpulse/docs/SDD-v0.6.md
→ read SDD → plan vertical slices  [GATE 1: approve]
→ scaffold slice 1 → implement and check against spec → independent review
→ commit feat:  [GATE 2: confirm] → next slice
```

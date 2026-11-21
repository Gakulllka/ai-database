---
name: skill-comply
description: "Test whether Codex actually follows a skill or project rule. Use for paired Codex runs scored against observable trace steps, including required ordering and missing evidence."
metadata:
  origin: Database
---

# Skill Compliance

Assess whether the instruction changes observed behavior. Use the same task, model and settings, comparable isolated workspaces, and predeclared checks for both versions.

1. Pick one behavior a reviewer can observe. Before running, name the required steps, any ordering constraint, and the evidence that would settle each check. Examples include a file diff, command exit result, or tool log entry with its run identity.
2. Compare A without the candidate instruction and B with it. Keep the user prompt and permitted tools fixed for each matched pair. Record exact instruction versions, initial state and any unavoidable differences. Prefer separate clean runs over asking one assistant to simulate both sides.
3. Use an available Codex runner or collect the actual visible tooling record from an authorized run. Capture a small redacted timeline in tool execution order. Keep tool results separate from assistant intent and separately note whether the prescribed check was performed and whether the task succeeded.
4. Score each required step as `observed pass`, `observed fail`, or `inconclusive`. Failure requires contradictory evidence or a complete relevant trace that omits the step. For an incomplete trace mark the unresolved steps inconclusive. Report required passes, failures and inconclusive counts before deriving a rate.
5. Use [the rubric and sample traces](references/trace-evaluation.md) to calibrate reviewers. Record unnecessary actions and regressions as well as improvements. Report a single pair as a pilot. Repeat on distinct tasks before making a broader quality claim.

The bundled Python runner was built for a different host. Use the fixtures and scoring approach directly in Codex. Running a separate adapter requires validating its actual trace contract first.

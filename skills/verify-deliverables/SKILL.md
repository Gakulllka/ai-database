---
name: verify-deliverables
description: Use when asked to verify that a multi-step task, artifact, fix, or integration meets acceptance criteria, or when completion depends on an externally observable result.
metadata:
  source: https://github.com/Gakulllka/ai-database/blob/c06ef2f964137cfbfd6baa2492e00bc3e9d040d5/.agents/skills/verification-loop/SKILL.md
---

# Verify Deliverables

Identify the user's required outcome, inputs, entry point, and final deliverables. For each material requirement, choose an observable check and the expected result before reviewing the evidence.

- Verify through the path the user will use. For a code or UI change, exercise the relevant entry point. For a generated artifact, reopen it in the intended format and inspect the content or rendering where it matters. For an integration, read back the resulting state and exercise the actual trigger when authorized. For research, trace the claims that drive the conclusion to the source material.
- Match the claim to the strongest available evidence. A valid configuration proves it can be parsed. A listing can prove discovery. An observed trigger and checked outcome establish runtime behavior. Capture the applicable environment, version, inputs, and actual outcome when they affect the conclusion.
- Check the normal case and any specific edge or regression the task introduces. Use fixtures and read-only checks when those can establish the outcome. If a check fails, find the cause, repair it within scope, and rerun the affected checks.
- Before handoff, account for each requested deliverable and state the concrete gap for any outcome you could only inspect indirectly. A pending run or approval remains pending until observable evidence shows its effect.

---
name: learn-eval
description: Use when asked to learn from completed work, turn a verified finding or repeated correction into a reusable Codex skill, or improve a skill based on an observed failure.
metadata:
  source: https://github.com/Gakulllka/ai-database/blob/c06ef2f964137cfbfd6baa2492e00bc3e9d040d5/commands/learn-eval.md
  behavioral-check-source: https://github.com/Gakulllka/ai-database/blob/c06ef2f964137cfbfd6baa2492e00bc3e9d040d5/skills/skill-comply/SKILL.md
---

# Learn and Evaluate

## Find a lesson

Start with a real user correction, a demonstrated failure, or a repeated workflow. Write down the trigger, the action that worked, and the evidence for the result. A result described only in an agent summary still needs verification. Generalize only across conditions the evidence supports.

Check the existing instructions and skills for overlap. If a current skill owns the workflow, add the smallest change that addresses the observed gap. Create a new skill when it has a distinct trigger or capability. Keep one-off findings with the task if the user wants them recorded. Prefer project scope for lessons from this project and follow the requested destination if the user names one.

## Check the change

Before writing, define a realistic prompt that should benefit from the lesson and the behavior the user could observe. Use a prompt that describes the task without giving away the method. Add a nearby prompt that should leave the skill inactive if the trigger could be confused with another workflow. For a fix, include the original failure case when it is reproducible.

Use `skill-creator` to write a focused update and validate its structure. When a behavioral check is warranted, compare the outcome with the acceptance criteria, using representative public or disposable inputs. Distinguish a valid file, successful discovery by Codex, and observed behavior in a task. Update only what the evidence supports.

For example, if an earlier literature review counted a preprint and its journal version as two independent findings, add a check that links related versions by study. Try a review request that contains both versions without mentioning duplicates. For the adjacent case, ask for bibliographic entries for both versions and verify that both citations are preserved.

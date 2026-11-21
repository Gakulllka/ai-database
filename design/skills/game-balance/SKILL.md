---
name: game-balance
description: Use when asked to balance a game, compare mechanics or builds, tune difficulty, progression, combat or economy, or build an interactive balance model. Infer the genre and player loop from the game, research relevant evidence, and deliver testable comparisons.
---

# Game Balance

## Identify the game and the decision

- Read the game brief, playable rules, data, and relevant project files available for this task. Identify what the player repeatedly does, what advances progress, the reward and cost, what can fail, and what the next decision is. Label the genre or hybrid from those mechanics. A game's label alone does not decide which balance method fits.
- Name the current balance decision, a player-facing success measure, the time or steps over which it matters, and a safeguard for nearby play. Examples include time to a first meaningful purchase, the number of attacks to finish an encounter, and fairness across starting sides at comparable skill.
- Keep supplied rules and measured data separate from assumptions and example numbers. If a rough brief permits a useful first pass, model plausible cases and identify the missing fact that would change the decision. Ask a question when different plausible answers require different conclusions. Use named reference games for mechanics and design evidence while working from the user's own rules.

## Research the relevant genre

- Read [genre methods](references/genre-methods.md) for the one or two mechanics that drive this case. Search the web for the relevant mechanic, balance objective, and comparable tests. Read primary material, such as developer notes, papers and official tool documentation. Use the installed evidence-research skill if available. Compare sources with the game's actual rules.
- Link a source only to what it supports. Distinguish a study result, a rule observed in the user's prototype, a model prediction, and a design judgment. If a source or current tool capability cannot be verified, name the gap and finish the useful analysis from available evidence.

## Model and run a comparison

- Start with the smallest model that could change the decision. Use the game's units and order of operations. Compare the current or documented baseline, a proposed change, and a relevant boundary. Include distinct player strategies or skill groups if they change the outcome.
- Keep the rules, starting conditions and inputs comparable across variants. For random results, reuse seeds when comparing variants, report sample sizes, and show spread and failures along with typical outcomes. Use recorded observations for user data and labeled assumptions for predictions. Estimates should explain where players could behave differently.
- Interpret the result in terms of player experience and propose a focused adjustment or a concrete playtest. When the task is a tuning recommendation, leave implementation to the user's requested scope.

## Deliver an interactive comparison

For a balance model or basic runs the user can explore, deliver a self-contained HTML file. Use [the report starter](assets/balance-report.html) when it fits. Replace its sample values, inputs, outputs and explanation with the current game. Add fields only for decisions the user can change. Show the plain-language conclusion at the top, a baseline and relevant cases side by side, and a chart when it clarifies the comparison. Put math, assumptions, evidence and limits in expandable sections. Match the user's language. For an explanation-only request, follow the user's requested format.

Before handing it off, calculate one result independently, change one meaningful input and verify the result changes as expected, then test reset and a relevant edge case. For a browser deliverable, check the actual file on wide and narrow layouts, compare numbers with the calculation, and test the expandable sections. Report verification at the level you observed.

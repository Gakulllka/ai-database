---
name: game-playtest
description: Plan or analyze a human game playtest, or hand an AI-built mechanic to the user with a playable build and an interactive feedback form. Use for player choices, misunderstandings, friction, and how gameplay feels.
---

# Game Playtest

Use a model to check predicted balance. Use a human playtest to observe how a player responds. Combine them when a balance decision depends on behavior.

## Plan

- Pick the decision, relevant player experience and one observable question. Define success, what would change the decision, and when observation ends. With a mockup, test understanding or choice. Use a playable slice for gameplay and state any assumptions.
- Give the player a goal in terms they already know. Keep the expected route and prompts that might reveal it in the observer brief. Ask follow-ups after the target action or at the end of the attempt. Save think-aloud for a time when talking is unlikely to alter the behavior.
- Match timing to the task. For a simple choice, start with 10 seconds once the options are visible and usable. Record what happened within that window and let the player finish at their own pace. Longer tasks such as learning controls or trying a combat loop warrant a longer window. Specify what starts the clock and when any help is allowed. Log help and its timing.
- For version comparisons, keep the task, aid, starting state, and relevant conditions consistent. Compare first exposures for first-time discovery. Distribute comparable newcomers across versions. A replay retains what a player learned. Record order and treat later exposures separately. For repeatable tasks, vary the order where useful.
- Use the [session sheet](references/session-sheet.md) for a script and notes. Keep words for the player separate from observer notes. Use anonymous IDs and agree before recording.

## Hand an AI-built mechanic to the player

The AI checks controls, rules, timing and export. Ask the user to judge a specific experience such as how clear a choice is or how satisfying an action feels.

- Give the player the existing build or a minimal playable slice. State which rules are illustrative. Offer a clear, neutral task. When first impressions matter, capture expectations after the choice and before the player sees the gameplay effects.
- Provide an interactive feedback form by default. Use an HTML dashboard unless the user requests another format. A small demo can fit in one offline HTML file. Capture only what helps the decision, such as build version, choice and elapsed time. Ask what the player expected, what they felt, and what they would change.
- Keep game observations distinct from player answers. Provide a preview and copy or download to return the feedback in chat. Label replay as a repeat. Before handoff, exercise the real build through choice, play and export. Verify when the clock starts and let the player continue past the observation window. Report AI checks as technical checks.

## Analyze

- Count unique players by condition and record each exposure. Distinguish independent success, success after help, timeout, abandonment and missing observations. Keep those who started in the relevant denominator. Compare times only for comparable outcomes.
- Separate observed actions, player accounts and explanations. Flag differences such as player familiarity, version, device, help or order. Mark synthetic notes as examples. Limit findings from a small sample to the observed sessions.
- Lead with the practical finding and next decision. Show counts and concrete evidence. Suggest the smallest change or follow-up that would distinguish explanations. Claim actual player testing only when observed or reported.

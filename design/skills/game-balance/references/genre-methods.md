# Game balance methods by mechanic

Read the rows relevant to the player's loop. In a hybrid, track the point where systems affect each other. For example, a combat upgrade can speed up earnings and bring forward the next purchase.

| When the player mainly... | Model first | Starter checks |
| --- | --- | --- |
| Repeats actions for rewards and buys power (active incremental, action progression) | Outcomes per active minute, including travel, setup, misses and downtime. Use hits to finish a target and enemies reached by each action, then translate to earnings and time to the next purchase. | Compare ordinary, sparse and dense situations. Test damage thresholds, supply limits, cheap purchases versus saving, and the next meaningful upgrade. |
| Waits for automatic production (idle) | Stock and production over time with purchase cost growth, unlocks and the order of purchases. If relevant, model offline time or resets explicitly. | Compare immediate purchases with saving, frequent visits with long absences, and resetting now with waiting. Look for long stretches without new decisions. |
| Fights designed encounters or clears levels (PvE, action RPG, tower defense) | Encounter time, hits/actions to finish, attempts to pass, and resources carried into the next encounter. | Use representative enemy types and player approaches. Include a hard encounter, lower-skill play and a common build. Check whether an upgrade helps outside a single showcase. |
| Competes against other players (PvP, strategy, asymmetric games) | A matchup table with sample sizes by side, map, role, patch and relevant skill band. Matchup results summarize the games observed. | Swap sides or seats where practical, inspect results within a group before pooling, and test multiple strategies. A small or unpaired sample cannot isolate the cause. |
| Builds an economy or manages resources (sim, strategy, crafting, trading) | A ledger for stocks, creation, removal, resource conversion and transfers. Separate fixed-price shops from player markets. | Test scarce inputs, optimized routes, optional expenses, each progression milestone and repeated conversions. For markets inspect item prices, supply and trade volume as well as currency balances. |
| Draws cards, rolls rewards or faces procedural runs (deckbuilder, roguelike, loot) | Probability for the actual draw model and state rules. Track distribution, repeated misses, costs and hard limits such as guaranteed rewards. | Compare short and long horizons, low and high rolls, and intended strategy differences. Distinguish draws with replacement, finite decks and guarantees. |
| Solves problems or navigates fixed challenges (puzzle, platformer) | Attempts, completion and failure points by challenge and skill. Record gates, checkpoints and ease of recovery. | Verify solved, unsolved and near-boundary cases. Inspect player sessions to learn whether failures come from understanding, execution or both. |

## Measurement choices

- Express prices in player effort such as minutes, moves, sessions, or battles. A projected purchase time from average income is an approximation when rewards are irregular or gated. Compare income gain after a purchase with the time and cost to get it.
- For resource conservation, count creation and removal separately from transfers. Record the order of spending, earning and checks so an average positive income cannot hide an early stall.
- For a rate, retain numerator and denominator. Combine groups by pooling their counts, or state the weights used. Report slices even when an overall metric is useful. Controlled reruns isolate a change in the model. Causal claims about live behavior require a suitable study design.
- For random runs, record the rules, seeds, number of runs, and time or attempt horizon. Keep unreached goals in the denominator. Quantiles require enough observations and an explicit convention for outcomes beyond the horizon.
- Confirm how rules feel with targeted playtests. Simulation establishes what follows from its inputs and player policies. Live measurements can test whether those inputs describe the game.

## Primary source starting points

Open the relevant source and search for literature on the actual game and question. These are starting points for research, not numeric prescriptions.

- [Ian Schreiber on cost curves and playtesting](https://gamebalanceconcepts.wordpress.com/2010/07/21/level-3-transitive-mechanics-and-cost-curves/).
- [Anthony Pecorella on incremental growth and balancing generators](https://www.kongregate.com/en/pages/the-math-of-idle-games-part-i) and [on reset incentives](https://www.kongregate.com/en/pages/the-math-of-idle-games-part-iii).
- [Sucker Punch on the relationship between upgrades and hits to finish an enemy](https://blog.playstation.com/2020/11/25/honoring-the-blade-the-lethality-contract-and-combat-balance-in-ghost-of-tsushima/).
- [Riot on balancing the same roster for different skill groups](https://www.leagueoflegends.com/en-gb/news/dev/dev-balance-framework-update/).
- [Joris Dormans on modeling resource flows](https://cdn.aaai.org/ojs/12477/12477-52-16005-1-2-20201228.pdf) and [Machinations on model assumptions](https://machinations.io/learn/simulation-models-in-machinations).
- [CCP's EVE Online economic report](https://www.eveonline.com/news/view/monthly-economic-report-july-2026) and [a study of market interventions in Old School RuneScape](https://arxiv.org/abs/2210.07970).
- [Using player and simulation data to estimate puzzle difficulty](https://onlinelibrary.wiley.com/doi/10.1155/2024/5592373) and [GameAnalytics progression events](https://docs.gameanalytics.com/events-metrics-and-filtering/event-types/progression-events/).

## Customize the report starter

- Fill in the headline and recommendation, scenario labels, inputs with units, and result names. Replace the example's `fields`, `metrics`, `cases`, and `evaluate` with the current model. Each scenario carries its own editable values. The first metric is the charted outcome when its values are nonnegative. Return `null` for an unreachable or inapplicable result.
- Write actual assumptions, interpretation, and source links in the details. Use a consistent comparison scale and show values even when a bar is present.
- Preserve validation and reset behavior. If the rules need a different interaction, adapt the HTML directly. Deliver the filled-out offline report as an artifact in the requested workspace, with no external script dependency.

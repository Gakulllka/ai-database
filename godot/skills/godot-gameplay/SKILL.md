---
name: godot-gameplay
description: "Design and change Godot game rules, state machines, progression and simulation. Use for mechanics, inventory, combat, quests or deterministic testable gameplay."
metadata:
  origin: "Database: Godot primary documentation and GameDev reference analysis"
---

# Godot Gameplay Systems

## When to Activate

Implement or debug mechanics in any genre. Preserve the project game design instead of importing a reference game economy or combat loop.

## Workflow

1. Translate the requested behavior into observable rules, state transitions and invariants. Separate examples and sample numbers from general requirements.
2. Identify who owns time, RNG, input commands, world state and committed progression. Presentation may observe events; it must not accidentally advance simulation, duplicate rewards or consume gameplay RNG.
3. Use existing composition, data resources and state-machine conventions. Autoloads are a deliberate lifetime choice, not a default home for every subsystem.
4. Choose real-time, physics, turn or explicit simulation ticks deliberately. A fixed tick and a seed do not guarantee identical physics/RNG behavior across engine versions or hardware.
5. Keep save/load, scene transitions, pause/resume, retry and disconnect effects explicit. Rebinding a view or replaying visual events must not recommit gameplay transactions.
6. For balance, state the policy, seeds, sample size and budget; distinguish simulation measurements from formulas and avoid generalizing one strategy into universal impossibility.
7. Test original, boundary, repeated/reloaded and downstream scenarios. Assert independently expected state changes and preserve unaffected mechanics.

## Anti-Patterns

- Hardcoding a sample enemy, floor, currency or date as a universal rule.
- Letting an animation callback or UI redraw issue authoritative rewards twice.
- Treating one successful seeded run as coverage of all randomness or player strategies.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md).

## Primary Sources

- [Scene organization](https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html)
- [Random number generation](https://docs.godotengine.org/en/stable/tutorials/math/random_number_generation.html)
- [Pausing games](https://docs.godotengine.org/en/stable/tutorials/scripting/pausing_games.html)

Sources inspected on 2026-11-07. Check the selected engine's versioned docs before
using version-sensitive APIs; stable documentation can move or mark pages outdated.

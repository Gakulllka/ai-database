# Godot Testing

> Extends [common/testing.md](../common/testing.md) with Godot-specific evidence.

## Match Evidence to the Claim

Separate source/static checks, engine import/parse, isolated logic tests, scene
smoke, rendered interaction, audio behavior and exported-target acceptance.
A text check cannot prove engine parsing; a clean headless run cannot prove visible
layout, materials, sound or input behavior. Record which layers actually ran.

- Use existing project runners and the matching engine's command-line help.
  Optional test add-ons such as GUT or GdUnit4 are project choices, not required
  default dependencies of this rule pack.
- Derive assertions from the feature contract: state transitions, repeated input,
  empty/boundary cases, pause/resume, scene replacement, save reload or multiplayer
  authority where relevant. Do not assert only that the implementation called itself.
- Run destructive/reset/migration scenarios on isolated fixtures and an isolated
  user-data location. Do not use the owner's current save as a disposable test.
- For a changed 2D/3D scene, exercise the relevant physics, camera, UI, renderer and
  input path. Select cases from the actual target profile rather than forcing
  every project through every available check.
- Inspect process results and engine diagnostics, including runtime errors.
  State explicit completion/failure conditions for automated harnesses and clean
  up only the processes and temporary artifacts they own.
- A successful editor launch or export does not establish that the exported game
  contains required resources, boots cleanly or preserves existing saves.

Retain failed/unperformed checks in the report. Report measured coverage only when
an actual compatible measurement ran; do not invent 80% from scenario counts.
Keep existing ECC test/evidence policies and adapt execution to the game.

Use [godot-testing](../../skills/godot-testing/SKILL.md) for the concrete workflow.

# Research provenance and scope

This is an original workflow synthesis. No upstream instruction text, code,
templates or assets are bundled. External skills remain optional references,
not installed dependencies. Research inspected on 2026-11-10; inspect current
content and license before importing any upstream implementation later.
Exact researched revisions and adaptation decisions are recorded in the
[design workflow guide](../../../docs/design/design-workflows.md#источники-и-принятые-решения).

- [Atmosaero/art-director-loop — style-loop](https://github.com/Atmosaero/art-director-loop/blob/main/SKILL.md)
  informed the distinction between discovering a direction and preserving an
  established one, bounded iteration and inspecting art in its intended context.
  Its subject is a coherent **2D game visual system across asset categories**.
  That broader style-system certification is not required for a single character
  illustration. Consistency, a benchmark verdict or an agent's score does not
  establish beauty, audience preference or sales performance.
- [Saeyeon-developer/character-design-sheet — character-sheet](https://github.com/Saeyeon-developer/character-design-sheet/blob/main/skills/content/character-sheet/SKILL.md)
  informed separation of identity and layout references and cross-view continuity.
  Its output is a stylized multi-view character sheet. Its prescribed landscape
  layout, views and panel counts do not become requirements for a portrait,
  single illustration, realistic likeness or unconstrained concept exploration.
- [gamedev-skills/awesome-gamedev-agent-skills — create-game-assets](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/skills/disciplines/create-game-assets/SKILL.md)
  informed the handoff between visual intent, asset specifications and consumer
  verification. It covers a broader game-asset pipeline, including technical
  normalization and engine import. Those checks complement artistic judgment;
  they cannot demonstrate character appeal or replace inspection in a consumer.

Within Database, `godot-assets-pipeline` owns actual Godot asset integration;
`godot-ui-input` owns game interface interaction. The environment's available
image-generation skill owns generation/edit tool mechanics. None is assumed
available merely because it is named here.

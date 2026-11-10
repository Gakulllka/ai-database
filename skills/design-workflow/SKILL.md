---
name: design-workflow
description: "Choose the design workflow and acceptance criteria for a visual task: functional tools and 1C forms, character art, marketing surfaces or game UI. Use when the design target or priorities need routing; reuse the selected specialist for execution."
metadata:
  origin: "Database: task-based design routing"
---

# Design Workflow

Choose by what the person must accomplish or feel, not by the word "design".
This skill owns routing and the shared brief, not another design system or renderer.
For a small, well-specified edit, go straight to the specialist; do not reopen the
project's direction or force a new interview.

## Establish the job

Inspect the requested artifact, existing product/art references and maintained
design decisions. Reuse the project's design/specification record rather than
creating competing briefs. In a short working contract, identify:

- **Target and audience:** artifact, use context, platform, actual display size/input.
- **Primary outcome:** complete an operation, understand information, recognize a
  character, feel a particular emotion, or choose a product/action.
- **Required / optional / excluded:** concrete content and behavior with reasons.
  Include preserved identity, business meaning and scope boundaries.
- **Acceptance evidence:** what must be seen, exercised or measured; what remains
  judgment or needs audience feedback. Record missing capability honestly.

Infer routine reversible choices from the material. Ask only for an unresolved
choice that would materially change the outcome. Existing user authorization
continues to apply; this workflow adds no blanket approval checkpoint.

## Select the owner

| Job | Read and use | Acceptance priority |
| --- | --- | --- |
| 1C form or operational tool, editor, dashboard | [Functional UX](../frontend-design-direction/references/functional-ux.md); [1c-managed-forms](../1c-managed-forms/SKILL.md) for 1C implementation | Task completion, correct meaning, error recovery, efficient repeated use |
| Web page or marketing surface | [frontend-design-direction](../frontend-design-direction/SKILL.md) | Audience-specific hierarchy, evidence, visual appeal and primary action |
| New/refined character, illustration or character reference | [character-art-direction](../character-art-direction/SKILL.md) | Appeal, identity and expression for the brief; technical suitability for its use |
| Game menu or HUD | Functional UX plus the engine UI skill; [godot-ui-input](../godot-ui-input/SKILL.md) when Godot is confirmed | In-play readability, input/focus and states plus the game's art language |
| New or audited web visual system | [design-system](../design-system/SKILL.md) | Coherent tokens/components and inspectable examples |
| Existing design across products | [ecosystem-design-consistency](../ecosystem-design-consistency/SKILL.md) | Preserve the accepted canon and intentional platform variants |

For native visual systems, preserve the project's theme/control conventions and
use its platform owner for artifacts and validation. Shared semantic roles can
inform them, but CSS extraction, competitor-site research and HTML previews are
not mandatory native outputs. Character identity/style rules stay with the art
contract, not a web token generator.

For video, find the existing video workflow by its description. `taste` is a
particular art direction, not a universal palette. For another design medium,
inspect the available specialist before inventing a pipeline. A missing tool or
skill is not an available capability.

For a mixed request, assign owners to parts: a game cover can prioritize appeal,
its HUD must remain readable, and its inventory tool must support operations.
Share approved visual anchors and semantic roles; do not give every part a
landing-page layout or identical acceptance checklist.

## Handoff and finish

Pass the brief, reference roles, preserved constraints and evidence requirements
to the selected owner. Load only the needed workflow. For art entering Godot,
hand production/import details to [godot-assets-pipeline](../godot-assets-pipeline/SKILL.md).
Keep tokens and visual canon with their existing owners.

Review the result against required content, exclusions and preserved behavior.
Distinguish a plan, rendered concept, production asset and runtime-verified result.
Report actual evidence and remaining decisions. Do not invent visual inspection,
user research, conversion gains or a numerical beauty score.

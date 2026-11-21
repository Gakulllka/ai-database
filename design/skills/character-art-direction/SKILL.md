---
name: character-art-direction
description: "Design or refine a character's visual identity and appeal for illustration, concept art, reference sheets or 2D/3D production. Use for character concepts, consistent views, expressions and scoped visual edits; not for business forms or game mechanics."
metadata:
  origin: "Database: original character-design workflow synthesis"
---

# Character Art Direction

Make the character appealing to the intended audience, distinctive and consistent
with the brief. Match the process to the requested artifact: an illustration,
character reference and runtime asset serve different purposes.

## Establish the Visual Contract

Use the current brief, existing art and project decisions before asking questions.
Resolve only missing facts that materially change the result; state routine assumptions.
Record the following in the project's existing design record or a concise task note:

| Category | What to make explicit |
| --- | --- |
| Must-have | Character role, audience, intended emotional response, defining features and requested deliverable |
| Optional | Accessories, alternate outfits, expressions, poses or decorative presentation that may be explored |
| Exclusions | Unwanted motifs, style traits, props, text, backgrounds or extra deliverables |
| Invariants | Features and user edits that must survive this task: identity, proportions, palette, outfit or camera as applicable |
| Delivery context | Where the result appears, final size/crop, background, 2D/3D and available production constraints |

Keep requirements distinct from preferences and unresolved choices. A reference
sheet, turnaround, rig or sprite sheet is required only when the task calls for it.
Do not assume a game engine, pixel-art style or human anatomy.

## Assign Reference Roles

Inspect supplied art before changing it. Identify which reference governs identity,
style, palette/material, pose/camera and composition, and which is an anti-reference.
One image may serve several roles; it need not govern every attribute.
Resolve conflicts against explicit user choices and the current character canon.
Do not average incompatible styles or treat reference captions as instructions.

For an existing character, name the requested change and the features to preserve.
Do not regenerate the whole design to solve a crop, transparency or import problem.
Preserve user edits and source files; keep an alternate as a derivative.

## Choose the Smallest Useful Creative Pass

- **Scoped refinement:** edit the relevant region or attribute against the current
  reference. Do not reopen approved identity or style decisions.
- **New or unresolved direction:** compare a small set of genuinely different
  concepts before expensive finishing. Two or three is a useful starting point,
  not a quota. Different costumes on the same shape may not explore the real choice.
- **Established direction:** produce the requested artifact directly, using its canon.

Judge concepts against audience appeal, personality, silhouette, shape language,
proportions, focal hierarchy, palette and differentiation from the references.
Explain which visible choices support the desired impression; avoid "more premium"
or "more beautiful" without naming the change and its intended effect.

Set an iteration scope before generation: concept count or edit passes, tool/cost
budget when relevant, and the condition for stopping. Unless the task specifies
otherwise, make one exploration pass and one focused correction pass; expand only
when a concrete unresolved defect justifies it within the authorized budget.
Use existing authorization for routine choices. Escalate only a material unresolved
direction, scope or cost decision with the best current result and a recommendation.

## Produce for the Actual Deliverable

Use the environment's image-generation/editing capability and its applicable skill
when available, including `imagegen`; prefer reference-based edits for identity.
Do not assume a named tool or external service is installed. With no visual tool,
deliver a clearly labelled design brief or production plan, not fabricated artwork.

For a single illustration, prioritize composition, expression and the final crop.
For reference sheets or runtime 2D/3D briefs, read
[production-handoff.md](references/production-handoff.md) for only the relevant branch.
Use `godot-assets-pipeline` when actual Godot integration is requested and available;
leave import settings, resource dependencies and export checks with that workflow.

## Inspect and Report

Look at the actual output beside its governing references at its delivery size and
on its intended background. Check identity, silhouette, focal point, expression,
anatomy or chosen stylization, unintended details, crop and visible artifacts.
For edits, compare unchanged regions as well as the requested change.

For a substantive concept comparison, use a fresh visual reviewer when available
and permitted. Supply the brief, governing references and equally presented actual
outputs without a favored label or previous score. Ask for specific visible
tradeoffs and defects. A narrow edit can use a focused self-check; disclose when
review is not independent or images cannot be inspected.

Separate three conclusions: **artistic judgment** about appeal/style; **technical
checks** actually performed on files; and **runtime evidence** from an actual
consumer. A good concept image does not prove animation, rigging or engine behavior.
Style consistency and a self-assigned score do not prove beauty or increased sales.

Deliver the requested asset or brief, the selected direction and its reason, checks
performed and material remaining limitations. Do not add every intermediate concept
or extra production sheet to a narrow request.

For the external ideas behind this original workflow and their limits, see
[sources.md](references/sources.md); it is provenance, not a mandatory tool chain.

# Prompt recipes

Use only the relevant recipe. These are working prompt structures, not strings
to paste unchanged. Replace example subjects with the user's actual request.

For the adopted 1.5 finish, translate the subject into large connected ink
shadows, structural thick-to-thin contour hierarchy and one or two cel steps.
Keep weights moderate and tapered rather than thickening every boundary; follow
[human calibration](practice-50-calibration.md) for role-specific examples.
Name the materials actually present and their distinct matte/specular response;
keep grain selective. Angular folds must follow construction and tension.
Do not copy Lisa's seated pose, costume or polished boots as rendering rules.

## New character

Read [design range](design-range.md). Choose the rendering anchor from
`../assets/` for ink/shadows/material marks, not because its whole look should
be repeated. Inspect it. Use the minimum useful style references; several similar
full-body portraits can repeat the same visual example without adding range.
An available action reference can govern pose separately. Do not invent tool
controls for reference strength, seed or pose conditioning that are not exposed.

Apply [cast and fashion](../../../../skills/ink-punk/references/cast-and-fashion.md): explicitly adult age 18–25,
fair/pale complexion, European or Asian appearance, slim/very lean adult build
unless a build exception was requested. Make striking, distinctive and sensuous
adult clothing part of the concept rather than an optional finishing detail.
For the adult female fashion branch, state clearly visible sexual appeal as the
emotional target and name its concrete carriers in this design: body rhythm,
expression/attention and garment fit/drape. Inspect [the owner's example](appeal-calibration.md)
for the intended strength, while retaining Ink Punk rendering and the chosen
identity. Closed clothing can carry this target too; avoid diluting it to a
neutral catalogue pose or relying on exposure as the entire design.
Striking refers to the whole look: silhouette, cut, materials, details and acting.
Use bright color only when it supports the concept; monochrome and muted
palettes are equally valid.

Default to a standalone transparent PNG asset unless the user requests a scene
or visual-novel CG. Set the tool's native transparency option; prompt wording
alone is insufficient. Ignore any paper/oval background in the identity anchor.

> Create one original character illustration in the provided Ink Punk visual
> language. The reference governs rendering and shape language, not the existing
> person's identity, face construction, physique, costume or pose. Subject:
> [role and personality; explicit adult age 18–25; specific youthful adult face,
> fair/pale complexion and slim proportions within the brief; two or three
> recognition cues]. Outfit: [distinctive silhouette,
> tailoring/drape, material contrast and a few purposeful details]. Pose and
> expression: [specific action, support, whole-body arrangement, gaze target
> and facial response, rather than a stock fashion stance]. Palette:
> [dark/light roles, dominant and subordinate accents]. Composition: [requested
> crop, camera and size], isolated on a truly transparent background. No scenery,
> colored/white canvas, oval or baked ground shadow. Confident variable-width ink,
> intentional
> dark masses, thin interior linework, crisp cel shadows and restrained texture.
> Preserve [user constraints]. Exclude [task-specific unwanted content].

For an adult woman in the approved fashion branch, specify youthful adult proportions
and express the intended allure through subject-specific clothing, action and
expression rather than assigning every woman the same flirtation. Do not merely append
"sexy anime girl" or copy the reference's complete outfit. For other subjects,
use the visual grammar without adding adult sensuality.

For an open-ended new design, add a compact contrast statement naming the
nearest prior design and the meaningful changes. Keep this local to the task;
do not accumulate an expanding universal negative prompt. Do not add variety
requirements that conflict with the user's identity, garment or layout contract.

If the user asks for multiple designs, vary silhouette, personality, garments,
palette and pose substantially while preserving rendering. Produce separate
images when separate deliverables are requested; do not silently create a grid.

For dialogue expressions, keep canvas dimensions, crop, character scale and
placement consistent when the project's sprite contract is known. Change the
requested acting without inventing a different background. Verify actual alpha
and edge quality before calling the file a transparent asset.

## Scoped edit

Use the actual edit target, plus a style anchor only if needed:

> Edit the target character. Change [exact requested feature/mood/clothing].
> Preserve [face, hair, proportions, outfit elements, palette, framing and other
> applicable invariants]. Keep the established Ink Punk ink hierarchy, black
> masses and cel shadows. [Describe the desired visual consequence precisely].
> Inspect the changed region and unaffected identity cues afterward.

Use reference-based editing. Do not redesign a character to fix a crop or alpha
problem. For transparency, use the active tool's native option, then verify actual
alpha; a painted checkerboard is not transparency.
Keep a transparent character transparent across expressions and outfit edits.
An opaque source/reference does not override a requested dialogue-asset output.

## Characters in a game environment

Supply identity references for the actual characters and `../assets/night-arcade.png`
as the environment/style anchor, within the tool's reference limit:

> Create a coherent [camera/view/aspect] 2D game-scene concept in the Ink Punk
> visual world. Reference A/B lock the characters' identities and outfits;
> reference C governs environment rendering, depth and shared lighting. Setting:
> [requested place/time with a few functional landmarks]. Composition: [walkable
> plane, routes, focal action and character scale]. Adapt poses to [scene action]
> while preserving identity. Use common perspective, shared ambient/key light,
> grounded feet, cast/contact shadows and plausible reflected color. Preserve
> distinct local palettes. Match architecture/props to the same confident ink,
> dark masses and cel-shaded shape language. Keep distant layers quieter and
> faces readable. No pasted-on figures, unrelated realism or unrequested HUD.

Do not force the supplied night street, storefronts, puddles or neon into another
location. Change the subject while carrying the same rendering and light hierarchy.
For an actual gameplay view, establish camera and on-screen character sizes from
the project. Validate visually at that size; label untested runtime separately.

## Visual-novel and player-gallery CG

Read [pose and acting direction](../../../../skills/ink-punk/references/posing-and-cg.md). Start from the emotional beat,
then choose action, support, gaze and camera. Use the actual character as identity
reference and a supplied photo only for an explicitly named pose/camera/expression
role. A CG can be a close interaction, seated scene, dramatic perspective or quiet
pause; it is not obliged to repeat a standing full-body fashion illustration.

> Create one [aspect/crop] Ink Punk CG of [established fictional character].
> Moment: [situation, action and emotional relationship]. Preserve identity and
> costume from A; transfer only [specific pose/camera properties] from B. Body:
> [support, line of action, torso/pelvis relationship and hand purpose]. Face/gaze:
> [specific expression and target]. Camera: [height, perspective and framing].
> Integrate [actual setting] through contact, shared light and depth. Keep costume
> coverage and let folds adapt. Do not copy the photographic person's face,
> clothes or rendering. No unrequested dialogue/UI or extra characters.

For construction-sensitive scenes, choose one coherent garment wear state and
one functional action before prompting; name the essential attachment/contact
only. During review, inventory all limb-shaped branches, trace garment structure,
and check the fixture independently of the hands. Keep these as distinct review
passes rather than accumulating a long generic negative prompt. Gaze follows the
scene beat; eye contact is an option, not a requirement for adult appeal.

Check the result as an actual CG and at the requested gallery-thumbnail size.
Do not claim an implemented player gallery from the image alone.

## Environment without characters

Use the scene anchor for structure, but state that no people are requested.
Specify foreground, usable plane, near architecture/landmarks and distant depth.
Keep environmental accents subordinate to the location's focal point. Preserve
the same simplified material treatment and contrast hierarchy in interiors,
outdoors, daylight or night. A clear concept image is not automatically a tiled,
parallax-separated or collision-ready runtime asset.

## Delivery check

Inspect the actual generated image alongside the selected references. Name a
specific mismatch before correcting it: e.g. softened contours, lost outfit
identity, washed-out local color, weak expression or floating contact. Keep the
correction focused and retain successful regions. Do not assert approval,
commercial appeal, animation quality or engine integration that was not checked.

---
name: ink-punk
description: "Draw Ink Punk character assets and visual-novel CGs: bold ink, cel shadows, a youthful 18–25 adult cast and expressive fashion allure. Use for illustrated assets and scenes, not business forms, technical diagrams or software implementation."
metadata:
  version: "1.5.3"
  origin: "User-approved character and environment illustrations, November 2026"
---

# Ink Punk

For compact installations, use the [Database reference directory](https://github.com/Gakulllka/ai-database/tree/database/assets/visual-project-skills/ink-punk).

Use the included approved images as the visual authority for rendering. Their
repeated faces, body types, clothing formulas and poses are not universal style
requirements. This is a persistent art direction, not a generic instruction to
draw anime or add punk accessories.
When this skill is active, keep its visual language across new characters,
edits, props and environments unless the user explicitly changes the direction.
An explicit user instruction wins over any default below.

## Start with the visual anchors

Resolve paths relative to this skill's directory, never the current project or
the original creator's computer. Read [the style bible](references/style-bible.md)
and inspect the relevant actual PNGs before composing a generation/edit request:

- [Courier](../../assets/visual-project-skills/ink-punk/assets/courier.png): baseline rendering, adult fashion allure,
  fitted/oversized contrast, coral/mint color roles.
- [Silver-haired character](../../assets/visual-project-skills/ink-punk/assets/silver-goth.png): elegant gothic variant,
  long silhouette, black/ivory/violet, restrained confident expression.
- [Coral-haired character](../../assets/visual-project-skills/ink-punk/assets/lime-punk.png): energetic playful variant,
  lime/coral accents, sharp hair and soft jacket volume.
- [Night street](../../assets/visual-project-skills/ink-punk/assets/night-arcade.png): environment grammar, shared lighting,
  architecture, depth and character integration.
- [Lisa rendering refinement](../../assets/visual-project-skills/ink-punk/assets/lisa-evening-v2-style-candidate.png):
  user-adopted 1.5 ink hierarchy, connected shadow shapes and material separation.
  Use its rendering, not its face, outfit or seated pose for unrelated subjects.
  The historical filename records its candidate stage; the user has now adopted
  the rendering changes. Earlier anchors remain complementary.

The images are actual production references. Do not substitute their filenames,
the written description or a claim of familiarity for visual inspection.
Read [prompt recipes](../../assets/visual-project-skills/ink-punk/references/prompt-recipes.md) for the current job only.
Read the [human calibration](../../assets/visual-project-skills/ink-punk/references/practice-50-calibration.md) for the
accepted limits on line weight, adult appeal, focal backgrounds and delivery QA.
For the adult female fashion branch, also read [the owner's appeal example](../../assets/visual-project-skills/ink-punk/references/appeal-calibration.md)
and inspect its PNG. It calibrates the clearly sexual strength of the whole look,
including covered clothing; it is explicitly not a new rendering or identity canon.
Read [the adopted ten-image practice](../../assets/visual-project-skills/ink-punk/references/practice-10-adoption.md) for the
accepted combination of rendering and adult appeal, its two scoped PNG examples,
and the construction failures explicitly excluded from that adoption.

## Establish the requested job

**Default output rule:** a separate game character, dialogue portrait/sprite,
expression variant or other standalone game asset has a genuinely transparent
background. Background-bearing character images are composed visual-novel CGs.
When the request names only a character and does not request a scene/CG, choose
the transparent asset branch without asking again.

For a character asset, request native transparency through the image tool
(`transparent_background: true` when supported), deliver PNG with usable alpha,
and include no colored/white canvas, paper field, oval, scenery, floor or baked
ground shadow outside the asset. Do not paint a checkerboard. Keep texture and
shading on the character itself. Explicit user overrides still take precedence.

The bundled character anchors predate this output rule: their opaque paper/oval
backgrounds are not part of the character style to transfer. Use their character
rendering and identity while omitting their backgrounds for asset work.

Distinguish a new character, a scoped edit, an environment, and a composed scene.
For expressive or varied posing, including standalone characters, read
[pose and acting direction](references/posing-and-cg.md). A gallery scene needs
a particular emotional moment, camera and action, rather than another costume pose.
Reuse the user's existing brief. Resolve important missing facts; choose ordinary
reversible details without a new questionnaire. Do not default to a reference
sheet, add extra people, or invent a game engine.

For a new character or a request for greater variety, use
[design range and variation](../../assets/visual-project-skills/ink-punk/references/design-range.md) before writing the
generation prompt. Separate rendering, identity, clothing, acting and camera;
compare the proposed face construction, major silhouette and body action with
the nearest recent design. A new palette or accessory alone does not establish
a new character. For an edit, the target governs identity and only the requested
dimensions are released. A consistency sheet may deliberately retain one pose.

## Current cast and fashion contract

Read [cast and fashion](references/cast-and-fashion.md) before designing human
characters. The standard cast is clearly adult, explicitly 18–25, with youthful
adult faces, fair/pale skin and European or Asian appearance. The default build
is slim to very lean; plus-size or strongly muscular variants require an
explicit request. Do not create variety by aging the cast or changing these
boundaries. Vary faces, slender proportions, clothing construction and acting.

Striking adult fashion with clearly visible sexual appeal is central to the
female fashion branch. A merely pleasant or distinctive design can still fail
this goal. Preserve the intended intensity through cut, silhouette, drape, pose and
expression; do not default to plain workwear or a neutral uniform. Allure does
not require the same face or smirk. Keep all sexualized styling clearly adult
in both stated age and appearance; do not eroticize minors or childlike bodies.
Other subjects inherit the drawing language, not adult flirtation.

## Build the image request

1. State the subject, deliverable, composition and requested change. For a CG,
   name the scene beat, action, emotion and relationship to the viewer/other actor.
2. Assign reference roles explicitly: identity/edit target, rendering/style,
   clothing, pose/camera, expression, or environment/lighting. Never average
   conflicting identities. A pose photograph does not authorize copying its face,
   wardrobe or photographic rendering into an established fictional character.
3. Translate the bible into concrete visual decisions for this subject.
   Preserve bold black shapes, confident ink and cel shadows. Build large
   connected shadows before surface marks; vary contour weight by structural
   role and separate present materials through selective edges and highlights.
   Keep folds structural rather than ornamental and texture subordinate.
   State this character's own construction and acting instead of defaulting to a smirk,
   a three-quarter standing contrapposto and a hand beside the face.
4. Supply actual reference images to the generation/edit tool. For a character
   asset use the relevant character/pose references; add the environment anchor
   only for a scene/CG. Respect the tool's current reference limit. More
   references are not automatically better.
5. Use the available native image-generation/editing tool and follow its own
   skill or tool instructions. This skill owns art direction, not API mechanics.
   Never assume an external service is connected or silently switch to a paid API.

For raster requests, produce a real image when the capability is available.
For edits, use the original/reference with an explicit preserve/change contract.
For character assets, set native transparency rather than relying on prompt text.
For edits, preserve existing alpha unless the requested output changes branch.
If image creation is
unavailable, return a clearly labelled prepared brief rather than claiming to
have drawn or inspected a result. Do not replace requested art with an SVG mockup.

## Keep the style across scenes

Read the environment/composition branch in the recipes for game scenes. Preserve
character identity while adapting pose, scale, material response and lighting to
the world. Use a common ground plane, contact shadows and coherent perspective.
Separate foreground, playable plane and distant background through value and
detail hierarchy. An illustrated scene is not a runtime-tested game level.

## Inspect before delivery

Compare the actual result with the chosen anchors at full size and thumbnail size:

- Does the expression have personality and the silhouette remain readable?
- Do gesture, gaze, support/weight and camera express the intended scene beat?
- For new designs with creative latitude, do face construction, major silhouette
  and body action differ meaningfully from the nearest prior design? Keep
  deliberate uniformity when the brief requires it; do not redesign an existing
  character merely to make an individual frame novel.
- Are the ink masses, line hierarchy and crisp shadows in the same visual family?
- Do large shadows explain form and fabric tension rather than becoming arbitrary
  zigzags? Do present materials differ without making all surfaces glossy?
  Check whether hard shoe/metal highlights compete with the intended focal point.
- For adult fashion, is the requested sexual appeal visibly strong in the whole
  look, judged separately from variety, identity consistency and technical checks?
  Compare the owner's appeal example by its assigned role, keeping our rendering.
  Do posture and clothes retain this character's agency?
  Correct rendering alone is insufficient: the whole look needs personality and
  a distinctive design idea, including when clothing is closed or monochrome.
- Does the new character meet the current age, complexion and slim-build
  contract, and is the whole look striking and memorable? Color saturation is
  optional: monochrome and muted outfits can meet this goal. Exceptions must be requested,
  not introduced as a shortcut to variety.
- Are accent colors controlled and the face easy to find?
- Are references used in their assigned roles without copying an existing identity?
- For edits, are preserved features and unaffected regions still consistent?
- In a scene, do figures share scale, light and physical contact with the world?
- Does the environment match the requested kind of world? A rendering reference
  does not authorize importing fantasy landmarks into an ordinary city.
- First inventory every visible limb-shaped branch and its torso connection.
  Two correct hands do not prove there are only two arms; a hanging sleeve must
  enclose an existing arm or read clearly as empty fabric, not a third cylinder.
- Check the garment as one construction: collar/yoke, shoulder seams, armholes,
  sleeves and cuffs must share one coherent wear state. A deliberate dropped
  shoulder is allowed; contradictory attached-and-slipping parts are not.
- Trace each visible arm from its own shoulder through upper arm, elbow, forearm,
  wrist and palm. Check relative lengths, bend direction and contact under the
  sleeve; plausible fingers alone do not validate the arm.
- Check torso/pelvis rotation and each leg from hip through thigh, knee, shin,
  ankle and foot; reconcile near/far limbs and support. Broad trousers and
  attractive folds do not prove hidden construction. Preserve honest uncertainty.
- Check functional fixtures independently of the figure: mounting, connected
  parts, perspective and usable support must work. A hand gripping a nice rail
  does not validate a ladder. See the concrete checks in pose/CG direction.
- For tools/props, check the actual working contact and overlap order separately
  from the hand: tip/jaw, mating surface, insertion/force direction and grip.
- For a character asset, is the exterior actually transparent, without a painted
  checkerboard, opaque canvas, backdrop or stray ground/shadow pixels? Inspect
  hair and garment edges on light and dark grounds; retain opaque interior fabric.
- Are anatomy, hands, cropping and unwanted text/artifacts acceptable?

Known structural failures or unreadable body connections are not ready for
delivery or a human-rating batch. Correct them first or keep them internal with
a rejected/needs-correction status; label any agreed teaching anti-example. A
high appeal rating and a successful PNG decode do not waive this gate.
Fix a material mismatch with a targeted correction, preserving what already works.
Avoid an unbounded regeneration loop. Prefer one focused correction; if a larger
redesign or repeated cost is necessary, explain the issue and recommendation.
Deliver the requested image and a short account of the distinctive design choices.
Separate artistic judgment from file checks and actual runtime evidence.

## Scope and persistence

Apply this canon to subsequent illustration work in the active task. Do not claim
that installing a skill retrains a model or changes other apps/global settings.
Keep the original anchors intact; a new image becomes a replacement canon only
when the user adopts it. Put project outputs in the project's appropriate asset
location, not inside the installed skill's reference library.

For installation notes and Russian invocation examples, see
[usage-ru.md](../../assets/visual-project-skills/ink-punk/references/usage-ru.md).

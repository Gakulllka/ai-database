---
name: lisa-character
description: "Preserve the established fictional adult Lisa in character sprites, outfit variants and visual-novel scenes. Use when this project character is named or referenced, not for unrelated people named Lisa."
metadata:
  version: "1.0.1"
---

# Lisa — approved colorful homewear identity

For compact installations, use the [Database reference directory](https://github.com/Gakulllka/ai-database/tree/database/assets/visual-project-skills/lisa-character).

## Canon

- Clearly adult woman, approximately 25. Lazy, modest, reserved, relaxed; subtle
  appeal through drape, small gestures and attentive expression.
- Very slender narrow adult frame, small natural bust; do not enlarge her body
  to match Dasha. Retain mature facial features and the reference proportions.
- Dark brown bob with loose strands, carelessly gathered into a small bun.
  Green eyes, oversized square BLACK glasses with a teal repair at the temple.
  Several simple teal/coral clips in her fringe.
- Oversized saturated teal T-shirt with one shoulder exposed, soft loose folds,
  small grumpy purple CAT graphic on chest. Preserve the cat, not arbitrary text.
- Plum drawstring shorts with turned cuffs and cream ties.
- Opaque thigh-high stockings with broad alternating plum and cream horizontal
  stripes and narrow teal upper edging; slight relaxed asymmetry is acceptable.
- Coral-orange house slippers, both properly on feet. No dangling toe slipper.
- Small beige adhesive bandages on forearm and hand as in reference. Do not
  invent injuries, gore, a medical diagnosis or an explanation for them.
- Color roles: saturated teal / berry plum / warm cream / coral. The final
  approved version is colorful, not the earlier gray-beige pastel outfit.

## Acting

Relaxed shoulders, slouched or reclining weight, small shy asymmetrical smile,
sleepy lids and an attentive green-eyed glance over her glasses. In a shared
home CG she can lean into sofa cushions with a mug while watching Dasha speak.
Modest does not mean blank-faced; use restrained, readable reactions. Do not
turn her into Dasha's loud gesturing double or a childlike caricature.

## Use with the drawing style

This skill owns character identity, not a new rendering style. Use the companion
`ink-punk` skill for rendering, posing and scene composition; read its SKILL.md
from the installed skill location (normally the sibling `../ink-punk/SKILL.md`).
Do not copy its style bible into this skill. For an explicitly requested different
style, retain this identity and apply the requested rendering instead. If the
companion is missing, say so; the bundled portrait still supplies a visual anchor,
but do not pretend the full style instructions were loaded.

Resolve this skill's reference paths from its own directory. Inspect the actual
[approved full-body reference](../../assets/visual-project-skills/lisa-character/assets/homewear.png) before image generation.
Pass that PNG as an IDENTITY AND PROPORTIONS reference. It also governs clothing
when the approved outfit is requested or no clothing change was requested.
For an explicitly requested new outfit, the new clothing brief overrides the
source costume; do not lock the old garments as part of identity. A written
description alone is insufficient. Preserve the face, proportions, hair, glasses
if present, and costume details; adapt pose and lighting to the new scene.

## Scope of changes

Default to the approved homewear. New outfits, hairstyles or identity changes
require the user's request; expression, gesture, camera and environment may vary
with the scene. Do not freeze the reference pose. New clothing is a variant, not
a silent replacement of the baseline. Explicit user changes override defaults.
Do not invent unseen back-view construction as established canon; choose a
plausible continuation and distinguish it from the supplied front reference.

A standalone game character or expression sprite uses native transparent PNG
with actual alpha, no backdrop or exterior shadow. An explicitly requested
visual-novel CG has a composed environment. Never add scenery to a sprite merely
because homewear is mentioned.

For a shared Dasha/Lisa scene, load both character skills and pass each PNG with
its own identity label, plus the common drawing-style guidance. Do not blend
faces, swap clothing, exchange palettes or turn them into identical body types.
Compare the output with both references, especially face, hair, garment shape,
signature details and footwear. Preserve identity while giving each character
distinct acting, gaze and believable contact with the environment.

These references improve consistency but do not guarantee pixel-identical faces
from a generative model. Preserve originals, save versioned outputs in the project,
and correct meaningful identity drift before calling an image final. Use the
available image-generation skill/tool; this file is not a renderer or trained model.

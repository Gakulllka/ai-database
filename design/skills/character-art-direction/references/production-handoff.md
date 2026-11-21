# Production-specific handoff

Read only the section matching the requested output. Carry the visual contract and
identity invariants forward instead of creating another competing character canon.

## Character reference or turnaround

Choose views that answer the recipient's actual questions: front/side/back or a
detail view may be useful, but a fixed number is not mandatory. Keep scale,
proportions, costume construction and asymmetric features consistent across views.
Distinguish deliberate costume/pose variants from accidental identity drift.

Use neutral views to expose construction; use expressive poses to communicate
character. Do not let dramatic lighting hide the face, palette or materials needed
by the recipient. Add expressions, palette swatches or detail callouts only when
they serve the brief; avoid decorative sheet layout that makes the views too small.
An illustrated turnaround is guidance, not proof that a manufacturable or riggable
3D object exists.

## Runtime 2D brief or asset

Establish camera/orientation, intended on-screen size, backgrounds and neighboring
characters. Inspect readability in context and at 1:1 scale; use a silhouette or
grayscale comparison when it resolves a shape/contrast question. Do not force
pixel dimensions or limited palettes onto an illustrated/vector project.

When sprites or animation are requested, specify relevant canvas, pivot/baseline,
padding, alpha, direction/state list, frame counts/timing and alignment invariants.
Keep identity and scale stable between frames. Exporting a PNG or drawing a sheet
does not establish that the animation loops correctly in the consumer.

## Runtime 3D brief or asset

Identify the intended camera distance, scale/axes, presentation and target platform.
Confirm the actual need for topology/deformation, rig, facial expressions, materials,
textures and LOD/performance constraints before committing to a production format.
Do not invent polygon/texture budgets or require a rig for a static illustration.

Provide views and construction information that a modeler can reconcile. Call out
ambiguous hidden geometry, symmetry/asymmetry, attachment points and material
boundaries where they affect production. Keep generated model, textured source,
retopology derivative and rendered preview distinct; a preview image cannot verify
topology, deformation, material assignment or successful engine import.

## File and consumer verification

For files actually produced, check only relevant properties: dimensions, format,
real alpha rather than a painted checkerboard, clipping/padding, view/frame naming
and requested editable source. Inspect transparent edges on light/dark backgrounds
when transparency matters. Keep the governing references and original files.

For integration, use the project's existing engine/animation workflow and inspect
the actual consumer. Label untested integration separately from artwork approval.

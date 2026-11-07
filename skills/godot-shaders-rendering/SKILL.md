---
name: godot-shaders-rendering
description: "Design and verify Godot 2D/3D shaders, materials and rendering effects for the actual renderer and export target. Use for shader defects, visual effects or renderer compatibility."
metadata:
  origin: "Database: verified Godot primary documentation"
---

# Godot Shaders and Rendering

## When to Activate

Change shader code/material state, diagnose a visual artifact, select a rendering
effect or investigate a renderer-specific failure. A rendering change should serve
the game's requested visual behavior and measured target constraints.

## Establish the Render Profile

Record the engine version, 2D/3D pipeline, rendering method/driver, target platform,
GPU, color workflow, camera/viewport setup and relevant imported assets. Forward+,
Mobile and Compatibility expose different features; renderer names are not promises
that every device/export target supports the same effect.
Read the [renderer and material references](references/render-contracts.md).

Select the actual shader type: `canvas_item` for the 2D/canvas pipeline, `spatial`
for 3D surfaces, or the documented particle/sky/fog/compute workflow when needed.
Keep Godot 3 and Godot 4 APIs, built-ins and renderer assumptions separate.

## Implement the Effect

- Trace the visible failure through asset import, material, shader stage, lighting,
  viewport composition and final output before rewriting the effect.
- Identify coordinate spaces and units for every position, normal, direction and
  screen/texture sample. Check how transforms, camera movement and viewport size
  affect them instead of fixing a single screenshot.
- Initialize shader locals and verify uniform names/types against the shader source.
  Script bindings may differ between GDScript and C#; shader code has its own API.
- Treat a material as a potentially shared Resource. A uniform change can affect
  every user of that material; choose supported per-instance parameters or a
  deliberate resource copy when only one object should change.
- Check alpha/blend/depth behavior and render order for the selected pipeline.
  A transparent effect may change sorting, lighting and fill cost.
- Use the narrowest renderer-supported technique. Read version-specific guidance
  before relying on screen/depth reads, compute or advanced 3D features.

Keep presentation state separate from gameplay outcomes. Animation or shader time
must not accidentally advance authoritative simulation, consume RNG or award items.
Preserve source art and the project's import policy when changing resources.

## Verification

First check syntax/import diagnostics with the project's actual engine. Then inspect
the effect using the intended rendering method and representative hardware/target.
Cover relevant camera angles, viewport sizes, object instances, transparency,
lighting and animation states; compare captured output with the requested result.

A headless parse/import does not establish visual or GPU acceptance. A desktop
capture does not establish a browser/mobile export. Record the engine, renderer,
driver/device, build and observed cases; report unavailable visual checks explicitly.
Measure frame/GPU cost for performance changes instead of inferring speed from code.

## Anti-Patterns

- Switching renderers or upgrading the engine to hide an unexplained artifact.
- Changing a shared material to customize one actor.
- Treating all GLSL snippets or Godot-version shader built-ins as interchangeable.
- Claiming visual correctness or frame-rate improvement from a headless exit code.
- Using a render-only effect as the owner of gameplay progression.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md),
[godot-performance](../godot-performance/SKILL.md),
[godot-export](../godot-export/SKILL.md).

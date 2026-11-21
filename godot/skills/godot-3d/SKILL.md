---
name: godot-3d
description: "Build and review Godot 3D scenes, transforms, movement, collisions, cameras and spatial interaction. Use for 3D or mixed-dimensional gameplay."
metadata:
  origin: "Database: Godot primary documentation and GameDev reference analysis"
---

# Godot 3D Worlds and Physics

## When to Activate

Work on Node3D worlds, 3D characters, spatial cameras, imported models or physics. Choose features from the actual project profile.

## Workflow

1. Confirm engine version, renderer/target, world units, coordinate conventions, physics backend and authored model/rig import settings.
2. Distinguish local/global transforms and positions from directions. Use a suitable Basis/quaternion representation for the operation rather than composing arbitrary Euler edits.
3. Choose body and collision shapes for scripted versus simulated movement; inspect layers/masks, gravity, floor/wall behavior and nonuniform scale.
4. Apply motion in the intended physics step with the actual CharacterBody3D or rigid-body contract. Avoid double delta integration and direct transform changes that bypass the selected simulation model.
5. Separate camera, visual mesh/rig and simulation where their lifecycles differ. Inspect animation/root-motion interaction with authoritative movement.
6. Route pathfinding to godot-navigation, rendering/materials to godot-shaders-rendering and imported meshes to godot-assets-pipeline. For XR, verify the selected runtime, plugin and hardware before using its APIs.
7. Validate collision/interaction in engine and inspect camera, lighting, materials, animation and GPU behavior on a real intended renderer/device.

## Anti-Patterns

- Treating 3D as 2D with one extra coordinate.
- Assuming a backend, XR device, imported skeleton or renderer feature exists on every target.
- Reporting a headless scene load as visual or performance acceptance.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md).

## Primary Sources

- [3D transforms](https://docs.godotengine.org/en/stable/tutorials/3d/using_transforms.html)
- [CharacterBody3D](https://docs.godotengine.org/en/stable/classes/class_characterbody3d.html)
- [XR overview](https://docs.godotengine.org/en/stable/tutorials/xr/index.html)

Sources inspected on 2026-11-07. Check the selected engine's versioned docs before
using version-sensitive APIs; stable documentation can move or mark pages outdated.

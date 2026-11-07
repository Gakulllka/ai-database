---
name: godot-2d
description: "Build and review Godot 2D movement, collisions, tile worlds, cameras and interaction. Use for Node2D gameplay and 2D physics behavior."
metadata:
  origin: "Database: Godot primary documentation and GameDev reference analysis"
---

# Godot 2D Worlds and Physics

## When to Activate

Implement a 2D game or the 2D part of a mixed project; do not infer a platformer, pixel-art style or fixed viewport.

## Workflow

1. Identify gameplay axes, world scale, canvas/world/UI coordinates, camera/viewport behavior and physics tick settings from the actual project.
2. Choose the body model by behavior: scripted character motion, simulated rigid body, moving obstacle or detection area. Verify the selected class API in the engine version.
3. Keep physics movement/queries in the appropriate fixed-step lifecycle and UI/presentation in their intended callbacks. Do not multiply velocity by delta twice when a movement API already uses it.
4. Check collision shapes, enabled state, layers/masks, one-way/platform/floor policies and deferred changes. Distinguish overlap detection from collision response.
5. Preserve authored TileSet/tile-map data and version-specific tile APIs. Route pathfinding to godot-navigation; route tile collision and rendering separately.
6. Test the relevant diagonal movement, slopes, fast motion, entering/exiting areas, pause and scene transition cases. Use current-frame synchronization for physics queries.
7. Verify actual camera, texture filtering, UI scale and input on the intended display; headless physics results do not accept visual alignment.

## Anti-Patterns

- Porting 3D coordinates or an old KinematicBody example mechanically into a newer 2D project.
- Encoding movement speed per rendered frame or assuming all Area overlaps update immediately.
- Imposing one resolution, art scale or tile architecture on every 2D game.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md).

## Primary Sources

- [CharacterBody2D](https://docs.godotengine.org/en/stable/classes/class_characterbody2d.html)
- [Physics introduction](https://docs.godotengine.org/en/stable/tutorials/physics/physics_introduction.html)
- [Multiple resolutions](https://docs.godotengine.org/en/stable/tutorials/rendering/multiple_resolutions.html)

Sources inspected on 2026-11-07. Check the selected engine's versioned docs before
using version-sensitive APIs; stable documentation can move or mark pages outdated.

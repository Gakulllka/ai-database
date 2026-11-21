---
name: godot-navigation
description: "Build and diagnose Godot 2D/3D navigation maps, agent paths and avoidance. Use for pathfinding, navigation baking, movement integration and navigation performance defects."
metadata:
  origin: "Database: verified Godot primary documentation"
---

# Godot Navigation

## When to Activate

Work on pathfinding, navigation geometry, agent following, avoidance or unreachable
targets. Determine whether the game needs free-space navigation, a grid/graph or a
custom deterministic route model before introducing a NavigationAgent.

## Establish the Navigation Model

Identify the Godot version, 2D/3D world, agent movement controller, coordinate space,
map/region ownership, layers and geometry source. Use matching dimension classes;
do not transfer 2D distances or 3D clearance defaults between projects.
Read the [navigation references](references/navigation-contracts.md) for the
selected API. Current agent APIs are marked experimental in their class references.

Separate these responsibilities:

| Responsibility | What to inspect |
|---|---|
| Walkable connectivity | Baked polygon/mesh, regions, links, layers and registered map |
| Route selection | Query target, accessible start/end and path policy |
| Following | Parent movement, velocity, thresholds, physics and completion |
| Local avoidance | Agent/obstacle layers, radius, velocity and safe-velocity response |

An avoidance obstacle is not proof that path connectivity or a navigation bake has
changed. Verify the relevant obstacle/baking properties in the target version.

## Build and Follow Paths

1. Inspect geometry transforms, source filters, walkable clearance and agent size.
   Navigation clearance and avoidance radius solve different parts of movement.
2. After scene construction, procedural baking or map edits, wait for the actual
   bake/map synchronization. An early `_ready()` query can see an empty map; a
   guessed timer is not evidence that asynchronous work finished.
3. Set the target when intent changes. For active agent following, obtain the next
   path point through the version's intended physics update and handle completion.
   The agent supplies guidance; the project's controller performs movement.
4. Align speed, desired distances and physics rate so the actor does not repeatedly
   overshoot or backtrack. Avoid repathing every frame without a demonstrated need.
5. If avoidance is enabled, consume its computed safe velocity in the movement
   controller. Keep collision response and navigation state coherent.
6. Avoid reentrant path-update calls from agent callbacks. Schedule changes through
   the appropriate physics/deferred boundary for the selected API.

GDScript and C# bindings express the same engine responsibilities with different
syntax/types. Verify the actual binding instead of assuming identical method names.

## Verify the World, Not Only a Returned Path

Test reachable and unreachable targets, disconnected regions, layer filtering,
narrow passages, runtime changes and agent cleanup. Exercise multiple moving agents
when avoidance is part of the feature. Record arrival, collisions, stalls and frame
cost; a nonempty path does not prove that the actor can physically traverse it.

Use headless path assertions where supported, then visual/physics checks for the
actual controller and exported target. Report bake inputs, engine version and
observed behavior; do not rebake or replace production level assets implicitly.

## Anti-Patterns

- Treating the absence of a path before map synchronization as unreachable terrain.
- Solving every movement problem by increasing avoidance radius.
- Assuming navigation moves the parent or resolves physical collisions for it.
- Requesting a fresh route on every render frame and masking the resulting jitter.
- Converting all AI movement to navigation without considering the game's model.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md),
[godot-performance](../godot-performance/SKILL.md).

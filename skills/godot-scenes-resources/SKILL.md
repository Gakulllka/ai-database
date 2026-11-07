---
name: godot-scenes-resources
description: "Create and change Godot scenes, node ownership, resource sharing and serialized references. Use for scene composition, instancing, UID/path or lifecycle issues."
metadata:
  origin: "Database: Godot primary documentation and GameDev reference analysis"
---

# Godot Scenes and Resources

## When to Activate

Work with TSCN/TRES, PackedScene, node hierarchies, signals, autoloads or reusable components in either dimension.

## Workflow

1. Establish the selected engine/serialization version and the owning scene. Inspect inherited/instanced scenes, external/subresources, script attachments, unique names, NodePaths and UIDs before editing.
2. Keep a reusable scene responsible for a coherent behavior. Supply external dependencies explicitly through its existing interface; do not couple it to a particular world path by default.
3. Distinguish parenthood, scene ownership and resource lifetime. Adding a child is not the same as making it persist in a PackedScene; inspect owner when packing or editor-generating nodes.
4. Identify whether a Resource/material/collection is intentionally shared. Verify duplication/local-to-scene semantics in this engine and test two instances before relying on independent mutable state.
5. Preserve editor-authored layout, stable references and connection intent. Renames/moves require checking referencing scenes, animations, code and import metadata; keep version-relevant UID sidecars.
6. Review ready/tree-exit, signals, deferred callbacks and queued deletion. Re-entering a tree does not automatically promise a fresh ready callback. Treat running the importer/tool scripts as execution.
7. Validate actual engine loading and instantiate the affected scene in its intended parent/context. A text parse alone does not prove ownership, binding or exported dependency resolution.

## Anti-Patterns

- Regenerating an entire authored scene for a small property change.
- Assuming duplicate(true) isolates every resource or that add_child implies saved scene ownership.
- Deleting UID/import metadata or hand-renumbering references without version-aware impact analysis.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md).

## Primary Sources

- [Scene organization](https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html)
- [PackedScene ownership](https://docs.godotengine.org/en/stable/classes/class_packedscene.html)
- [Resource semantics](https://docs.godotengine.org/en/stable/classes/class_resource.html)

Sources inspected on 2026-11-07. Check the selected engine's versioned docs before
using version-sensitive APIs; stable documentation can move or mark pages outdated.

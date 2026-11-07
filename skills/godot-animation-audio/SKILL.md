---
name: godot-animation-audio
description: "Implement and verify Godot animation, audio buses, playback and cleanup in 2D/3D. Use for AnimationPlayer/Tree, sound transitions, pause or shutdown issues."
metadata:
  origin: "Database: Godot primary documentation and GameDev reference analysis"
---

# Godot Animation and Audio

## When to Activate

Change character/UI animation, music/SFX, positional sound, playback state or clean scene/application shutdown.

## Workflow

1. Identify animation ownership, player/tree/library, track targets, loop behavior, audio stream type, buses and active device/target.
2. Keep animation and sound reactions aligned with authoritative game events without letting replayed cues change simulation. Check root motion and method tracks for intentional gameplay effects.
3. Use AnimationTree for the actual blend/state needs and verify its linked AnimationPlayer and imported rig/track paths. Avoid two systems concurrently owning the same property.
4. Separate music/SFX/voice preferences as appropriate, control polyphony and transitions, and check positional versus nonpositional players. Repeated scene/view updates should not restart the same music accidentally.
5. Define pause/resume, interrupted/looped playback, skipped cutscenes and scene-exit cleanup. Do not assume a stopped or looping stream emits the completion event being awaited.
6. During shutdown, finish the permitted save/transition policy, stop tweens/playback and release owners according to actual engine state. Replace unexplained fixed waits with bounded lifecycle evidence.
7. Inspect rendered animation and audible output on the actual target. Headless Dummy audio and parse success cannot establish sound quality, mixing or clean native close behavior.

## Anti-Patterns

- Treating every AudioStream as the same generator playback type.
- Accumulating one player per cue without a lifecycle or measured voice budget.
- Using an arbitrary sleep to hide a leak or reporting silent headless output as audio acceptance.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md).

## Primary Sources

- [AnimationTree](https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html)
- [Audio buses](https://docs.godotengine.org/en/stable/tutorials/audio/audio_buses.html)
- [AudioStreamPlayer](https://docs.godotengine.org/en/stable/classes/class_audiostreamplayer.html)

Sources inspected on 2026-11-07. Check the selected engine's versioned docs before
using version-sensitive APIs; stable documentation can move or mark pages outdated.

---
name: godot-ui-input
description: "Build and verify Godot Control interfaces, input actions, focus and device interaction. Use for menus, HUD, touch/gamepad/keyboard controls and localized layouts."
metadata:
  origin: "Database: Godot primary documentation and GameDev reference analysis"
---

# Godot UI and Input

## When to Activate

Change a HUD, menu, in-world interface, rebinding, focus navigation or input routing for a 2D/3D game.

## Workflow

1. Identify viewport/stretch/scaling, theme/font, supported languages, devices and authored layout. Preserve an existing illustrated UI or conventional control layout as chosen by the project.
   For layout/interaction design, use the shared
   [functional UX process](../frontend-design-direction/references/functional-ux.md).
   Combine task readability and navigation with the game's existing art direction;
   do not apply a marketing-page layout to a HUD or reopen design for an input-only fix.
2. Use anchors/containers/minimum sizes according to ownership; do not fight a Container with permanent manual child positioning. Keep world, screen, canvas and local coordinates distinct.
3. Route actions through the existing InputMap. Distinguish continuous state from events and Control GUI handling from unhandled gameplay input; prevent one event from activating both unintentionally.
4. Handle focus, modal capture, gamepad navigation, touch targets and remapping. Do not assume mouse hover or one keyboard layout is sufficient.
5. Exercise resize/aspect/DPI and long/localized text, fonts/fallback, right-to-left requirements and accessibility relevant to the project.
6. Check pause, dialogs, scene transitions and repeat activation against game state. A UI fixture may display progression but must not grant it.
7. Use actual rendered/device interaction evidence for acceptance; screenshot layout and input/state assertions establish different properties.

## Anti-Patterns

- Globally copying the reference game viewport or its ban on particular UI controls.
- Hardcoding raw keys everywhere or assuming headless tests validate touch/focus rendering.
- Using scale/offset fixes that only work at one viewport without identifying the coordinate mismatch.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md).

## Primary Sources

- [Size and anchors](https://docs.godotengine.org/en/stable/tutorials/ui/size_and_anchors.html)
- [InputEvent flow](https://docs.godotengine.org/en/stable/tutorials/inputs/inputevent.html)
- [Localization](https://docs.godotengine.org/en/stable/tutorials/i18n/internationalizing_games.html)

Sources inspected on 2026-11-07. Check the selected engine's versioned docs before
using version-sensitive APIs; stable documentation can move or mark pages outdated.

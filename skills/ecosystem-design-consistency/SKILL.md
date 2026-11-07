---
name: ecosystem-design-consistency
description: "Maintain an established design system across multiple products. Use for shared token changes, theme integration, component variants and cross-product visual drift."
metadata:
  origin: "Database: DELTA reference analysis"
---

# Ecosystem Design Consistency

## When to Activate

- A product joins an existing family with an approved visual language.
- Shared tokens, theme behavior or component variants change across products.
- Similar screens drift despite referring to the same design guide.

For creating a new visual language or a standalone visual audit, use the existing
`design-system` skill (canonical `skills/design-system/SKILL.md` in Database).
This skill maintains an existing canon;
it does not redesign products or make every interface identical.

## Establish the Canon and Consumers

Find the maintained design guide, token source, shared components and the actual
consumer versions. Distinguish approved requirements, implementation drift,
intentional product variants and unresolved proposals. A newer timestamp alone
does not settle a contradiction between them.

Identify which products consume the changed rule and how: shared package, copied
CSS, local token adapter or framework theme configuration. Inspect the affected
consumers rather than assuming identical stacks. Preserve existing document and
package owners; update their maintained records within the task's scope.

## Map Meaning Before Values

Map semantic roles such as surface, text, focus and danger to each product's
existing token names. Different naming schemes can implement the same contract.
Keep component states and supported themes in that mapping; an identical hex
value does not mean two roles have the same purpose.

Preserve intentional variants, such as navigation with a fixed background or an
external system's status palette. Treat an unapproved difference as an open
decision, not permission to replace it. Do not import the reference product's
palette, fonts, layout or motion into unrelated products.

## Inspect Scope and Theme Boundaries

Before replacing literals or aliases, locate token declarations and overrides in
root themes, nested surfaces, embedded content and component wrappers. Ordinary
custom properties inherit through the DOM and resolve through the cascade;
inspect computed values at the consumer, not just a token's declaration.
[CSS custom properties specification](https://www.w3.org/TR/css-variables-1/).

A fixed dark navigation surface inside a light page may need its own foreground
mapping. A global substitution can otherwise turn a visible label into text with
the same color as its background. Keep scope-specific roles explicit.

In React, a portal retains React context while rendering into another DOM
location. Check the portal container's theme classes and CSS inheritance; context
alone does not carry an ancestor's CSS variables to that container.
[React portal reference](https://react.dev/reference/react-dom/createPortal).

Trace initial theme selection, stored preference, system preference and hydration
using the application's existing mechanism. Check the first paint as well as
theme toggling. A flash, missing font or stale portal theme can disappear before
a final screenshot while still affecting users.

## Change and Verify Incrementally

Change the smallest shared rule or local adapter that addresses the mismatch.
For a shared rename, identify lagging consumers and use compatible aliases when
a staged transition needs them; do not delete the old token before its consumers
are migrated. Avoid broad rewrites alongside a scoped consistency fix.

Verify representative affected components in supported themes and relevant
states: focus, hover, disabled, error, empty and loading. Include fixed-theme
surfaces, dialogs and popovers, long localized text and narrow layouts when
affected. Measure contrast against the rendered background; opacity and overlays
can change the result. Preserve visible focus and reduced-motion behavior.

Use existing CSS parsing, token validation and browser checks where available.
Confirm visual behavior in the browser for changes involving cascade, layout or
theme initialization. Parsing, type checking and token equality alone do not
prove the rendered result. Report the products and states actually checked,
remaining drift and any unavailable visual verification.

## Anti-Patterns

- Creating a second design canon or copying a guide into every project.
- Replacing every matching color without inspecting semantic roles and scopes.
- Treating one brand's palette or CSS conventions as universal requirements.
- Renaming every consumer's tokens only to force identical naming.
- Assuming a portal inherits the CSS scope of its React parent.
- Claiming ecosystem consistency from one product or one final screenshot.

## Related Skills

- `design-system` — create a system or audit a UI; canonical path given above.
- [frontend-patterns](../frontend-patterns/SKILL.md) — component and state design.
- [change-impact](../change-impact/SKILL.md) — shared-change consumers and risk.
- [test-collaboration](../test-collaboration/SKILL.md) — maintain test evidence.

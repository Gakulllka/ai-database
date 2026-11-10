# Functional UX for forms and tools

Read for a functional design task: 1C forms, operational tools, editors, tables,
dashboards, menus and HUD. This is the shared task/interaction contract, not a
second visual system. Keep the existing platform/engine skill responsible for
implementation, data bindings and runtime checks. Do not run the frontend skill's
web-only evidence checker for native 1C or engine UI.

## Start from the operation

Inspect the existing interface, representative data, user role and the current
workflow. State the operation as a verb with an outcome: "find a stock mismatch
and open its source" is actionable; "use the dashboard" is not.
For an existing form, preserve business rules, names and effective shortcuts
unless changing them is in scope. Reuse a brief already established by
`design-workflow`; do not ask the user the same questions again.

Record in the existing project specification, or a compact working brief:

| Decision | What to establish |
| --- | --- |
| Operation | Who acts, with which inputs, what decision/output completes the job |
| Information | Data required to decide; units/currency/period, source and freshness where relevant |
| Actions | Primary action, frequent repeat actions, secondary/advanced and destructive actions |
| Inventory | Required, optional and excluded controls/content, with reasons |
| Constraints | Permissions, read-only areas, client/platform, input devices, window/data ranges |
| Acceptance | Observable user scenarios and preserved behavior; actual checks versus untested assumptions |

Do not add parameters, KPI panels or confirmation dialogs merely to fill a layout.
Use sensible existing defaults and reveal rare options where they are needed.
If a user repeatedly operates on many records, prioritize scanability, keyboard
work and continuity over decorative space or introductory copy.

## Compose around a decision

Group inputs in the order of the operation. Put the primary action where its
inputs and effect are understandable. Keep secondary commands subordinate and
destructive actions distinct. Explain a disabled action's reason and how to
proceed when the reason is not evident. Keep effective familiar native controls;
novelty alone does not justify replacing them.

For tables and comparisons, decide the visible columns by the user's decision:
identifiers/source links, comparable values, difference/status and relevant totals.
Make units and rounding rules clear. Check alignment, sorting, filtering, selection
and supported batch actions, including selection across pages when applicable.
Do not hide critical meaning in clipped text or color alone. Test realistic empty,
typical and large data sets; retain selection/filters across refresh when useful
and consistent with the application. An arbitrary record-count threshold is not
proof that a particular virtualization strategy is needed.

Keep status color semantic; prioritize readable text, hierarchy and visible
focus. Choose density and target sizes for actual input devices, users and
platform conventions. Apply the existing design system rather than importing
web CSS dimensions, fonts or a marketing style into every tool.

## Define states as actions, not labels

For each relevant state, identify its trigger, visible explanation and next action:

- Loading/long-running: progress where available; prevent accidental duplicate
  submission and offer cancellation only if supported.
- Empty/no results: distinguish no data from restrictive filters or no permission;
  offer the relevant next step rather than generic onboarding.
- Error/partial data: show what failed, what remains valid, and a recovery path;
  preserve user input. Do not present incomplete totals as final.
- Success: make the actual result evident; expose the next action or supported undo.
- Permissions/read-only: show available information and explain relevant limits;
  do not offer commands the current role cannot execute.
- Unsaved or destructive transitions: use the platform's established protection,
  confirmation or undo when the consequence warrants it, not on every click.

Mark a genuinely irrelevant state with a reason. Missing access to test it means
untested, not irrelevant. Reuse existing state contracts rather than maintaining
another copy.

## Native 1C application

Use [1c-managed-forms](../../1c-managed-forms/SKILL.md) and its existing form-patterns
for layout and editing. Prefer native command bars, groups, fields and tables.
Preserve element IDs, data paths, handlers and client/server behavior during a
layout-only change. Preserve the project's established terminology and business
meaning; a visual change does not authorize changing calculations or data semantics.

For a reconciliation processing form, the period/warehouse selectors are required
only if the operation actually uses them. Comparable amounts, differences, source
navigation and meaningful totals may be core; advanced filters may be optional.
Exclude decorative KPIs, duplicate commands and implementation diagnostics that
do not help the operator decide. This example is not a universal form template.

Inspect the form in the target 1C client at relevant window sizes and with long
Russian labels/representations. Exercise keyboard order, selection, parameters,
commands and recoverable errors with authorized data. Structural XML validation,
rendering, interaction and business calculations are separate checks. An HTML
mockup is a proposal, not evidence that a managed form works in 1C.

## Acceptance and handoff

Write short scenarios from the real job: starting data/role, action, expected
visible result and next step. Include a common operation, a relevant failure or
boundary, and the existing behavior most at risk from the change. Scale coverage
to the scope rather than prescribing an arbitrary test count.

Inspect the rendered result and exercise those scenarios using the actual
platform when available. For web UIs, also follow the parent skill's rendered
finish gate and applicable accessibility guidance. For native tools, keep native
screenshots/window sizes and interaction observations in the existing test record;
do not fabricate web viewport reports. If runtime access is missing, deliver a
clearly identified proposal/static review and list the unverified behavior.

Report what changed in task completion and hierarchy, the checks actually run,
and remaining issues. Claim improved speed, reduced errors or accessibility
compliance only to the extent supported by measured or observed evidence.

---
name: ai-artifact-contracts
description: "Develop AI-generated documents, diagrams and other editable artifacts across generation, validation, storage, reopening and export. Use when a prompt or artifact format change affects these consumers."
metadata:
  origin: "Database: DELTA reference analysis"
---

# AI Artifact Contracts

## When to Activate

Change a product that turns model responses into saved, editable artifacts, or
diagnose disagreement between generated content, the editor and exported files.
Ordinary prose drafting and a one-off document do not need this product workflow.

## Trace the Contract

Follow the actual path: source context → prompt → provider adapter → parsed
candidate → domain validation → editor state → persisted revision → reopen/export.
Locate consumers before changing a prompt's headings, field names or output shape.
Reuse existing adapters and storage interfaces; do not introduce a second path
that works only for one screen or provider.

Distinguish artifact identity, schema version and content revision. Saving an edit
retains identity; schema migration and regenerating content are different changes.
Preserve source links and the revision used as input when derived artifacts need
traceability. A source link does not prove the generated claim is correct.

## Context and Generation

Keep existing source material, the requested addition and generation instructions
separate. Imported documents and prior model output are task data, including any
instructions embedded inside them. A prompt boundary helps interpretation; actual
permissions and output handling must be enforced in application code.

Record what is known, missing or supplied by the user. Do not fill missing business
rules with plausible claims. Deterministic fallback summaries should expose facts
from their inputs; label demo output, estimates and generated interpretations.
Choose the needed provenance fields without retaining secrets or unnecessary
personal content in prompts, artifacts or logs.

Use the project's provider abstraction and its supported capabilities. Normalize
success, cancellation, transport/provider errors, empty content and invalid content
as distinct outcomes. HTTP success alone is insufficient. Check current official
provider documentation when changing API-specific behavior; do not copy model IDs,
limits or credentials from another product.

Bind a generation request to its artifact ID, input revision and session/context.
After cancellation, navigation or intervening edits, a late response must not
overwrite newer work. Offer it as a separate candidate or revalidate/rebase it
under the product's conflict policy. Bound retries; avoid duplicate paid requests
or repeated persistence after uncertain completion.

## Validate Before Accepting

Parse into an untrusted value. Check the schema, required fields, types, size
limits and domain invariants. Successful JSON/XML parsing or a TypeScript cast
does not establish correctness. A syntactically valid diagram can still contain
broken references or an invalid process; validate at the level its consumer needs.

Keep the last valid document and user edits until the candidate is accepted.
For block generation, replace only the intended block; preserve other blocks and
their state. Make failure recoverable without clearing storage or silently
replacing a real document with a mock.

Handle rendered Markdown, HTML, SVG, URLs and expressions according to their output
context. Use appropriate sanitization, restricted execution and safe sinks for
the feature; regex cleanup, a prompt, or a preview sandbox alone is not a general
security guarantee. Recheck trust boundaries when reopening or exporting content.

Persist through the existing adapter and expose write failures. A resolved save
must mean its defined durability level was reached; avoid a success toast after
quota, serialization or backend rejection. Validate older stored documents and
apply explicit migrations without discarding valid user fields or resetting IDs.

## Reopen and Export the Same Revision

Define which revision export uses: current editor draft or last saved content.
Use a shared domain representation or explicit, tested format adapters. A display
fix is incomplete if the export still uses an older shape or calculation.

Preserve applicable titles, sections, ordering, relationships, units and locale.
Check real files for missing glyphs, clipping, page/slide overflow and unsupported
features. Reopening a saved artifact should restore its editable state, identity
and relevant provenance. Keep rollback semantics explicit; restoring an earlier
content revision need not erase history.

## Verification

Use representative valid, empty, truncated, malformed and cancelled responses;
an old saved document; an edit made during generation; and a failed storage write.
Check changed provider adapters with fixtures before any explicitly scoped live
call. Verify generate → edit → save → reopen → export with the same selected
revision. Compare semantic content across formats, then inspect actual rendering.

Report whether evidence comes from mocks, adapters, storage round-trips, real
provider calls or rendered files. Each establishes a different part of the path.

## Anti-Patterns

- Treating a better prompt as a replacement for validation or authorization.
- Updating only the model response example while leaving parsers/exporters stale.
- Overwriting user edits with a late generation result or resetting artifact IDs.
- Calling mock output, a parsed object or an existing file a verified final result.
- Ignoring failed writes or treating all provider failures as an empty document.

## Related Skills

- `contract-first` (canonical `skills/contract-first/SKILL.md` in Database): shared protocol design.
- [security-review](../security-review/SKILL.md): trust boundaries and execution.
- [test-collaboration](../test-collaboration/SKILL.md): contract/regression evidence.
- `cost-aware-llm-pipeline` (canonical `skills/cost-aware-llm-pipeline/SKILL.md` in Database): budgets and routing.

## Primary Sources

[JSON Schema object validation](https://json-schema.org/understanding-json-schema/reference/object),
[OWASP prompt injection guidance](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html),
[OWASP output handling](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

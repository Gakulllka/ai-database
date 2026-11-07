---
name: tabular-import-reconciliation
description: "Build and review CSV/XLSX imports through parsing, change previews, field selection and revision-checked application. Use when importing into existing records must preserve identity, user edits and unaffected data."
metadata:
  origin: "Database: DELTA reference analysis"
---

# Tabular Import Reconciliation

## When to Activate

- Importing a table into an existing collection rather than a disposable dataset.
- Users need to inspect changes, select rows/fields or resolve ambiguous matches.
- Repeated imports, soft deletions or concurrent edits can corrupt identity.

Reuse the existing parser, schema, storage and transaction facilities. Keep the
reconciliation core independent of its modal or page so it can be tested directly.

## Define Identity and Mutation Semantics

Identify the destination scope, schema and revision used for the comparison.
Separate record IDs from external IDs, business numbers and row positions.
Preserve raw values and meaningful leading zeros; normalize only according to
the documented field semantics. A trimmed display number is not universally a
unique identity. Include tenant/domain and relevant period in matching keys.

Decide how to handle duplicate keys within a file, across selected files and in
the destination. Surface ambiguity instead of allowing map insertion order to
choose a winner. Define repeat-import behavior and its idempotency boundary.
Unrelated imports can legitimately contain the same file or external identifier.

Distinguish a missing column, an empty cell, an explicit clear and a default.
An omitted field should not erase stored content incidentally. A soft-deleted
match requires the product's explicit skip/restore/conflict policy; importing a
row does not automatically authorize restoring or deleting existing records.

## Parse Without Writing

Return a typed intermediate result with source file/sheet/row, raw identity,
normalized fields and structured errors/warnings. Keep source locations stable
when skipping blank rows, titles or totals so messages identify the right row.

- Define supported sheets, header aliases, required columns and unknown-column
  behavior. Fail clearly on missing required headers; disclose ignored data.
- Parse numbers/dates with the selected locale and field type. Keep ambiguous
  values unresolved rather than guessing whether a comma is decimal or grouping.
  Zero, blank, invalid and absent are different states.
- Treat cells, headers, comments and file metadata as untrusted data. Apply file,
  row and cell-size limits appropriate to the existing importer. Do not execute
  macros, embedded code, external links or formulas merely to obtain a preview.
- Choose a policy for formula cells: reject, import literal text or use an
  explicitly supported value representation. Cached formula results may be stale.
  Do not silently replace a formula with a trusted business value.

Escape imported content in HTML previews. For CSV/XLSX re-export, use explicit
text cells or a target-tested formula-injection defense. Quoting CSV alone does
not provide a universal defense; round trips through spreadsheet applications
can alter escaping. Preserve canonical data separately from presentation escapes.
See [OWASP CSV Injection](https://community.owasp.org/attacks/CSV_Injection).

## Compare and Select

Build an immutable change plan against the selected destination revision.
Show creates, field updates, unchanged rows, invalid rows and ambiguous matches.
Keep before/after values and stable field keys, not just translated labels or
positional checkbox indexes. Make destructive clears/restores recognizable.

Let users choose the needed rows and fields. The eventual payload contains only
those selected operations, not every parsed row. Preserve unknown stored fields,
record IDs and unrelated rows. Replacement/deletion of a collection is a separate,
explicit mode with clearly defined scope and effects; it is not an import default.

Keep preview free of persistent writes and side effects. Cancelling it leaves the
destination unchanged. Retain enough source identity to explain the applied plan
without putting private imported contents into shared skills or diagnostic logs.

## Apply Against Current State

Revalidate identity, schema, destination scope, permission and relevant revisions
at commit time. A preview is not a lock. Compare changed fields against their
expected prior values or use the existing revision/transaction contract. If the
destination changed, rebuild the affected comparison and preserve selections only
where their meaning remains valid; do not overwrite intervening edits silently.

For HTTP resources supporting it, conditional writes can enforce this check;
see [RFC 9110 preconditions](https://www.rfc-editor.org/rfc/rfc9110.html#section-13).
Client-only comparison does not prevent a race between checking and writing.

Choose a clear atomic-batch or partial-success policy using existing facilities.
On partial success, record per-operation outcomes and retain failed operations
for resolution; never report the whole import as successful. For ambiguous
timeouts, reconcile accepted operation IDs/status before replay. Deduplication
must cover creates and any non-idempotent effects, not just file selection.

Generate IDs only for confirmed creates. Apply approved updates to existing IDs,
preserve untouched fields, and emit the sync/history metadata the project needs.
Use injected time/ID generation where it makes reconciliation tests deterministic.
Report applied, unchanged, rejected and unresolved counts; separate successful
local application from remote acknowledgement or durable persistence.

## Verify Observable Invariants

- Missing headers and ambiguous locale values cannot silently produce valid rows.
- Duplicate identities across files require a defined resolution.
- Existing updates retain IDs; unselected fields and unrelated rows survive.
- Missing columns do not erase values; selected explicit clears do clear them.
- Soft-deleted matches follow the declared policy, including denied restoration.
- Edits or permission changes after preview are rechecked during application.
- Cancellation writes nothing; retry after partial/ambiguous success duplicates
  neither creates nor downstream effects.
- Formula/HTML-like text stays inert in previews and chosen export targets.

Use synthetic tables and isolated storage for these checks. Test actual parsing,
reconciliation and commit behavior at their relevant boundaries; preview text or
a count of imported rows alone is insufficient evidence.

## Anti-Patterns

- Importing by row position, replacing the collection or rebuilding every ID.
- Silently coercing invalid values to zero or treating blank as permission to clear.
- Replaying a stale preview after the destination or permissions changed.
- Promising atomicity while sequential writes can leave an unreported partial result.
- Copying another product's key, restore rule or accepted column set as a default.

## Related Skills

- [local-first-sync](../local-first-sync/SKILL.md): propagate accepted changes.
- `contract-first` (canonical `skills/contract-first/SKILL.md` in Database): shared payload and error contracts.
- [security-review](../security-review/SKILL.md): upload and rendering boundaries.
- [test-collaboration](../test-collaboration/SKILL.md): invariant-based evidence.

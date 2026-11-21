# Trace evaluation

Read the [sample rubric](../fixtures/tdd_spec.yaml) and compare the two synthetic timelines [ordered](../fixtures/compliant_trace.jsonl) and [out of order](../fixtures/noncompliant_trace.jsonl). They are fixture inputs from the previous format, not Codex execution receipts.

The rule requires a test write and an observed failing test before implementation, followed by an observed pass. In the ordered fixture, JSONL lines 1 through 4 support those four steps in sequence. In the other fixture, implementation already exists at line 1, the test is written at line 2 and line 3 only records a pass. The required before/after chain therefore fails even though the final command passed. A report should preserve that difference.

For Codex evidence keep an ordered table with a run label, operation, path or test identity, observed result and source pointer. Quote or redact only the needed excerpts. If the start of the trace is missing or the initial file state is unknown, record that limit rather than reconstructing the order from file modification dates or prose.

An exercise may use independent cases that vary the prompt's strictness. Vary it within each paired baseline/candidate group. Keep evaluation criteria the same across the pair. Separate fixture calibration, actual run results and conclusions.

# Root-cause diagnosis for 1C

Use for an exception, wrong calculation or a previous fix that added special cases.

1. Record the observable result, independently expected result, period, user rights,
   source version and environment. Remove personal data from examples.
2. Reduce the failure to the smallest permitted scenario. Inspect the affected
   handler, its inputs/callers, query and register dependencies.
3. Form a falsifiable hypothesis: wrong period boundary, context, type, missing
   movement, repeated execution, stale extension or another evidenced cause.
4. Verify using available source/diagnostics or an authorized isolated scenario.
   Change the smallest responsible mechanism; preserve unrelated behavior.
5. Recheck the original case, a different/adjacent period, no-data case and repeated
   execution when those matter. Derive expected values from requirements.

Do not turn a sample document, employee, date or sum into a new branch in production
logic. If the target environment is unavailable, distinguish source-supported
hypotheses from a reproduced runtime cause.

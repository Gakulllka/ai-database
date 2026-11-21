# ECC and the Ito desk

ECC is the public agent tooling repository. The Ito desk is Affaan's private
ops system. ECC connects to the desk through the separately installed Itô CLI.
The [integration notes](design/ecc-ito-compute-integration.md) describe the
supported connection and its limits.

Desk-side work that touches ECC runs as bounded lane tasks. The lane-worker
doctrine (see `docs/LANE-RULES.md`) is: one worker, one task, one branch,
one PR or one receipt; real work only, meaning code edits, tests, commits
and a PR, with the final message as the receipt; no self-review loops, no
receipt ledgers, no merging to main, no publishing, no deployments, no
messages; blocked means naming exactly who or what unblocks. The doctrine
exists because unbounded agent loops were the dominant failure mode of the
desk's earlier automation.

The merge rule for anything desk-related in this repo: fixes and tests
merge freely. Anything that adds a third-party tool, a vendor-named skill,
or an external link waits for Affaan's explicit yes, recorded before merge.
The living desk plan is `docs/PLAN.md` in `Ito-Markets/ito-desk`; task
schemas and the spec book live under `docs/spec/` in the same repo. This
file only describes the relationship; the plan repo is the source of truth.

# Performance and Model Routing

The main AI remains the orchestrator. Select a model and reasoning effort for the
actual assignment from the host's available choices, rather than hard-coding a
provider's product names or an unmeasured cost/quality ratio.

| Assignment | Routing guideline |
| --- | --- |
| Bounded lookup, classification, repository exploration | Fast capable model; low or medium supported reasoning |
| Scoped implementation and focused tests | Model reliable for the actual stack; sufficient reasoning for the failure risk |
| Ambiguous planning, security, architecture or independent review | Stronger reasoning and adequate context |
| Unreliable result or unresolved evidence | Improve context or escalate capability; recheck the result |

Use explicit model/effort launch parameters when the host supports them. Omitted
fields inherit available settings. Role-level fixed fields may override a launch
choice, so preserve and account for user customizations. A full-history fork may
not accept role/model overrides; use a self-contained fresh task when needed.

Run independent reads and checks in parallel, with isolated write ownership.
Keep the orchestrator's context focused on constraints, verified outcomes and
remaining work; pass evidence locations to workers. Retain compact handoffs before
context is reduced. Do not claim a speedup or lower cost without a measurement.

## Build troubleshooting

For the development pack, delegate diagnosis to **build-error-resolver**.
Use **1c-build-resolver** or **godot-build-resolver** for those domains. The parent
applies a verified minimal correction and runs the relevant check. If the requested
role is unavailable, report the limitation and use an available scoped worker.
Do not install dependencies, delete caches/lockfiles or change permissions merely
to make a diagnostic green.

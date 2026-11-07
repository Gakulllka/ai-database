---
name: 1c-platform-tools
description: "Use bundled local helpers for 1C metadata, forms, schemas and external files. Use when a 1C workflow needs deterministic inspection, generation or validation."
metadata:
  origin: "Database: adapted from Codex_1C_Workspace_v3"
---

# 1C Platform Tools

## When to Activate

Use the operation-specific helpers when working with 1C XML, forms, data composition,
external files or an explicitly selected infobase. Other 1C skills describe the
workflow; this skill owns the shared operation resources and their dependencies.

## Resolve Resources and Target Separately

The [operation index](operations.json) identifies each guide and its resource
directory. Read only the selected `operations/<name>/operation.md` and required
references. Resolve helper paths from this skill's directory; keep the working
directory at the **consumer project's root** and pass absolute input/output paths.
Never infer the consumer project from the location of the shared Database.

Python helpers use the locally installed interpreter; most XML helpers require
`lxml`. Some image helpers require Pillow; web inspection uses `psutil`. Browser
automation has its own optional Node/Playwright dependencies. Verify availability
only for the operation being used. Do not install 1C, servers or browser runtimes
as a side effect of reading a skill.

PowerShell helpers are retained as alternatives. Use a shell supported by the
selected script and inspect its parameter block. Platform binaries and their
versions, BSP, infobase addresses, port and credentials belong to the project.

## Operation Families

| Family | Operations |
|---|---|
| Configuration | `cf-*`, `meta-*`, `support-edit`, `v8-xsd-fetch` |
| Extensions | `cfe-*` |
| Forms | `form-*`, `help-add`, `img-grid` |
| Navigation and rights | `subsystem-*`, `interface-*`, `role-*` |
| External files | `epf-*`, `erf-*` |
| Templates | `mxl-*`, `template-*` |
| Data composition | `skd-*` |
| XML exchange | `xdto-*` |
| Infobase | `db-*` |
| Web client | `web-info`, `web-test`; server administration is manual-only |

## Execution Boundaries

Local file generators and editors can overwrite selected outputs; inspect the diff
and preserve unrelated objects/UUIDs. Decompile workflows may be lossy and are for
deliberate restructuring, not routine round-trip formatting.

Infobase load/update/restore, extension administration and web publication have
external effects. Confirm the explicit target and allowed action from the user's
task; never execute them just to verify this library. Keep local registry and
credentials untracked. Do not pass secrets into generated examples or reports.

Imported helpers provide a starting implementation, not a claim that every
platform/version combination has been tested. Structural success is distinct from
platform/runtime acceptance. See the [pack guide](../../../docs/1c/README.md) for
provenance, adaptations and validation limits.

## Anti-Patterns

- Running examples from the source workspace against its assumed directories.
- Guessing database connections or silently reusing MCP credentials for a browser.
- Treating XML validation as BSL compilation or a successful database update.
- Automatically downloading Apache, exposing every service or stopping unrelated
  server processes as part of a development check.

## Related Skills

[1c-development](../1c-development/SKILL.md),
[1c-metadata](../1c-metadata/SKILL.md),
[1c-testing](../1c-testing/SKILL.md).

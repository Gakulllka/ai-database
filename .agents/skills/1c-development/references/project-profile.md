# Project-specific 1C facts

Add confirmed facts to the project's existing `AGENTS.md` and existing docs.
The [1C project example](../../../../examples/1c-project-AGENTS.md) illustrates the
minimum connection to the shared Database; replace unknowns with evidence.

| Fact | Evidence to inspect |
|---|---|
| Platform and compatibility mode | Installed platform, metadata properties, project settings |
| Configuration and BSP version | Configuration properties, embedded library and release notes |
| Authoritative source and export freshness | Repository layout, export log, selected infobase |
| Configuration vs extension vs external file | Actual metadata roots and build inputs |
| Test infobase and allowed actions | User's target and existing environment/runbook |
| Commands and working directories | Existing scripts, README and CI |
| Naming and change markers | Existing code and explicit project requirements |

The archive's `_ЕМК` suffix, `// ++ ИИ` markers, Russian business commit titles,
`.work/` location, Planfix/Google workflows and fixed agent/retry limits were
source-project conventions. Apply them only if this project's owner adopts them.
Keep ECC Conventional Commits and established project documentation otherwise.

Store `.v8-project.json`, local connection files and credentials outside tracked
content or in explicit local ignore rules. Examples contain no real connection
strings or passwords. Git history is not an infobase backup.

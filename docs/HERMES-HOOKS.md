# Hermes hook utilities

Database lifecycle hook installation is [available for Codex](../hooks/README.md). The Python scripts under `hooks/hermes/` remain available for explicit use.

| Script | Purpose |
| --- | --- |
| `config-protection.py` | Evaluate an edit request against the project’s configuration protection rules. |
| `check-console-log.py` | Inspect a changed JavaScript or TypeScript file for debug statements. |

Verify the scripts on isolated fixture input with `node tests/hermes-hooks.test.js`.

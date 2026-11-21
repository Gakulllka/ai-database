# ECC for Qoder

This directory contains ECC's native Qoder plugin manifest. The repository root
is the plugin bundle: Qoder loads the canonical `skills/`, `agents/`, and
`commands/` directories rather than copies maintained under `.qoder-plugin/`.

## Install and verify

From a reviewed checkout:

```bash
qoder plugins validate . --strict
qoder plugins install .
qoder plugins list
```

For Qoder IDE, create a ZIP whose root contains `.qoder-plugin/`, `skills/`,
`agents/`, `commands/`, `hooks/`, `scripts/`, and `.mcp.json`, then use
**Upload Plugin**. Do not upload only `.qoder-plugin/` or an individual
`SKILL.md`; both would omit referenced resources.

## Capability boundary

- Qoder discovers all compatible skills and agents from their canonical root
  directories. `commands/` remains a legacy compatibility surface; workflows
  should prefer their corresponding skills.
- The bundled `chrome-devtools` MCP server uses the same pinned `npx` launch
  contract as Codex. It is downloaded on first use and therefore requires Node,
  npm/npx, and network access.
- Database lifecycle hooks are available through the [Codex installer](../hooks/README.md).

Qoder plugin installation is separate from ECC's managed installer. Do not
combine it with a manually copied Qoder skill installation.

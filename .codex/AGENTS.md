# ECC for Codex CLI

This supplements the root `AGENTS.md` with Codex-specific guidance.

For repo navigation, surface ownership, and PR diff packet guidance, read
`docs/CODEX-NAVIGATION-GUIDE.md` after this supplement.

For native cache dependency installation and Codex 0.164.0 executable-link
rejections, use the [runtime dependency procedure](../.codex-plugin/README.md#runtime-dependencies-and-codex-01640-cache-checks).

## Model Recommendations

| Task Type | Recommended Model |
|-----------|------------------|
| Routine coding, tests, formatting | GPT-6 Luna medium |
| Complex features, architecture | GPT-6 Sol high |
| Debugging, refactoring | GPT-6 Sol high |
| Security review | GPT-6 Sol high |

## Skills Discovery

### DELTA-derived application workflows

For existing cross-product design, local/server synchronization, table import or
editable AI artifacts, select `ecosystem-design-consistency`, `local-first-sync`,
`tabular-import-reconciliation` or `ai-artifact-contracts` as applicable.
See [the source and scope guide](../docs/delta/README.md). These workflows do not
apply DELTA branding, its Git rules or its product-specific data policies.

### Local Godot extension

For Godot work, read `godot-development`, `rules/godot/` and
[the Godot pack guide](../docs/godot/README.md). Select 2D/3D, GDScript/C#,
renderer and platform branches from actual project evidence. `godot-*` and
`gdscript-patterns` have canonical skills and Codex projections. Project roles
`godot_reviewer` and `godot_build_resolver` support bounded review/diagnosis.
The GameDev reference project does not define universal game or environment defaults.

### Local 1C extension

For 1C/BSL work, start with `1c-development`, `rules/1c/` and
[the 1C pack guide](../docs/1c/README.md). The canonical `skills/1c-*` workflows
have Codex projections in `.agents/skills/`; shared operation resources live in
`1c-platform-tools`. Use `1c_reviewer` and `1c_build_resolver` project roles when
delegating a corresponding 1C task. A consumer project must supply the actual
Database location and its own target/version; do not assume its CWD is ECC.

Skills are auto-loaded from `.agents/skills/`. Each skill contains:
- `SKILL.md` — Detailed instructions and workflow
- `agents/openai.yaml` — Codex interface metadata

Available skills:
- tdd-workflow — Test-driven development with 80%+ coverage
- security-review — Comprehensive security checklist
- coding-standards — Universal coding standards
- frontend-patterns — React/Next.js patterns
- frontend-slides — Viewport-safe HTML presentations and PPTX-to-web conversion
- article-writing — Long-form writing from notes and voice references
- content-engine — Platform-native social content and repurposing
- market-research — Source-attributed market and competitor research
- investor-materials — Decks, memos, models, and one-pagers
- investor-outreach — Personalized investor outreach and follow-ups
- backend-patterns — API design, database, caching
- e2e-testing — Playwright E2E tests
- eval-harness — Eval-driven development
- strategic-compact — Context management
- api-design — REST API design patterns
- verification-loop — Build, test, lint, typecheck, security
- deep-research — Multi-source research with firecrawl and exa MCPs
- exa-search — Neural search via Exa MCP for web, code, and companies
- claude-api — Anthropic Claude API patterns and SDKs
- x-api — X/Twitter API integration for posting, threads, and analytics
- crosspost — Multi-platform content distribution
- fal-ai-media — AI image/video/audio generation via fal.ai
- dmux-workflows — Multi-agent orchestration with dmux

## MCP Servers

Treat the project-local `.codex/config.toml` as the default Codex baseline for ECC. The current ECC baseline enables GitHub, Context7, Exa, Memory, Playwright, and Sequential Thinking; add heavier extras in `~/.codex/config.toml` only when a task actually needs them.

ECC's canonical Codex section name is `[mcp_servers.context7]`. The launcher package remains `@upstash/context7-mcp`; only the TOML section name is normalized for consistency with `codex mcp list` and the reference config.

### Automatic config.toml merging

The sync script (`scripts/sync-ecc-to-codex.sh`) uses a Node-based TOML parser to safely merge ECC MCP servers into `~/.codex/config.toml`:

- **Add-only by default** — missing ECC servers are appended; existing servers are never modified or removed.
- **7 managed servers** — Supabase, Playwright, Context7, Exa, GitHub, Memory, Sequential Thinking.
- **Canonical naming** — ECC manages Context7 as `[mcp_servers.context7]`; legacy `[mcp_servers.context7-mcp]` entries are treated as aliases during updates.
- **Package-manager aware** — uses the project's configured package manager (npm/pnpm/yarn/bun) instead of hardcoding `pnpm`.
- **Drift warnings** — if an existing server's config differs from the ECC recommendation, the script logs a warning.
- **`--update-mcp`** — explicitly replaces all ECC-managed servers with the latest recommended config (safely removes subtables like `[mcp_servers.supabase.env]`).
- **User config is always preserved** — custom servers, args, env vars, and credentials outside ECC-managed sections are never touched.

## External Action Boundaries

Treat networked tools as read-only by default. Search, inspect, and draft freely within the user's requested scope, but require explicit user approval before posting, publishing, pushing, merging, opening paid jobs, dispatching remote agents, changing third-party resources, or modifying credentials.

When approval is ambiguous, produce a local plan or draft artifact instead of taking the external action. Preserve user config and private state unless the user specifically asks for a scoped change.

## Multi-Agent Support

Codex now supports multi-agent workflows behind the experimental `features.multi_agent` flag.

- Enable it in `.codex/config.toml` with `[features] multi_agent = true`
- Define project-local roles under `[agents.<name>]`
- Point each role at a TOML layer under `.codex/agents/`
- Use `/agent` inside Codex CLI to inspect and steer child agents

Sample role configs in this repo:
- `.codex/agents/explorer.toml` — read-only evidence gathering
- `.codex/agents/reviewer.toml` — correctness/security review
- `.codex/agents/docs-researcher.toml` — API and release-note verification

## Key Differences from Claude Code

| Feature | Claude Code | Codex CLI |
|---------|------------|-----------|
| Hooks | 8+ event types | Reviewed native subset with explicit trust in `/hooks` |
| Context file | CLAUDE.md + AGENTS.md | AGENTS.md only |
| Skills | Skills loaded via plugin | Native plugin skills and repo `.agents/skills/` |
| Commands | `/slash` commands | Instruction-based |
| Agents | Subagent Task tool | Multi-agent via `/agent` and `[agents.<name>]` roles |
| Security | Hook profiles + sandbox | Trusted hook subset + instruction + sandbox |
| MCP | Full support | Supported via `config.toml` and `codex mcp add` |

## Security with Narrower Hooks

Codex supports a narrower native hook subset than Claude Code, with explicit trust in `/hooks`. Treat those reviewed hooks as one layer alongside instructions and the sandbox:
1. Always validate inputs at system boundaries
2. Never hardcode secrets — use environment variables
3. Run `npm audit` / `pip audit` before committing
4. Review `git diff` before every push
5. Use `sandbox_mode = "workspace-write"` in config

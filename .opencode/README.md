# OpenCode ECC Plugin

> WARNING: This README is specific to OpenCode usage.
> If you installed ECC via npm (e.g. `npm install opencode-ecc`), refer to the root README instead.

ECC plugin for OpenCode - agents, commands, tools, and skills.

## Installation

## Installation Overview

There are two ways to use ECC:

1. **npm package (recommended for most users)**
   Install via npm/bun/yarn and use the `ecc-install` CLI to set up rules and agents.

2. **Direct clone / plugin mode**
   Clone the repository and run OpenCode directly inside it.

Choose the method that matches your workflow below.

### Option 1: npm Package

```bash
npm install ecc-universal
```

Add to your `opencode.json`:

```json
{
  "plugin": ["ecc-universal"]
}
```

This loads the ECC OpenCode plugin module from npm:
- hook/event integrations
- bundled custom tools exported by the plugin

It does **not** auto-register the full ECC command/agent/instruction catalog in your project config. For the full OpenCode setup, either:
- run OpenCode inside this repository, or
- copy the relevant `.opencode/commands/`, `.opencode/prompts/`, `.opencode/instructions/`, and the `instructions`, `agent`, and `command` config entries into your own project

After installation, the `ecc-install` CLI is also available:

```bash
npx ecc-universal install typescript
```

### Option 2: Direct Use

Clone and run OpenCode in the repository:

```bash
git clone https://github.com/affaan-m/ECC
cd ECC
opencode
```

If you also want to apply the ECC home install
(`node scripts/install-apply.js --target opencode --profile full`), build the
plugin first so the compiled payload at `.opencode/dist/` exists:

```bash
node scripts/build-opencode.js   # or: npm run build:opencode
node scripts/install-apply.js --target opencode --profile full
```

Without `.opencode/dist/index.js`, OpenCode will detect the slash commands
but silently skip plugin hooks and tools. The installer now fails fast with
a pointer to this command if the build step is missing.

## Features

### Agents (26)

| Agent | Description |
|-------|-------------|
| build | Primary coding agent for development work |
| planner | Implementation planning |
| architect | System design |
| code-reviewer | Code review |
| security-reviewer | Security analysis |
| tdd-guide | Test-driven development |
| build-error-resolver | Build error fixes |
| e2e-runner | E2E testing |
| doc-updater | Documentation |
| refactor-cleaner | Dead code cleanup |
| go-reviewer | Go code review |
| go-build-resolver | Go build errors |
| database-reviewer | Database optimization |
| docs-lookup | Documentation lookup via Context7 |
| harness-optimizer | Harness config tuning |
| java-reviewer | Java code review |
| java-build-resolver | Java build errors |
| kotlin-reviewer | Kotlin code review |
| kotlin-build-resolver | Kotlin build errors |
| loop-operator | Autonomous loop execution |
| php-reviewer | PHP code review |
| python-reviewer | Python code review |
| rust-reviewer | Rust code review |
| rust-build-resolver | Rust build errors |
| cpp-reviewer | C++ code review |
| cpp-build-resolver | C++ build errors |

### Commands (26)

| Command | Description |
|---------|-------------|
| `/plan` | Create implementation plan |
| `/tdd` | TDD workflow |
| `/code-review` | Review code changes |
| `/security` | Security review |
| `/build-fix` | Fix build errors |
| `/e2e` | E2E tests |
| `/refactor-clean` | Remove dead code |
| `/orchestrate` | Multi-agent workflow |
| `/learn` | Extract patterns |
| `/checkpoint` | Save progress |
| `/verify` | Verification loop |
| `/eval` | Evaluation |
| `/update-docs` | Update docs |
| `/update-codemaps` | Update codemaps |
| `/test-coverage` | Coverage analysis |
| `/setup-pm` | Package manager |
| `/go-review` | Go code review |
| `/go-test` | Go TDD |
| `/go-build` | Go build fix |
| `/skill-create` | Generate skills |
| `/instinct-status` | View instincts |
| `/instinct-import` | Import instincts |
| `/instinct-export` | Export instincts |
| `/evolve` | Cluster instincts |
| `/promote` | Promote project instincts |
| `/projects` | List known projects |

### Lifecycle hooks

Database lifecycle hook installation is [available for Codex](../hooks/README.md). Both the named OpenCode 1.x entry and the default 2.x entry expose the on-demand tools below.

### Custom Tools

| Tool | Description |
|------|-------------|
| run-tests | Run test suite with options |
| check-coverage | Analyze test coverage |
| security-audit | Security vulnerability scan |
| format-code | Detect formatter and return command |
| lint-check | Detect linter and return command |
| git-summary | Generate git summary with branch, status, and diff |
| changed-files | List files changed in session as a navigable tree |
| dependency-analyzer | Analyze dependencies for outdated, vulnerable, and unused packages |

## Skills

The default OpenCode config loads 11 curated ECC skills via the `instructions` array:

- coding-standards
- backend-patterns
- frontend-patterns
- frontend-slides
- tdd-workflow
- strategic-compact
- eval-harness
- verification-loop
- api-design
- e2e-testing

Additional specialized skills are shipped in `skills/` but not loaded by default to keep OpenCode sessions lean:

- article-writing
- content-engine

## Configuration

Full configuration in `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "skills/tdd-workflow/SKILL.md",
    "skills/coding-standards/SKILL.md"
  ],
  "agent": { /* 12 agents */ },
  "command": { /* 24 commands */ }
}
```

The reference config intentionally leaves model selection to OpenCode. Connect a
provider and select a model in OpenCode; ECC's primary agent uses that global
selection, and its subagents inherit the invoking primary agent's model.

## License

MIT

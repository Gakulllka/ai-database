# Curation

pi/core includes 118 of 283 skills and 24 of 98 commands from the root of ECC.
Everything excluded is listed here with its reason.

## Rules

Include: language/framework skills; testing/TDD; code review; security review (non-offensive); planning; refactoring; docs; git/PR workflows; prompt commands that are pure prompt workflows.

Exclude anything that:
- makes network calls, needs API keys, or downloads at runtime (npx, pip install, curl|sh)
- wraps third-party SaaS (exa, context7, fal, videodb, x-api, social/marketing/SEO/outreach)
- integrates commercial products (ECC Tools, ecc.tools, AgentShield, billing/ops skills)
- depends on Claude-Code-only mechanics (hooks, agent rosters/orch-*, continuous-learning, loops, hookify, cost tracking, session save/resume, gateguard)
- venture-specific (ito-*, prediction-market-*, hermes-*, nasiko-*, openclaw-*, x402)
- niche domain pack (healthcare/HIPAA, supply chain/logistics, homelab, scientific, visa/legal docs) or offensive security (bug bounty)

## Excluded skills

| Skill | Reason |
|---|---|
| `1c-bsl-patterns` | Optional Database 1C pack with platform-specific tools. |
| `1c-data-composition` | Optional Database 1C pack with platform-specific tools. |
| `1c-development` | Optional Database 1C pack with platform-specific tools. |
| `1c-extensions` | Optional Database 1C pack with platform-specific tools. |
| `1c-external-files` | Optional Database 1C pack with platform-specific tools. |
| `1c-infobase` | Optional Database 1C pack with platform-specific tools. |
| `1c-managed-forms` | Optional Database 1C pack with platform-specific tools. |
| `1c-metadata` | Optional Database 1C pack with platform-specific tools. |
| `1c-mxl-templates` | Optional Database 1C pack with platform-specific tools. |
| `1c-platform-tools` | Optional Database 1C pack with platform-specific tools. |
| `1c-testing` | Optional Database 1C pack with platform-specific tools. |
| `1c-web-client` | Optional Database 1C pack with platform-specific tools. |
| `1c-xdto` | Optional Database 1C pack with platform-specific tools. |
| `acid-clay` | Optional Visual project pack with separate reference artwork. |
| `adult-comic` | Optional Visual project pack with separate reference artwork. |
| `ai-artifact-contracts` | Optional Database cross-product and data workflows. |
| `botanical-mechanics` | Optional Visual project pack with separate reference artwork. |
| `character-art-direction` | Optional Database task-based design pack. |
| `clear-replies` | Optional Database learning workflows for Codex. |
| `database-evolution` | Database owner maintenance and publication workflow. |
| `design-workflow` | Optional Database task-based design pack. |
| `dirty-horror` | Optional Visual project pack with separate reference artwork. |
| `ecosystem-design-consistency` | Optional Database cross-product and data workflows. |
| `evidence-research` | Optional Database learning workflows for Codex. |
| `game-playtest` | Optional Database player-testing skill for Codex. |
| `game-balance` | Optional Database game balancing skill. |
| `game-art-production` | Optional Visual project pack with separate reference artwork. |
| `gdscript-patterns` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-2d` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-3d` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-animation-audio` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-assets-pipeline` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-csharp` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-development` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-editor-extensions` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-export` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-gameplay` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-navigation` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-networking` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-performance` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-save-load` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-scenes-resources` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-shaders-rendering` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `godot-ui-input` | Optional Database Godot pack. Core has portable upstream Godot guidance. |
| `indie-grotesque` | Optional Visual project pack with separate reference artwork. |
| `ink-punk` | Optional Visual project pack with separate reference artwork. |
| `learn-eval` | Optional Database learning workflows for Codex. |
| `learning-lab` | Optional Database learning workflows for Codex. |
| `local-first-sync` | Optional Database cross-product and data workflows. |
| `model-texture-restyle` | Optional Visual project pack with separate reference artwork. |
| `paper-dream-theatre` | Optional Visual project pack with separate reference artwork. |
| `planfix-tracker` | requires a separately configured Planfix API connection |
| `pop-animation` | Optional Visual project pack with separate reference artwork. |
| `tabular-import-reconciliation` | Optional Database cross-product and data workflows. |
| `visual-design-base` | Optional Visual project pack with separate reference artwork. |
| `visual-design-practice` | Optional Visual project pack with separate reference artwork. |
| `visual-novel-art` | Optional Visual project pack with separate reference artwork. |
| `visual-quality-review` | Optional Visual project pack with separate reference artwork. |
| `visual-style-development` | Optional Visual project pack with separate reference artwork. |
| `agent-sort` | ECC install planner over the full ECC catalog; not portable |
| `agentic-os` | Claude-Code-only persistent OS mechanics (slash commands, memory, schedules) |
| `ai-regression-testing` | workflow creates Claude Code custom slash commands (.claude/commands) |
| `article-writing` | content/marketing writing, not engineering |
| `automation-audit-ops` | ECC ops audit of hooks/connectors/MCP surfaces |
| `autonomous-agent-harness` | Claude-Code-only autonomous harness (hooks, scheduling, computer use) |
| `autonomous-loops` | Claude-Code-only autonomous loops |
| `blender-motion-state-inspection` | niche 3D/Blender domain pack |
| `browser-qa` | requires a browser automation MCP server at runtime |
| `canary-watch` | makes network calls to deployed URLs |
| `ck` | Claude-Code-only persistent memory commands |
| `config-gc` | Claude-Code-only config garbage collection (~/.claude) |
| `config-health` | Claude Code startup hook and configuration monitoring |
| `configure-ecc` | ECC-specific setup wizard |
| `content-engine` | social/marketing content system |
| `continuous-agent-loop` | continuous agent loops |
| `continuous-learning` | Claude-Code-only hooks-based continuous learning (deprecated) |
| `continuous-learning-v2` | Claude-Code-only hooks-based continuous learning |
| `council-multi-model` | requires external Codex CLI at runtime |
| `counterparty-channel-discipline` | agent messaging ops policy |
| `ecc-contribution-review` | ECC-specific contribution packet compiler over repository manifests and cross-harness review evidence |
| `data-scraper-agent` | scheduled network scraping agent |
| `deep-research` | requires firecrawl and exa SaaS MCP tools |
| `delivery-gate` | Claude-Code-only stop hook |
| `dmux-workflows` | multi-agent orchestration via dmux |
| `documentation-lookup` | wraps Context7 SaaS MCP |
| `dynamic-workflow-mode` | Claude dynamic workflow mode mechanics |
| `ecc-guide` | ECC repository self-reference |
| `ecc-recipes` | ECC command catalog self-reference |
| `ecc-tools-cost-audit` | ECC Tools commercial billing/ops |
| `enterprise-agent-ops` | agent runtime ops, not portable engineering |
| `eval-harness` | reads and writes .claude/evals (Claude-Code-only) |
| `frontend-design-direction` | ECC-specific design direction |
| `frontend-slides` | presentation/content production, not engineering |
| `gan-style-harness` | Claude-Code-only generator/evaluator harness |
| `generating-python-installer` | niche Windows installer packaging with runtime downloads |
| `github-ops` | makes GitHub API calls via gh at runtime |
| `google-workspace-ops` | wraps Google Workspace SaaS |
| `growth-log` | ECC learning-log workflow |
| `homelab-network-readiness` | homelab niche domain pack |
| `homelab-network-setup` | homelab niche domain pack |
| `homelab-pihole-dns` | homelab niche domain pack |
| `homelab-vlan-segmentation` | homelab niche domain pack |
| `homelab-wireguard-vpn` | homelab niche domain pack |
| `hookify-rules` | hookify (Claude-Code-only hooks) |
| `i18n-sync` | built around a third-party npm CLI (locakit) with external source links; not self-contained |
| `ios-icon-gen` | Iconify API network calls at runtime |
| `iterative-retrieval` | multi-agent subagent context mechanics; links to external social post |
| `knowledge-ops` | ops skill over MCP memory and vector stores |
| `laravel-plugin-discovery` | wraps LaraPlugins.io SaaS MCP |
| `loop-design-check` | agent loop design mechanics |
| `messages-ops` | messaging ops skill |
| `netmiko-ssh-automation` | network-device ops niche; SSH at runtime |
| `network-bgp-diagnostics` | network ops niche domain |
| `network-config-validation` | network ops niche domain |
| `network-interface-health` | network ops niche domain |
| `nodejs-keccak256` | crypto/EVM niche domain |
| `nutrient-document-processing` | wraps Nutrient DWS SaaS API |
| `opensource-pipeline` | multi-agent roster pipeline |
| `orch-add-feature` | Claude-Code-only orch-* orchestration |
| `orch-build-mvp` | Claude-Code-only orch-* orchestration |
| `orch-change-feature` | Claude-Code-only orch-* orchestration |
| `orch-fix-defect` | Claude-Code-only orch-* orchestration |
| `orch-pipeline` | Claude-Code-only orch-* orchestration |
| `orch-refine-code` | Claude-Code-only orch-* orchestration |
| `plan-canvas` | Claude-Code-only plan canvas server |
| `plan-orchestrate` | ECC orchestration prompt generator over the full catalog |
| `prompt-optimizer` | ECC command/agent catalog self-reference |
| `ralphinho-rfc-pipeline` | multi-agent DAG orchestration |
| `recsys-pipeline-architect` | installs upstream package via npx skills add |
| `recursive-decision-ledger` | recursive prompting loops |
| `research-ops` | ECC ops research workflow with network enrichment |
| `roundhouse-x402` | hosted x402 service discovery and settlement integration |
| `rules-distill` | Claude-Code-only rules distillation mechanics |
| `safety-guard` | Claude-Code-only PreToolUse hooks |
| `santa-method` | multi-agent adversarial review roster |
| `scientific-db-openalex-database` | scientific niche domain pack |
| `scientific-thinking-literature-review` | scientific niche domain pack |
| `search-first` | network searches (npm/PyPI/GitHub) at runtime |
| `skill-comply` | runs agent rosters for compliance checks |
| `skill-scout` | network searches of skill marketplaces |
| `skill-stocktake` | subagent-based Claude skill audit |
| `strategic-compact` | Claude Code session compaction mechanics |
| `team-agent-orchestration` | agent squad orchestration |
| `team-builder` | Claude agents roster picker |
| `terraform-patterns` | infrastructure-as-code guidance that targets live cloud accounts; outside the curated Pi-core profile |
| `terminal-opener` | ECC harness utility, not engineering content |
| `terminal-ops` | ECC ops workflow |
| `tinystruct-patterns` | niche single-framework pack |
| `token-budget-advisor` | session/token mechanics |
| `ui-demo` | Playwright video recording with runtime installs |
| `ui-to-vue` | runs an npx converter package at runtime |
| `uncloud` | niche cluster ops |
| `unified-memory` | ECC memory vault (session save/resume family) |
| `windows-desktop-e2e` | niche Windows desktop automation; pip installs at runtime |
| `workspace-surface-audit` | ECC harness surface audit |
| `prompt-caching-strategy` | Provider-specific cache economics and runtime measurement are outside the curated Pi core. |
| `osint-investigation` | External source investigation and evidence collection are outside the curated offline Pi core. |
| `mcp-dependency-review` | MCP server configuration and selector review are outside the curated Pi core. |
| `agent-runtime-gateway-smoke-test` | requires authenticated network gateways and remote sandbox callbacks at runtime |
| `brownfield-retrospective` | depends on the ECC specialist agent roster and spec-miner dispatch workflow; not a compact portable Pi prompt |
| `deepseek-harness-setup` | configures an external DeepSeek provider and Claude-Code-specific credentials and hook integration |
| `story-lifecycle` | Requires ECC agent workflow handoffs and a local Node ledger; native Pi delivery has not been validated. |
| `issue-review` | Requires authenticated GitHub reads and optional remote issue mutations through gh; outside the offline core profile. |
| `leanrea` | specialized local binary reverse-engineering workflow |
| `platform-factory` | optional third-party OCI and microVM operator workflow |

## Excluded commands

| Command | Reason |
|---|---|
| `auto-update` | ECC self-update/reinstall |
| `checkpoint` | writes .claude/checkpoints.log (Claude-Code-only) |
| `cost-report` | Claude Code cost tracking |
| `cpp-build` | invokes ECC agent roster (cpp-build-resolver) |
| `cpp-review` | invokes ECC agent roster (cpp-reviewer) |
| `ecc-guide` | ECC repository self-reference |
| `epic-claim` | GitHub epic ops over ECC coordination state; network |
| `epic-decompose` | GitHub epic ops over ECC coordination state; network |
| `epic-publish` | GitHub epic ops over ECC coordination state; network |
| `epic-review` | GitHub epic ops over ECC coordination state; network |
| `epic-sync` | GitHub epic ops over ECC coordination state; network |
| `epic-unblock` | GitHub epic ops over ECC coordination state; network |
| `epic-validate` | GitHub epic ops over ECC coordination state; network |
| `evolve` | instincts/continuous-learning mechanics |
| `flutter-build` | invokes ECC agent roster (dart-build-resolver) |
| `flutter-review` | invokes ECC agent roster (flutter-reviewer) |
| `gan-build` | GAN generator/evaluator loop harness |
| `gan-design` | GAN generator/evaluator loop harness |
| `go-build` | invokes ECC agent roster (go-build-resolver) |
| `go-review` | invokes ECC agent roster (go-reviewer) |
| `harness-audit` | ECC harness audit |
| `hookify-configure` | hookify (Claude-Code-only hooks) |
| `hookify-help` | hookify (Claude-Code-only hooks) |
| `hookify-list` | hookify (Claude-Code-only hooks) |
| `hookify` | hookify (Claude-Code-only hooks) |
| `instinct-export` | instincts (continuous-learning) |
| `instinct-import` | instincts (continuous-learning) |
| `instinct-status` | instincts (continuous-learning) |
| `jira` | wraps Jira SaaS API |
| `kotlin-build` | invokes ECC agent roster (kotlin-build-resolver) |
| `kotlin-review` | invokes ECC agent roster (kotlin-reviewer) |
| `learn-eval` | continuous-learning session extraction |
| `learn` | continuous-learning session extraction |
| `loop-start` | autonomous loops |
| `loop-status` | autonomous loops |
| `marketing-campaign` | marketing |
| `model-route` | ECC model routing/cost mechanics |
| `multi-backend` | multi-model orchestration |
| `multi-execute` | multi-model orchestration |
| `multi-frontend` | multi-model orchestration |
| `multi-plan` | multi-model orchestration |
| `multi-workflow` | multi-model orchestration |
| `orch-add-feature` | Claude-Code-only orch-* orchestration |
| `orch-build-mvp` | Claude-Code-only orch-* orchestration |
| `orch-change-feature` | Claude-Code-only orch-* orchestration |
| `orch-fix-defect` | Claude-Code-only orch-* orchestration |
| `orch-refine-code` | Claude-Code-only orch-* orchestration |
| `orch-review` | Claude-Code-only orch-* orchestration |
| `plan-canvas` | Claude-Code-only plan canvas server |
| `pm2` | PM2 runtime process manager ops |
| `project-init` | ECC install-manifest onboarding plan |
| `projects` | instincts (continuous-learning) |
| `promote` | instincts (continuous-learning) |
| `prune` | instincts (continuous-learning) |
| `python-review` | invokes ECC agent roster (python-reviewer) |
| `quality-gate` | drives the ECC PostToolUse formatter hook script |
| `react-build` | invokes ECC agent roster (react-build-resolver) |
| `react-review` | invokes ECC agent roster (react-reviewer) |
| `resume-session` | Claude Code session save/resume (~/.claude/session-data) |
| `review-pr` | invokes ECC agent roster (specialized review agents) |
| `rust-build` | invokes ECC agent roster (rust-build-resolver) |
| `rust-review` | invokes ECC agent roster (rust-reviewer) |
| `santa-loop` | multi-agent adversarial review loop |
| `save-session` | Claude Code session save/resume (~/.claude/session-data) |
| `security-scan` | wraps AgentShield commercial product |
| `sessions` | Claude Code session management |
| `setup-pm` | runs an ECC repo script (scripts/setup-package-manager.js) |
| `skill-create` | Claude Code skill authoring plus instincts |
| `skill-health` | ECC skill analytics dashboard |
| `skill-host-compat` | runs an ECC repo CI script (scripts/ci/validate-skill-host-compat.js) |
| `vue-review` | invokes ECC agent roster (vue-reviewer) |
| `token-card` | Requires the tokenchit CLI and provider session logs via the token-card skill. |
| `astra-review` | requires an external Codex CLI and cross-provider review authorization at runtime |
| `issue-review` | Compatibility shim for the authenticated issue-review workflow; outside the offline core profile. |

## Renames

- `council` is shipped as `ecc-council` inside pi/core (the root skill keeps its original name).

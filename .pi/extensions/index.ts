/** Pi adapter for explicit command input and install diagnostics. */

import { execFileSync } from "node:child_process"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { resolveHookRuntime } from "./hook-runtime.js"
import { createCommandBodyReader, handlePiInputEvent } from "./input-args.js"

/**
 * Minimal structural types mirroring `@earendil-works/pi-coding-agent`.
 *
 * Declared locally on purpose: Pi loads extensions through jiti, which strips
 * types without type-checking, so importing the package would add a dependency
 * and a lockfile entry that buy nothing at runtime. Field names and signatures
 * match the upstream `ExtensionAPI` / `ExtensionContext` declarations; install
 * the package as a devDependency if you want editor-level checking.
 */
interface PiUiContext {
  notify(message: string, type?: "info" | "warning" | "error"): void
}

interface PiSessionManager {
  getSessionId(): string
  getSessionFile(): string | undefined
}

interface ExtensionContext {
  ui: PiUiContext
  cwd: string
  sessionManager: PiSessionManager
}

interface PiSlashCommandInfo { name: string; source: "extension" | "prompt" | "skill"; sourceInfo: { path: string } }

interface InputEvent { text: string; source: "interactive" | "rpc" | "extension"; streamingBehavior?: "steer" | "followUp" }

type InputEventResult = { action: "continue" } | { action: "transform"; text: string }

interface ExtensionAPI {
  getCommands(): PiSlashCommandInfo[]
  on(
    event: "input",
    handler: (event: InputEvent, ctx: ExtensionContext) => Promise<InputEventResult> | InputEventResult
  ): void
  registerCommand(
    name: string,
    options: {
      description?: string
      handler: (args: string, ctx: ExtensionContext) => Promise<void>
    }
  ): void
  sendMessage(
    message: { customType: string; content: string; display: boolean; details?: unknown },
    options?: { triggerTurn?: boolean; deliverAs?: "steer" | "followUp" | "nextTurn" }
  ): void
}

/**
 * ECC package root. This file lives at `<root>/.pi/extensions/index.ts`, so the
 * root is two levels up. Pi loads extensions via jiti in CommonJS mode, which
 * is why `__dirname` is the correct primitive here rather than
 * `import.meta.url` (verified against Pi 0.84.1).
 */
const ECC_ROOT = path.resolve(__dirname, "..", "..")

/**
 * Portable engineering rules available for Pi project guidance, read from the canonical
 * `rules/common/` directory at runtime. Nothing is copied or generated.
 *
 * Excluded on purpose: `agents.md`, `hooks.md`, and `performance.md`. Those
 * describe Claude Code primitives Pi does not have (Task/TodoWrite delegation,
 * Claude hook event types, thinking-budget toggles), so adding them to Pi project guidance would
 * instruct the model to use tools that are not there.
 */
const PORTABLE_RULE_FILES = [
  "coding-style.md",
  "testing.md",
  "security.md",
  "git-workflow.md",
  "patterns.md",
  "development-workflow.md",
  "code-review.md",
] as const

/** Upper bound on rule text counted by ecc-doctor. */
const MAX_RULES_BYTES = 32 * 1024

/** Values ECC treats as "off" across its existing environment switches. */
const DISABLED_VALUES = new Set(["0", "false", "off", "none", "disabled"])

/**
 * Optional Pi companion packages. ECC works without every one of these; they
 * are reported by `/ecc-doctor` so users can see which extras are available.
 *
 * These are capability names, not exact install specs. See
 * `findInstalledCompanion` for how an entry is matched against what Pi has
 * actually installed.
 */
const COMPANION_PACKAGES = [
  "pi-subagents",
  "@juicesharp/rpiv-ask-user-question",
  "@juicesharp/rpiv-todo",
] as const

function isDisabledByEnv(value: string | undefined): boolean {
  return typeof value === "string" && DISABLED_VALUES.has(value.trim().toLowerCase())
}

/** Memoized so the rule files are read once per session, not once per turn. */
let cachedRules: string | null | undefined

/**
 * How many of `PORTABLE_RULE_FILES` actually made it into `cachedRules`.
 *
 * Kept alongside the cache because `loadPortableRules` silently drops files it
 * cannot read, files that are empty, and every file past the size cap — so the
 * allowlist length would overstate a partial install in `/ecc-doctor`, which is
 * the one place a user looks to find exactly that.
 */
let cachedRuleFileCount = 0

/**
 * ECC's portable engineering rules, concatenated from the canonical
 * `rules/common/` directory of the installed package.
 *
 * Returns null when disabled via `ECC_PI_RULES` or when no rule file could be
 * read, so a partial install degrades to "no rules" instead of failing.
 */
function loadPortableRules(): string | null {
  if (cachedRules !== undefined) {
    return cachedRules
  }

  if (isDisabledByEnv(process.env.ECC_PI_RULES)) {
    cachedRules = null
    cachedRuleFileCount = 0
    return cachedRules
  }

  const sections: string[] = []
  let total = 0

  for (const file of PORTABLE_RULE_FILES) {
    let text: string
    try {
      text = fs.readFileSync(path.join(ECC_ROOT, "rules", "common", file), "utf8").trim()
    } catch {
      continue
    }

    if (!text) {
      continue
    }

    if (total + text.length > MAX_RULES_BYTES) {
      break
    }

    total += text.length
    sections.push(text)
  }

  cachedRules = sections.length > 0 ? sections.join("\n\n---\n\n") : null
  cachedRuleFileCount = sections.length
  return cachedRules
}

/**
 * Pi's config directory, honoring the documented `PI_CODING_AGENT_DIR` override.
 */
function resolvePiConfigDir(): string {
  const override = process.env.PI_CODING_AGENT_DIR
  if (override && override.trim()) {
    return override.trim()
  }
  return path.join(os.homedir(), ".pi", "agent")
}

/**
 * Package names Pi currently has installed, read from the same `packages`
 * lists Pi itself uses: the user config directory plus the project-local
 * `.pi/settings.json`.
 *
 * `require.resolve` cannot answer this. Pi installs packages under its own
 * config directory (`<config>/npm`, `<config>/git`), which is not on Node's
 * module resolution path from this file, so resolving would report every
 * companion as missing no matter what the user has installed.
 */
function listInstalledPiPackages(projectDir: string): Set<string> {
  const names = new Set<string>()

  const settingsFiles = [
    path.join(resolvePiConfigDir(), "settings.json"),
    path.join(projectDir, ".pi", "settings.json"),
  ]

  for (const file of settingsFiles) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as { packages?: unknown }
      if (!Array.isArray(parsed.packages)) {
        continue
      }
      for (const entry of parsed.packages) {
        const name = normalizePiPackageName(entry)
        if (name) {
          names.add(name)
        }
      }
    } catch {
      // Missing or unreadable settings are simply "nothing installed here".
    }
  }

  return names
}

/**
 * Reduce a `packages` entry to a bare package name.
 *
 * An entry is either the source string itself or an object carrying that
 * string under `source` alongside resource filters (`{ source: "npm:x",
 * skills: [] }`). Pi accepts both forms, and a filtered package is just as
 * installed as a plain one, so both must resolve to the same name.
 *
 * Sources look like `npm:pi-subagents`, `npm:@scope/name@1.2.3`, a git source,
 * or a filesystem path. Only npm sources carry a comparable package name.
 */
function normalizePiPackageName(entry: unknown): string | undefined {
  const source = entry && typeof entry === "object" ? (entry as { source?: unknown }).source : entry

  if (typeof source !== "string" || !source.startsWith("npm:")) {
    return undefined
  }

  const spec = source.slice("npm:".length)
  // Strip a trailing @version without breaking the leading @ of a scoped name.
  const versionAt = spec.lastIndexOf("@")
  return versionAt > 0 ? spec.slice(0, versionAt) : spec
}

/**
 * The installed package satisfying a companion entry, or undefined if none is.
 *
 * An exact name match is the ordinary case. An UNSCOPED companion entry is
 * also satisfied by a scoped package with the same bare name --
 * `@tintinweb/pi-subagents` satisfies `pi-subagents`. The subagents capability
 * is published to npm by more than one maintainer under that same bare name,
 * and a user running a scoped fork has the capability installed by any
 * meaning of the word; reporting "not installed" at them while its tools are
 * live in their session is a false negative, and the suggested
 * `pi install npm:pi-subagents` would push them into installing a second
 * extension that registers the same tool names.
 *
 * A SCOPED companion entry is matched exactly, because there the scope is
 * part of the identity the entry names, not incidental packaging.
 */
function findInstalledCompanion(companion: string, installed: Set<string>): string | undefined {
  if (installed.has(companion)) {
    return companion
  }

  if (companion.startsWith("@")) {
    return undefined
  }

  const scopedSuffix = `/${companion}`
  for (const name of installed) {
    if (name.startsWith("@") && name.endsWith(scopedSuffix)) {
      return name
    }
  }

  return undefined
}

function countDirectories(dir: string): number {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter(entry => entry.isDirectory()).length
  } catch {
    return 0
  }
}

function countMarkdownFiles(dir: string): number {
  try {
    return fs.readdirSync(dir).filter(name => name.endsWith(".md")).length
  } catch {
    return 0
  }
}

function readEccVersion(): string {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(ECC_ROOT, "package.json"), "utf8")) as {
      version?: string
    }
    return manifest.version || "unknown"
  } catch {
    return "unknown"
  }
}

function describeRulesStatus(): string {
  if (isDisabledByEnv(process.env.ECC_PI_RULES)) {
    return "disabled via ECC_PI_RULES"
  }

  const rules = loadPortableRules()
  if (!rules) {
    return `NOT FOUND (${path.join(ECC_ROOT, "rules", "common")})`
  }

  const skipped = PORTABLE_RULE_FILES.length - cachedRuleFileCount
  const shortfall = skipped > 0 ? ` (${skipped} unreadable, empty, or past the size cap)` : ""
  return `${cachedRuleFileCount}/${PORTABLE_RULE_FILES.length} rule file(s), ${rules.length} chars, from rules/common/${shortfall}`
}

const AGENT_CHECK_TIMEOUT_MS = 5_000

type AgentPortability =
  | { status: "validated"; count: number }
  | { status: "failed"; reason: string }
  | { status: "unvalidated"; reason: string }

/**
 * Verify agent portability by actually running `agent-convert.js --check` rather
 * than trusting file existence. A converter that exists but fails (schema drift,
 * a frontmatter variant that fails ajv) must not report a green doctor line.
 */
function validateAgentPortability(converterScript: string): AgentPortability {
  if (!fs.existsSync(converterScript)) {
    return { status: "unvalidated", reason: "converter script not found" }
  }

  let nodeExec: string
  try {
    nodeExec = resolveHookRuntime()
  } catch (err) {
    return { status: "unvalidated", reason: `no node runtime: ${messageOf(err)}` }
  }

  try {
    const stdout = execFileSync(nodeExec, [converterScript, "--check"], {
      timeout: AGENT_CHECK_TIMEOUT_MS,
      encoding: "utf8",
    })
    const match = stdout.match(/OK: (\d+) agents parsed and validated/)
    if (match) {
      return { status: "validated", count: parseInt(match[1], 10) }
    }
    return { status: "failed", reason: `unexpected output: ${stdout.slice(0, 200).trim()}` }
  } catch (err) {
    return { status: "failed", reason: messageOf(err) }
  }
}

function messageOf(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message)
  }
  return "unknown error"
}

function describeAgentPortability(agentCount: number, portability: AgentPortability): string {
  if (agentCount === 0) {
    return "NOT FOUND"
  }
  if (portability.status === "validated") {
    return `${portability.count} agent(s) source schema validated; Pi conversion available via scripts/agent-convert.js`
  }
  if (portability.status === "failed") {
    return `${agentCount} agent(s) present but validation FAILED: ${portability.reason}`
  }
  return `${agentCount} agent(s) present (unvalidated — ${portability.reason})`
}

function buildDoctorReport(ctx: ExtensionContext): string {
  const skillsDir = path.join(ECC_ROOT, "skills")
  const commandsDir = path.join(ECC_ROOT, "commands")
  const skillCount = countDirectories(skillsDir)
  const commandCount = countMarkdownFiles(commandsDir)
  const agentsDir = path.join(ECC_ROOT, "agents")
  const agentCount = countMarkdownFiles(agentsDir)
  const converterScript = path.join(ECC_ROOT, "scripts", "agent-convert.js")
  const agentLine = describeAgentPortability(agentCount, validateAgentPortability(converterScript))

  const lines = [
    "ECC adapter for Pi",
    "",
    `  ECC version:   ${readEccVersion()}`,
    `  Package root:  ${ECC_ROOT}`,
    `  Project cwd:   ${ctx.cwd}`,
    "",
    "Canonical resources",
    `  skills/        ${skillCount > 0 ? `${skillCount} skill(s)` : "NOT FOUND"} (${skillsDir})`,
    `  commands/      ${commandCount > 0 ? `${commandCount} command(s)` : "NOT FOUND"} (${commandsDir})`,
    `  agents/        ${agentLine} (${agentsDir})`,
    "",
    "Engineering rules available to load for your project",
    `  ${describeRulesStatus()}`,
    "",
    `  profile:       ${process.env.ECC_HOOK_PROFILE || "standard (default)"}`,
    `  disabled:      ${process.env.ECC_DISABLED_HOOKS || "none"}`,
    "",
    "Optional companion packages (from Pi's installed package list)",
  ]

  const installed = listInstalledPiPackages(ctx.cwd)
  for (const name of COMPANION_PACKAGES) {
    const match = findInstalledCompanion(name, installed)
    lines.push(`  ${match ? "installed    " : "not installed"}  ${name}`)
    if (!match) {
      lines.push(`      install with: pi install npm:${name}`)
    } else if (match !== name) {
      lines.push(`      satisfied by: ${match}`)
    }
  }

  lines.push(
    "",
    "Companion packages are optional; ECC skills and commands",
    "work without them. See .pi/README.md for what each one unlocks.",
    "Detection reads Pi's `packages` list, so a companion vendored some other",
    "way may work while reporting as not installed."
  )

  return lines.join("\n")
}

const getCommandBody = createCommandBodyReader(ECC_ROOT)

export default function (pi: ExtensionAPI): void {
  pi.on("input", event =>
    handlePiInputEvent(event, pi, {
      eccRoot: ECC_ROOT,
      env: process.env,
      getBody: getCommandBody,
    })
  )

  pi.registerCommand("ecc-doctor", {
    description: "Report ECC adapter status: package root, canonical resources and companions",
    handler: async (_args, ctx) => {
// No deliverAs: "nextTurn" here. In Pi 1.x that queues the message until
      // the user's next prompt, so the report never appears when the command runs.
      // Explicitly suppress a model turn while displaying the report now.
      pi.sendMessage(
        {
          customType: "ecc-doctor",
          content: buildDoctorReport(ctx),
          display: true,
        },
        { triggerTurn: false }
      )
    },
  })
}

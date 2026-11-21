/**
 * OpenCode tool registration. Database lifecycle hooks run in Codex.
 *
 * ## Active Plugin: ECC v2.2.3
 */

import * as path from "path"
import { fileURLToPath } from "url"

import { ECC_ROOT_PROBES, findEccRootDir, getECCVersion, loadToolModule } from "./lib/ecc-runtime-support.ts"

/**
 * Directory of this module.
 *
 * The plugin is ESM: tsc compiles it to .opencode/dist/plugins/*.js and OpenCode
 * loads the .ts directly, so `__dirname` is not defined there. Reading it used to
 * throw inside a try/catch and silently degrade the reported ECC version to the
 * default. `import.meta.url` is the ESM source of truth; the `__dirname` check is
 * kept first only so a CJS consumer of this module still resolves correctly.
 */
function resolvePluginDir(): string {
  // Node 24 leaks the eval context's `__dirname` ("." under `node -e`) into
  // modules imported from it, which would resolve relative to the *process*
  // cwd instead of this file. Only a genuine absolute __dirname is trusted;
  // import.meta.url is correct in every layout (OpenCode's TS loader and
  // plain ESM both give the module's own URL).
  if (typeof __dirname === "string" && path.isAbsolute(__dirname)) return __dirname
  return path.dirname(fileURLToPath(import.meta.url))
}

const PLUGIN_DIR = resolvePluginDir()

// Keep one tools registration per project when the plugin is discovered twice.
const GUARD_KEY = Symbol.for("ecc.hooks.registered-directories")
const registeredDirectories: Set<string> =
  ((globalThis as any)[GUARD_KEY] as Set<string> | undefined) ??
  ((globalThis as any)[GUARD_KEY] = new Set<string>())

/** OpenCode 1.x compatibility entry. It exposes only on-demand tools. */
export const ECCHooksPlugin = async (input: {
  client: any
  $?: any
  directory?: string
  worktree?: string
}): Promise<Record<string, unknown>> => {
  const tool: Record<string, unknown> = {}
  for (const name of ["changed-files", "dependency-analyzer"]) {
    try {
      tool[name] = await loadToolModule(name, PLUGIN_DIR)
    } catch (error: unknown) {
      const message = "[ECC] Custom tool " + name + " unavailable: " + (error instanceof Error ? error.message : String(error))
      if (typeof input.client?.app?.log === "function") {
        input.client.app.log({ body: { service: "ecc", level: "warn", message } })
      } else {
        console.warn(message)
      }
    }
  }
  return { tool }
}

export const ECCHooksPluginDefinition = {
  id: "ecc-hooks",
  async setup(ctx: any): Promise<() => Promise<void>> {
    const directory: string = ctx?.location?.directory ?? process.cwd()
    const worktreePath: string = ctx?.location?.worktree ?? directory

    if (registeredDirectories.has(directory)) return async () => {}
    registeredDirectories.add(directory)

    const registrations: { dispose?: () => Promise<void> | void }[] = []
    try {
      // Custom tools: registered through a transform, resolving the V1 tool
      // modules lazily inside execute so a broken tools/ install only affects
      // these two tools when actually invoked.
      if (typeof ctx?.tool?.transform === "function") {
        registrations.push(
          await ctx.tool.transform((editor: any) => {
            editor.add({
              name: "changed-files",
              description:
                "List current Git worktree changes as a navigable tree. Shows added (+), modified (~), and deleted (-) files and supports JSON output.",
              input: {
                type: "object",
                properties: {
                  filter: { type: "string", enum: ["all", "added", "modified", "deleted"], description: "Filter by change type (default: all)" },
                  format: { type: "string", enum: ["tree", "json"], description: "Output format: tree for terminal display, json for structured data (default: tree)" },
                },
                additionalProperties: false,
              },
              execute: async (input: any, context: any) => {
                const mod = await loadToolModule("changed-files", PLUGIN_DIR)
                const result = await mod.execute(input ?? {}, context ?? { directory: worktreePath, worktree: worktreePath })
                return { content: String(result) }
              },
            })
            editor.add({
              name: "dependency-analyzer",
              description:
                "Analyze project dependencies for outdated packages, security vulnerabilities, and unused dependencies. Supports npm, pnpm, yarn, and bun.",
              input: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["all", "outdated", "security", "unused"], description: "Type of analysis to run (default: all)" },
                  fix: { type: "boolean", description: "Attempt to fix issues automatically (default: false)" },
                  depth: { type: "number", description: "Depth of dependency analysis (default: 1)" },
                },
                additionalProperties: false,
              },
              execute: async (input: any, context: any) => {
                const mod = await loadToolModule("dependency-analyzer", PLUGIN_DIR)
                const result = await mod.execute(input ?? {}, context ?? { directory: worktreePath, worktree: worktreePath })
                return { content: String(result) }
              },
            })
          }),
        )
      }
      logStartup(directory)
    } catch (error: unknown) {
      registeredDirectories.delete(directory)
      await disposeRegistrations(registrations)
      throw error
    }

    return async () => {
      registeredDirectories.delete(directory)
      await disposeRegistrations(registrations)
    }
  },
}

/** Dispose every registration, awaiting promises so no rejection is unhandled. */
async function disposeRegistrations(
  registrations: { dispose?: () => Promise<void> | void }[],
): Promise<void> {
  for (const registration of registrations) {
    try {
      // T13: the dispose result may be a promise; chain a catch so a
      // rejection is never left unhandled, and await it in this loop.
      await Promise.resolve().then(() => registration?.dispose?.())
    } catch {
      // Best-effort dispose.
    }
  }
}

function logStartup(directory: string) {
  // Mirrors the V1 startup line used in server-log triage (TROUBLESHOOTING.md).
  console.info(`[ecc] tools plugin v${getECCVersion(findEccRootDir(PLUGIN_DIR, ECC_ROOT_PROBES.root), PLUGIN_DIR)} loaded (directory=${directory})`)
}

export default ECCHooksPluginDefinition

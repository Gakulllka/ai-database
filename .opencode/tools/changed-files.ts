import { execFile } from "node:child_process"
import * as path from "node:path"
import { promisify } from "node:util"
import { tool, type ToolDefinition } from "./tool.ts"
import type { ChangeType, TreeNode } from "../plugins/lib/changed-files-store.ts"

const INDICATORS: Record<ChangeType, string> = {
  added: "+",
  modified: "~",
  deleted: "-",
}

function renderTree(nodes: TreeNode[], indent: string): string {
  const lines: string[] = []
  for (const node of nodes) {
    const indicator = node.changeType ? ` (${INDICATORS[node.changeType]})` : ""
    const name = node.changeType ? `${node.name}${indicator}` : `${node.name}/`
    lines.push(`${indent}${name}`)
    if (node.children.length > 0) {
      lines.push(renderTree(node.children, `${indent}  `))
    }
  }
  return lines.join("\n")
}

// Loaded lazily (instead of via a top-level import) so that a missing or
// partially-installed `~/.opencode/plugins` directory only breaks this one
// tool when it's actually invoked, rather than throwing during module
// evaluation. `tools/index.ts` re-exports every tool from a single barrel
// file, so a static import failure here previously took down the entire
// tools module -- and with it, the whole OpenCode session -- on the very
// first tool-loading pass (see #2530).
type ChangedFilesStore = typeof import("../plugins/lib/changed-files-store.ts")
let changedFilesStorePromise: Promise<ChangedFilesStore> | undefined

async function loadChangedFilesStore(): Promise<ChangedFilesStore> {
  if (!changedFilesStorePromise) {
    changedFilesStorePromise = import("../plugins/lib/changed-files-store.ts").catch(() => {
      changedFilesStorePromise = undefined
      throw new Error(
        "changed-files tool: could not load the changed-files store. " +
          "This usually means the ~/.opencode/plugins directory is missing or incomplete " +
          "(an interrupted or partial ECC install can leave tools/ populated without plugins/). " +
          "Run `node scripts/repair.js --target opencode` (or `ecc repair --target opencode`) " +
          "from the ECC repo to restore the missing files."
      )
    })
  }
  return changedFilesStorePromise
}

const runGit = promisify(execFile)

async function readGitChanges(cwd: string): Promise<Map<string, ChangeType>> {
  const { stdout } = await runGit("git", ["-c", "core.fsmonitor=false", "status", "--porcelain=v1", "-z", "--no-renames", "--untracked-files=all"], {
    cwd, encoding: "utf8", timeout: 5000, maxBuffer: 2 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" }, windowsHide: true,
  })
  const entries = new Map<string, ChangeType>()
  for (const record of stdout.split("\0")) {
    if (record[2] !== " ") continue
    const status = record.slice(0, 2)
    const kind = status.includes("D") ? "deleted" : status.includes("A") || status === "??" ? "added" : "modified"
    entries.set(path.normalize(record.slice(3)), kind)
  }
  return entries
}

const changedFilesTool: ToolDefinition = tool({
  description:
    "List current Git worktree changes as a navigable tree. Shows added (+), modified (~), and deleted (-) files and supports JSON output.",
  args: {
    filter: tool.schema
      .enum(["all", "added", "modified", "deleted"])
      .optional()
      .describe("Filter by change type (default: all)"),
    format: tool.schema
      .enum(["tree", "json"])
      .optional()
      .describe("Output format: tree for terminal display, json for structured data (default: tree)"),
  },
  async execute(args, context) {
    const { buildTree, getChangedPaths, getChanges } = await loadChangedFilesStore()
    const filter = args.filter === "all" || !args.filter ? undefined : (args.filter as ChangeType)
    const format = args.format ?? "tree"

    let entries = getChanges()
    const reportSource = entries.size > 0 ? "session-tracking" : "git-worktree"
    if (reportSource === "git-worktree") {
      try {
        entries = await readGitChanges(context.worktree || context.directory)
      } catch {
        return JSON.stringify({ changed: null, source: reportSource, message: "Git worktree status is unavailable" })
      }
    }

    if (!entries.size) {
      return JSON.stringify({ changed: false, source: reportSource, message: "No changes found" })
    }

    const paths = getChangedPaths(filter, entries)

    if (format === "json") {
      return JSON.stringify(
        {
          changed: paths.length > 0,
          source: reportSource,
          filter: filter ?? "all",
          files: paths.map((p) => ({ path: p.path, changeType: p.changeType })),
          diffCommands: (reportSource === "session-tracking" ? paths : [])
            .filter((p) => p.changeType !== "added")
            .map((p) => `git diff ${p.path}`),
        },
        null,
        2
      )
    }

    const tree = buildTree(filter, entries)
    const treeStr = renderTree(tree, "")
    const diffHint = (reportSource === "session-tracking" ? paths : [])
      .filter((p) => p.changeType !== "added")
      .slice(0, 5)
      .map((p) => `  git diff ${p.path}`)
      .join("\n")

    let output = `Changed files [${reportSource}] (${paths.length}):\n\n${treeStr}`
    if (diffHint) {
      output += `\n\nTo view diff for a file:\n${diffHint}`
    }
    return output
  },
})

export default changedFilesTool

---
name: config-health
description: "Diagnose configuration drift, stale rules, and missing hook or MCP wiring in Codex or Claude Code. Use when an expected integration stops loading or a setup differs across workspaces."
metadata:
  origin: ECC
---

# Config Health

## Codex workflow

Start with the effective workspace and host version. Identify the user and project config layers, applicable AGENTS.md files and the expected source of each entry. For a config entry, validate its syntax and resolve referenced paths. Check local and shared configuration without printing credentials.

1. For skills, verify the current client discovers the intended ID and root. For MCP, verify a read-only call if authorized. For hooks, locate the event and script and verify a harmless trigger when permitted.
2. Compare actual observations to the expected setup. Report missing config, invalid config, configured-but-unobserved behavior and verified behavior by layer.
3. Before a repair, identify which file owns the drift. Apply the smallest authorized change and repeat the same check under the intended workspace and permissions.

## Claude Code and prior integrations

Run the standalone checker on demand from the project directory.

```sh
python3 scripts/config-health.py --check
```

It audits references to installed hook scripts, rule files and stale guard records. Run it when a hook stops firing, after upgrading a setup, or when more than one settings file may own an entry.
## Hook Paths

Hook commands are split the way a shell splits them before any path is
checked, so a normal plugin install does not report every hook as missing:

- `~/.claude/scripts/x.py`, `$HOME/scripts/x.py` and `${USERPROFILE}/…` resolve
  against the user home.
- `${CLAUDE_PLUGIN_ROOT}/…` and `${CLAUDE_PROJECT_DIR}/…` are expanded.
- A bare relative path (`.claude/scripts/x.py`, `scripts/hooks/x.js`) is resolved
  under the project dir, the user home **and** the plugin root, because a hook
  command does not say which of those it runs from. It is reported only when it
  is missing from all three.
- A quoted word is one argument, so `python3 "C:\Program Files\ecc\guard.py"`
  is not cut at the space, and `;` `|` `&` inside quotes are part of the name
  rather than separators. One deliberate exception to shell quoting: a
  backslash escapes only whitespace, quotes and shell metacharacters — never
  another backslash, `$` or a backtick. So `C:\Users\me\guard.py`,
  `\\server\share\x.py` and `C:\$Recycle.Bin\x.py` survive intact, which a
  POSIX escaper would mangle into paths that do not exist.
- An interpreter's program body is not a script path, and the two kinds are
  treated differently. `sh -c "python3 x.py"` is a command line, so it is
  scanned again as one; `-c`, `-lc` and `--command` all count, and an option
  in between (`bash -x -c`, `bash -o pipefail -c`) does not orphan the body.
  A `node -e` or `python -c` body is source in another language, where a
  string is a string: `p.join(r,'scripts/hooks/x.js')` is assembled at
  runtime and is not a file anything will open, so it is skipped. A missing
  file *named inside* a JS body is therefore not reported — the monitor cannot
  tell a path from a string.

What is **skipped rather than reported**: a token carrying a placeholder this
monitor does not resolve, a placeholder whose expansion lands outside the
audited roots, a single-quoted placeholder (the shell does not expand it), a
command with an unclosed quote anywhere in it including inside a `sh -c`
payload, and a `sh -c` chain nested deeper than three.

`--check` prints what was left unjudged, because a blind spot nobody can see
is not a health check:

| `N hook path(s) not audited` | placeholders or paths the monitor would not judge, plus commands it could not parse |
| `N hook command(s) have an unclosed quote` | commands with a quote that never closes — a typo, not a design decision |
| `N hook command(s) nested sh -c deeper than 3 levels` | nesting the monitor stopped following; the rest of the command was still audited |
| `N interpreter program body/bodies were skipped unjudged` | `node -e` / `python -c` bodies, where a file named inside is a string in another language and cannot be checked |
| `N settings file(s) could not be read` | **a warning, not info**: a malformed settings file is the one input whose contents decide the answer, and it was not audited |
| `N relative hook path(s) were satisfied by the user home or plugin root` | the multi-root trade: a project-scoped hook that is genuinely broken looks exactly like a healthy plugin one here |
| `$CLAUDE_PLUGIN_ROOT resolved to …` | the root it judged against |

On a healthy ECC install the last two lines are the interesting ones: a real
one reports 0 findings with 23 program bodies skipped and 17 relative paths
satisfied by the plugin root.

## Env Inputs

Findings are a function of the settings files and these variables, not of the
process environment:

| Variable | Effect |
|----------|--------|
| `CONFIG_HEALTH_USER_HOME` | user home; also what `~` and `$HOME` resolve to |
| `CLAUDE_CONFIG_DIR` | Claude data root; user settings and the rule-health log; default `~/.claude` |
| `CLAUDE_PROJECT_DIR` | project dir |
| `CONFIG_HEALTH_PLUGIN_ROOT` | pins the plugin root |
| `CLAUDE_PLUGIN_ROOT` | plugin root; `CONFIG_HEALTH_PLUGIN_ROOT` wins |

When a launcher sets `CLAUDE_CONFIG_DIR`, `~/.claude/settings.json` is not the
file Claude loads. The monitor reads `$CLAUDE_CONFIG_DIR/settings.json` instead,
and `--check` prints the root it resolved.

**More than one plugin installed?** The provider sets `CLAUDE_PLUGIN_ROOT` to
the root of the plugin that is *running*, so a settings line wired for a second
plugin is judged against the wrong directory. One variable cannot describe two
plugins; set `CONFIG_HEALTH_PLUGIN_ROOT` explicitly in that case.

**Standalone install?** Copy the entry point **and its three helper modules**
(`config_health_constants.py`, `config_health_paths.py`, `config_health_scan.py`)
into the same directory as `config-health.py`; the entry imports them by name.
That puts it where no plugin root is in its environment. Two things follow, and
both are worth acting on rather than ignoring:

- `${CLAUDE_PLUGIN_ROOT}/…` lines become unresolvable, so they are skipped —
  silence, not verification;
- the plugin root is no longer one of the directories a relative path is checked
  against, so **ECC's own `scripts/hooks/x.js` references get judged against
  your project and your home, and this repo's 23 hooks produce 17 findings.**
  Those findings are not noise; they are the monitor correctly reporting that
  it cannot see the plugin.

Set `CONFIG_HEALTH_PLUGIN_ROOT` in the hook's `env` block, or wire those hooks
with `~` or `$HOME`, if you want them covered.

## PreToolUse Cost (opt-in)

`--pretool` is opt-in. If you wire it, it runs once per matched tool call —
typically every Edit and every Write — in a fresh process, and the audit runs on
every one of them. "Does this script exist" is a property of the settings files,
not of the call about to run, so a per-tool hook adds no tool-specific evidence.

Measured on this repository's **real 23 hook commands**, Python 3.12 on
Windows, interleaved A/B so scheduler drift cancels, median of 30 paired runs:

| | before | after |
|---|---|---|
| the wiring audit itself, in process | 4.33 ms | **3.83 ms** |
| parsing and compiling this script (a `__main__` script is never byte-cached) | 1.06 ms | 3.00 ms |
| whole `--pretool` process, median | 50.6 ms | 54.7 ms |
| `python -c pass`, for reference | 42.1 ms | 42.1 ms |

Two things worth separating, because they point in opposite directions:

- **The audit got cheaper.** 4.33 ms → 3.83 ms, despite now doing strictly more
  work: expanding placeholders, splitting commands like a shell, and checking
  three roots per relative path. The old version spent that time producing 55
  findings about files that exist, each one a `stat` plus a formatted string.
- **The script got bigger, and that is the whole cost.** 10.7 KB → 42 KB is
  +1.9 ms of parse-and-compile on every invocation, because a script run as
  `__main__` is never byte-cached to a `.pyc`.

Net: **+4.1 ms on a ~55 ms hook invocation, about 8%**, and the honest
attribution is script size, not the audit. Stripping every docstring recovers
0.15 ms of the compile, so it is the code, not the prose.

Use the standalone check to audit the effective settings once.

The hook payload is drained and discarded, never parsed and never printed. Its
size cannot change the verdict. `timeout` in the hook wiring, not the read, is
what bounds a hanging hook.

## Examples

Missing hook script:
`hook "PreToolUse" references missing script: .claude/scripts/ghost.py` → the
settings file points at a file that is not there. Still exit 0.

Dead rule reference:
`CLAUDE.md references missing rule file: rules/ghost.md` → exit 0.

Rule staleness:
`rule "双池强制触发" has not fired in the last 5 sessions → may be dead` — the
window is the five most recent complex sessions, not an arbitrary number of
sessions back. Any positive count inside that window keeps the rule alive, even
in a short session: a count above zero means the rule did fire.

Healthy plugin install:
`python3 "${CLAUDE_PLUGIN_ROOT}/scripts/hooks/guard.py"` with the plugin
installed → no finding. If `guard.py` is genuinely absent from the plugin →
one finding, still exit 0 — **provided `CLAUDE_PLUGIN_ROOT` (or
`CONFIG_HEALTH_PLUGIN_ROOT`) is set in the monitor's own environment.** Without
it the token is unresolvable and there is no finding either way.

What this monitor reads: the hook-wired settings files — `settings.json` in the
user dir, in the project dir, and `.claude/settings.local.json` in the project
dir; plus the plugin's own `hooks/hooks.json` when `CLAUDE_PLUGIN_ROOT` (or
`CONFIG_HEALTH_PLUGIN_ROOT`) is set — `CLAUDE.md` (in the project dir), and
`$CLAUDE_CONFIG_DIR/session-data/rule-health.jsonl` (default
`~/.claude/session-data/rule-health.jsonl`). It reads no documentation to find
references, and it does not count how many places a script is wired.

## Install the standalone checker

Install the Claude checker with `npx ecc-universal install --target claude --modules config-health`. The module supplies the skill and checker files. Run `config-health.py --check` when you want a report.

For a manual copy, keep `config-health.py` and `config_health_constants.py`, `config_health_paths.py`, and `config_health_scan.py` in the same directory.
## Design Principles

1. Never block on process monitoring — config-health warns; delivery-gate blocks
2. Check what delivery-gate can't — config behavior vs filesystem state
3. Bias every judgement toward silence, and count what you did not judge. A
   path this monitor cannot build is unknown, not missing. A relative path is
   reported only when it is missing under every audited root. The asymmetry is
   deliberate: silence costs a missed check, a false warning costs the user's
   trust in every other line this hook prints.
4. Say what you did not check. `--check` prints the skipped, unparsed and
   cross-root counts, so a blind spot can be found and fixed rather than
   assumed.

## Files

| File | Purpose | Hook |
|------|---------|------|
| scripts/config-health.py | Standalone configuration checker | Run with `--check` |
| scripts/config_health_constants.py | Constants, regexes, audit sets | — |
| scripts/config_health_paths.py | Path resolution and defensive reads | — |
| scripts/config_health_scan.py | Shell-command tokenising and scanning | — |

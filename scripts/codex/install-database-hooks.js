#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { isDeepStrictEqual } = require('node:util');
const compact = require('../../hooks/codex-compaction-recovery.json').hooks.SessionStart[0];

const fileName = 'database-codex.js';
const marker = '// Database-managed Codex lifecycle dispatcher.';
const sourcePath = path.resolve(__dirname, '../../hooks', fileName);
const definitions = [
  ['PreToolUse', '^Bash$', 'git-safety', 'Reviewing Git command'],
  ['PreToolUse', '^apply_patch$', 'patch-check', 'Reviewing patch for secrets'],
  ['PostToolUse', '^apply_patch$', 'patch-check', 'Reviewing patch diagnostics'],
  ['PostToolUse', '^Bash$', 'check-result', 'Checking verification result'],
];

function quotePosix(value) {
  return "'" + value.replaceAll("'", "'\\''") + "'";
}

function quoteWindows(value) {
  return "'" + value.replace(/[\x27\u2018\u2019\u201A\u201B]/g, match => match + match) + "'";
}

function localCommand(executable, script, action, platform = process.platform) {
  const parts = [executable, script, action];
  return platform === 'win32'
    ? '& ' + parts.map(quoteWindows).join(' ')
    : parts.map(quotePosix).join(' ');
}

function ownsCommand(candidate, script, action) {
  if (typeof candidate !== 'string') return false;
  const windows = process.platform === 'win32';
  const quote = windows ? quoteWindows : quotePosix;
  const suffix = ' ' + quote(script) + ' ' + quote(action);
  if (!candidate.endsWith(suffix)) return false;
  const prefix = candidate.slice(0, -suffix.length);
  const start = windows ? "& '" : "'";
  if (!prefix.startsWith(start) || !prefix.endsWith("'")) return false;
  const escaped = prefix.slice(start.length, -1);
  const binary = windows ? escaped.replace(/([\x27\u2018\u2019\u201A\u201B])\1/g, '$1') : escaped.replaceAll("'\\''", "'");
  return path.isAbsolute(binary) && localCommand(binary, script, action) === candidate;
}

function effectiveCommand(handler) {
  return process.platform === 'win32'
    ? handler?.commandWindows ?? handler?.command_windows ?? handler?.command
    : handler?.command;
}

function record(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function buildConfig(original, executable, script) {
  if (!record(original) || (original.hooks !== undefined && !record(original.hooks))) {
    throw new Error('Expected a Codex hooks JSON object.');
  }
  const hooks = { ...original.hooks };
  for (const [event, definition] of Object.entries(hooks)) {
    if (!Array.isArray(definition) || definition.some(group => !record(group) || (group.hooks !== undefined && !Array.isArray(group.hooks)))) {
      throw new Error('Unexpected hook group under ' + event + '.');
    }
  }

  let seenCompact = false;
  const startup = (hooks.SessionStart || []).flatMap(group => {
    if (group.matcher !== compact.matcher || !group.hooks?.length) return [group];
    const handlers = group.hooks.filter(handler => {
      if (handler?.type !== 'command' || effectiveCommand(handler) !== compact.hooks[0].command) return true;
      if (seenCompact) return false;
      seenCompact = true;
      return true;
    });
    return handlers.length ? [{ ...group, hooks: handlers }] : [];
  });
  if (!seenCompact) startup.push(compact);
  hooks.SessionStart = startup;

  for (const [event, matcher, action, statusMessage] of definitions) {
    const command = localCommand(executable, script, action);
    const handler = { type: 'command', command, timeout: 3, statusMessage };
    let seen = false;
    const groups = (hooks[event] || []).flatMap(group => {
      if (group.matcher !== matcher || !group.hooks?.length) return [group];
      const handlers = group.hooks.flatMap(item => {
        if (item?.type !== 'command' || !ownsCommand(effectiveCommand(item), script, action)) return [item];
        if (seen) return [];
        seen = true;
        return [handler];
      });
      return handlers.length ? [{ ...group, hooks: handlers }] : [];
    });
    if (!seen) groups.push({ matcher, hooks: [handler] });
    hooks[event] = groups;
  }
  return { ...original, hooks };
}

function getDirectory(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isDirectory() || stat.isSymbolicLink() || fs.realpathSync(file).toLowerCase() !== file.toLowerCase()) {
    throw new Error('Expected a regular local directory: ' + file);
  }
}

function readFile(file) {
  try {
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 4 * 1024 * 1024) {
      throw new Error('Refusing to replace an unexpected or oversized file.');
    }
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function replaceFile(file, text) {
  const temp = file + '.' + randomUUID() + '.tmp';
  try {
    fs.writeFileSync(temp, text, { flag: 'wx', mode: 0o600 });
    fs.renameSync(temp, file);
  } finally {
    fs.rmSync(temp, { force: true });
  }
}

function install(home, dryRun) {
  if (!path.isAbsolute(home)) throw new Error('Codex home must be an absolute path.');
  home = fs.realpathSync(path.resolve(home));
  getDirectory(home);
  const hookFile = path.join(home, 'hooks.json');
  const hookDir = path.join(home, 'hooks');
  if (fs.existsSync(hookDir)) getDirectory(hookDir);
  const runtime = path.join(hookDir, fileName);
  const previousConfig = readFile(hookFile);
  const previousRuntime = readFile(runtime);
  const source = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
  if (!source.includes(marker)) throw new Error('Unexpected Database hook source.');
  if (previousRuntime !== null && !previousRuntime.includes(marker)) {
    throw new Error('A user file already occupies the Database hook path.');
  }

  const config = previousConfig === null ? {} : JSON.parse(previousConfig.replace(/^\uFEFF/, ''));
  const next = buildConfig(config, process.execPath, runtime);
  const configChanged = !isDeepStrictEqual(next, config);
  const runtimeChanged = previousRuntime !== source;
  if (dryRun || (!configChanged && !runtimeChanged)) return { changed: configChanged || runtimeChanged };

  const lockPath = path.join(home, '.database-hook-install.lock');
  const lock = fs.openSync(lockPath, 'wx', 0o600);
  try {
    if (!fs.existsSync(hookDir)) fs.mkdirSync(hookDir);
    getDirectory(hookDir);
    if (readFile(hookFile) !== previousConfig || readFile(runtime) !== previousRuntime) {
      throw new Error('Local hook configuration changed while planning installation. Retry with current files.');
    }
    if (configChanged && previousConfig !== null) {
      const backup = hookFile + '.database-backup-' + randomUUID();
      fs.writeFileSync(backup, previousConfig, { flag: 'wx', mode: 0o600 });
    }
    if (runtimeChanged) replaceFile(runtime, source);
    if (configChanged) replaceFile(hookFile, JSON.stringify(next, null, 2) + '\n');
  } finally {
    fs.closeSync(lock);
    fs.rmSync(lockPath);
  }
  return { changed: true };
}

function main() {
  const args = process.argv.slice(2);
  const homeArg = args.indexOf('--home');
  if (homeArg >= 0 && (!args[homeArg + 1] || args[homeArg + 1].startsWith('--'))) {
    throw new Error('Use --home with an absolute directory.');
  }
  const home = homeArg >= 0 ? args.splice(homeArg, 2)[1] : process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  if (args.some(arg => arg !== '--dry-run')) throw new Error('Usage: install-database-hooks.js [--home DIRECTORY] [--dry-run]');
  const dryRun = args.includes('--dry-run');
  const result = install(home, dryRun);
  console.log(dryRun ? 'Codex hooks plan: ' + (result.changed ? 'changes available' : 'already current')
    : result.changed ? 'Database lifecycle hooks saved. Review new definitions in Codex /hooks.'
    : 'Database lifecycle hooks are already current.');
}

if (require.main === module) {
  try { main(); }
  catch (error) { console.error('Database lifecycle hook install: ' + error.message); process.exitCode = 1; }
}
module.exports = { buildConfig, install, localCommand };

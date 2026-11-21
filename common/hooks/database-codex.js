#!/usr/bin/env node
// Database-managed Codex lifecycle dispatcher. Hook input is data only.
'use strict';

const MAX_INPUT_BYTES = 2 * 1024 * 1024;
const gitCommand = /^\s*(?:&\s+)?git(?:\.exe)?\s+/i;
const forcedPush = /^push\b[^\r\n]*(?:--force(?:\b|=)|\s-f(?:\s|$))/i;
const destructiveGit = /^(?:reset\s+--hard\b|clean\s+-[dfx]*f[dfx]*\b|branch\s+-D\b)/;
const verification = /\b(?:npm|pnpm|yarn|bun)\s+(?:(?:run|exec)\s+)?(?:test|lint|typecheck|build|check)\b|\b(?:pytest|cargo\s+test|go\s+test|dotnet\s+test|node\s+--test|git\s+diff\s+--check)\b/;
const directTest = /^\s*(?:&\s+)?(?:(?:npm|pnpm|yarn|bun)(?:\.cmd|\.exe)?\s+(?:run\s+)?test|pytest|cargo\s+test|go\s+test|dotnet\s+test|node\s+--test)\b/i;
const secret = /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{45,}|(?:sk-(?:proj-)?|sk-ant-api\d{2}-)[A-Za-z0-9_-]{30,}|AKIA[A-Z0-9]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/;

function context(event, message) {
  return { hookSpecificOutput: { hookEventName: event, additionalContext: message } };
}

function addedLines(patch) {
  if (!patch.startsWith('*** Begin Patch')) return [];
  const added = [];
  let file = '';
  for (const line of patch.split(/\r?\n/)) {
    const start = /^\*\*\* (?:(?:Add|Update) File:|Move to:) (.+)$/.exec(line);
    if (start) {
      file = start[1];
    } else if (line.startsWith('*** ')) {
      file = '';
    } else if (file && line.startsWith('+')) {
      added.push({ file, line: line.slice(1) });
    }
  }
  return added;
}

function outputExitCode(result) {
  if (result && Number.isInteger(result.exit_code)) return result.exit_code;
  if (result && Number.isInteger(result.exitCode)) return result.exitCode;
  if (typeof result !== 'string') return null;
  const chunk = /^Chunk ID:[^\r\n]*\r?\nWall time:[^\r\n]*\r?\nProcess exited with code (\d+)\b/.exec(result);
  return chunk ? Number(chunk[1]) : null;
}

const failedTestSummaries = [
  /^(#|\u2139\uFE0F?) tests \d+\r?\n\1 suites \d+\r?\n\1 pass \d+\r?\n\1 fail [1-9]\d*[ \t]*\r?$/m,
  /^=+ [^\r\n]*\b[1-9]\d* (?:failed|errors?)\b[^\r\n]* in \d+(?:\.\d+)?s =+\r?$/m,
  /^test result: FAILED\. \d+ passed; [1-9]\d* failed;/m,
  /^FAIL\t\S+\t(?:\d+(?:\.\d+)?s|\[build failed\])[ \t]*\r?$/m,
];

function evaluate(action, payload) {
  if (!payload || typeof payload !== 'object') return null;
  const command = payload.tool_input?.command;
  if (typeof command !== 'string') return null;

  if (action === 'git-safety' && payload.hook_event_name === 'PreToolUse' && payload.tool_name === 'Bash') {
    const unquoted = command.replace(/'(?:[^']|'')*'|"(?:\\.|[^"\\])*"/g, ' ');
    const risky = unquoted.split(/\r?\n|;|&&|\|\|/).some(segment => {
      const match = gitCommand.exec(segment);
      const args = match ? segment.slice(match[0].length) : '';
      return forcedPush.test(args) || destructiveGit.test(args);
    });
    if (risky) {
      return context('PreToolUse', 'Potentially destructive Git operation. Verify the exact repository and target, preserve unrelated work, and confirm the requested scope before executing.');
    }
  }

  if (action === 'patch-check' && payload.tool_name === 'apply_patch') {
    const lines = addedLines(command);
    if (payload.hook_event_name === 'PreToolUse' && lines.some(({ line }) => secret.test(line))) {
      return context('PreToolUse', 'The patch contains text resembling a credential or private key. Review the new lines before applying or publishing this change.');
    }
    if (payload.hook_event_name === 'PostToolUse') {
      if (lines.some(({ line }) => /^(?:<{7}|\|{7}|>{7})(?:\s|$)/.test(line))) {
        return context('PostToolUse', 'The patch adds a marker resembling a Git merge conflict. Check the affected text before delivery.');
      }
      if (lines.some(({ file, line }) => /\.(?:[cm]?[jt]sx?)$/i.test(file) &&
        /^\s*(?:debugger\s*;?\s*$|console\.(?:debug|log)\s*\()/.test(line))) {
        return context('PostToolUse', 'The patch adds a debugger statement or console diagnostic. Check whether the project intends to keep it.');
      }
    }
  }

  if (action === 'check-result' && payload.hook_event_name === 'PostToolUse' && payload.tool_name === 'Bash' &&
      verification.test(command)) {
    const result = payload.tool_response;
    const exitCode = outputExitCode(result);
    if (exitCode !== null && exitCode !== 0) {
      return context('PostToolUse', 'A verification command exited unsuccessfully. Check its result and distinguish a change regression from an environment failure before reporting delivery.');
    }
    // Some Codex executors supply only raw stdout to PostToolUse.
    if (exitCode === null && directTest.test(command) && typeof result === 'string' && failedTestSummaries.some(pattern => pattern.test(result))) {
      return context('PostToolUse', 'A test summary reports failures. Check its result and distinguish a change regression from an environment failure before reporting delivery.');
    }
  }

  return null;
}

async function main() {
  let size = 0;
  const chunks = [];
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > MAX_INPUT_BYTES) return;
    chunks.push(chunk);
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return;
  }
  const output = evaluate(process.argv[2], payload);
  if (output) process.stdout.write(JSON.stringify(output) + '\n');
}

if (require.main === module) {
  main().catch(() => { process.exitCode = 1; });
}
module.exports = { evaluate };

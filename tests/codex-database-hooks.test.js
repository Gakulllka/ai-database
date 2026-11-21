'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { evaluate } = require('../hooks/database-codex');
const { buildConfig, install, localCommand } = require('../scripts/codex/install-database-hooks');
const compact = require('../hooks/codex-compaction-recovery.json').hooks.SessionStart[0];

function event(name, tool, command, toolResponse) {
  return {
    hook_event_name: name,
    tool_name: tool,
    tool_input: { command },
    tool_response: toolResponse,
  };
}

test('Git advice is limited to direct risky commands and does not decide permission', () => {
  const risk = evaluate('git-safety', event('PreToolUse', 'Bash', 'git push --force origin branch'));
  assert.match(risk.hookSpecificOutput.additionalContext, /Verify the exact repository/);
  assert.equal(risk.hookSpecificOutput.permissionDecision, undefined);
  assert.equal(evaluate('git-safety', event('PreToolUse', 'Bash', 'git push origin branch')), null);
  assert.equal(evaluate('git-safety', event('PreToolUse', 'Bash', 'echo "value; git push --force"')), null);
  assert.ok(evaluate('git-safety', event('PreToolUse', 'Bash', 'git status; git push --force origin branch')));
  assert.ok(evaluate('git-safety', event('PreToolUse', 'Bash', 'Get-Date\ngit reset --hard HEAD')));
});

test('patch checks consider added lines only and never echo candidate credentials', () => {
  const fixtureCredential = 'ghp_' + 'A'.repeat(36);
  const intro = '*** Begin Patch\n*** Update File: old.js\n*** Move to: new.js\n@@\n';
  const pre = event('PreToolUse', 'apply_patch', intro + '+TOKEN=' + fixtureCredential + '\n*** End Patch');
  assert.match(evaluate('patch-check', pre).hookSpecificOutput.additionalContext, /credential/);
  assert.doesNotMatch(JSON.stringify(evaluate('patch-check', pre)), new RegExp(fixtureCredential));
  const removed = event('PreToolUse', 'apply_patch', intro + '-TOKEN=' + fixtureCredential + '\n*** End Patch');
  assert.equal(evaluate('patch-check', removed), null);
  const debug = event('PostToolUse', 'apply_patch', intro + '+  console.debug("fixture")\n*** End Patch');
  assert.match(evaluate('patch-check', debug).hookSpecificOutput.additionalContext, /diagnostic/);
});

test('verification advice requires a recognized command and an actual failed exit', () => {
  const verification = event('PostToolUse', 'Bash', 'npm run test', { exit_code: 1 });
  assert.match(evaluate('check-result', verification).hookSpecificOutput.additionalContext, /exited unsuccessfully/);
  assert.equal(evaluate('check-result', { ...verification, tool_response: { exit_code: 0 } }), null);
  assert.equal(evaluate('check-result', { ...verification, tool_response: 'Tests printed exit code 1.' }), null);
  assert.equal(evaluate('check-result', event('PostToolUse', 'Bash', 'echo done', { exit_code: 1 })), null);
});

test('merging hooks preserves user entries, deduplicates and handles a moved Node executable', () => {
  const local = { hooks: [{ type: 'command', command: 'user-specific check' }] };
  const script = path.join(os.tmpdir(), 'directory with spaces', 'database-codex.js');
  const customCompact = { ...compact, hooks: [{ ...compact.hooks[0], timeout: 8 }, local.hooks[0]] };
  const existing = { description: 'Local policy', hooks: { SessionStart: [customCompact, compact], Stop: [local] } };
  const previous = buildConfig(existing, process.execPath, script);
  assert.deepEqual(previous.hooks.SessionStart, [customCompact]);
  assert.deepEqual(previous.hooks.Stop, [local]);
  assert.deepEqual(buildConfig(previous, process.execPath, script), previous);
  const nextNode = process.execPath + '.replacement';
  const updated = buildConfig(previous, nextNode, script);
  assert.equal(updated.hooks.PreToolUse.flatMap(g => g.hooks).length, 2);
  assert.equal(updated.hooks.PostToolUse.flatMap(g => g.hooks).length, 2);
  assert.equal(updated.hooks.PreToolUse[0].hooks[0].command, localCommand(nextNode, script, 'git-safety'));
  assert.throws(() => buildConfig({ hooks: { Stop: true } }, process.execPath, script), /Unexpected hook group/);
});

test('installer preserves original config backup and a second install is a no-op', () => {
  const tempRoot = fs.realpathSync(os.tmpdir());
  const home = fs.mkdtempSync(path.join(tempRoot, 'database-codex-hook-test-'));
  const config = path.join(home, 'hooks.json');
  const previous = JSON.stringify({ hooks: { SessionStart: [compact] } });
  try {
    fs.writeFileSync(config, previous);
    assert.equal(install(home, true).changed, true);
    assert.equal(fs.readFileSync(config, 'utf8'), previous);
    assert.equal(install(home, false).changed, true);
    assert.equal(install(home, false).changed, false);
    assert.equal(fs.existsSync(path.join(home, '.database-hook-install.lock')), false);
    const backups = fs.readdirSync(home).filter(name => name.startsWith('hooks.json.database-backup-'));
    assert.equal(backups.length, 1);
    assert.equal(fs.readFileSync(path.join(home, backups[0]), 'utf8'), previous);
    assert.ok(fs.existsSync(path.join(home, 'hooks', 'database-codex.js')));
  } finally {
    assert.equal(path.dirname(fs.realpathSync(home)), tempRoot);
    fs.rmSync(home, { recursive: true, force: true });
  }
});

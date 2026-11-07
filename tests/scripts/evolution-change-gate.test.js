'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { checkChange, validStructured } = require('../../scripts/evolution/check-change');
const { normalizePrevious } = require('../../scripts/evolution/github-radar');

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-evolution-gate-'));
const environment = { ...process.env, GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: path.join(scratch, 'empty.gitconfig'), GIT_TERMINAL_PROMPT: '0' };
let sequence = 0;
let passed = 0;
let failed = 0;

function command(root, args, input) {
  const result = spawnSync('git', ['-c', 'commit.gpgsign=false', '-c',
    'core.hooksPath=' + path.join(scratch, 'empty-hooks'), '-C', root, ...args],
  { env: environment, encoding: 'utf8', input, windowsHide: true });
  assert.strictEqual(result.status, 0, 'Fixture Git command failed: ' + result.stderr);
  return result.stdout.trim();
}

function fixture(run, policy = {}) {
  const root = path.join(scratch, String(++sequence));
  fs.mkdirSync(root);
  command(root, ['init', '--quiet', '--object-format=sha1']);
  command(root, ['config', 'user.name', 'Fixture']);
  command(root, ['config', 'user.email', 'fixture@example.invalid']);
  command(root, ['config', 'core.autocrlf', 'false']);
  const write = (name, text) => {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  };
  const pair = (name, text, skill = 'existing') => {
    write('skills/' + skill + '/' + name, text);
    write('.agents/skills/' + skill + '/' + name, text);
  };
  const commit = (stage = true) => {
    if (stage) command(root, ['add', '--all']);
    command(root, ['commit', '--quiet', '-m', 'fixture']);
    return command(root, ['rev-parse', 'HEAD']);
  };
  for (const name of ['existing', 'two', 'three', 'four']) pair('SKILL.md', '# Original\n', name);
  write('config/database-evolution.json', JSON.stringify({ policy }));
  const base = commit();
  run({ root, base, write, pair, commit, git: (args, input) => command(root, args, input) });
}

function test(name, run, policy = {}) {
  try { fixture(run, policy); console.log('PASS: ' + name); passed++; }
  catch (error) { console.error('FAIL: ' + name + '\n' + error.message); failed++; }
}

function reason(result, code) {
  assert.strictEqual(result.autoEligible, false);
  assert.ok(result.reasons.some(item => item.code === code), 'Missing reason ' + code);
}

function cleanup() {
  const resolved = path.resolve(scratch);
  if (path.dirname(resolved) !== path.resolve(os.tmpdir()) ||
      !path.basename(resolved).startsWith('ecc-evolution-gate-')) throw new Error('Unsafe fixture cleanup');
  fs.rmSync(resolved, { recursive: true, force: true });
}

try {
  test('existing paired skill edits are mechanically eligible without executing code', ({ root, base, pair, commit }) => {
    pair('SKILL.md', '# Updated\nExplain the verified behavior.\n');
    const result = checkChange({ root, base, head: commit() });
    assert.strictEqual(result.autoEligible, true);
    assert.strictEqual(result.semanticReviewRequired, true);
    assert.strictEqual(result.files.length, 2);
    assert.strictEqual(result.changedLines, 6);
  });

  test('untracked and working-tree changes cannot alter a committed assessment', ({ root, base, pair, write, commit }) => {
    pair('SKILL.md', '# Approved candidate\n');
    const head = commit();
    write('skills/existing/SKILL.md', 'Dirty content not committed\n');
    write('scripts/foreign.js', 'throw new Error("must not execute");\n');
    assert.strictEqual(checkChange({ root, base, head }).autoEligible, true);
  });

  test('protected config edits require PR even when candidate config raises limits', ({ root, base, pair, write, commit }) => {
    write('config/database-evolution.json', JSON.stringify({ policy: { maxChangedLines: 99999 } }));
    pair('SKILL.md', Array.from({ length: 260 }, (_, i) => 'line ' + i).join('\n') + '\n');
    const result = checkChange({ root, base, head: commit() });
    reason(result, 'protected_path');
    reason(result, 'changed_line_limit');
    assert.strictEqual(result.limits.maxChangedLines, 500);
  });

  test('new skills require registration review', ({ root, base, pair, commit }) => {
    pair('SKILL.md', '# New capability\n', 'new-skill');
    reason(checkChange({ root, base, head: commit() }), 'requires_registration_review');
  });

  test('body edits preserve exact skill frontmatter', ({ root, pair, commit }) => {
    const header = '---\nname: existing\ndescription: Fixture\n---\n';
    pair('SKILL.md', header + '# Original\n');
    const base = commit();
    pair('SKILL.md', header + '# Updated body\n');
    assert.strictEqual(checkChange({ root, base, head: commit() }).autoEligible, true);
  });

  test('adding, removing or changing permission frontmatter requires PR', ({ root, base, pair, commit }) => {
    const header = '---\nname: existing\ndescription: Fixture\nallowed-tools: Bash\n---\n';
    pair('SKILL.md', header + '# Original\n');
    const introduced = commit();
    reason(checkChange({ root, base, head: introduced }), 'frontmatter_change_requires_review');
    pair('SKILL.md', '# Original\n');
    const removed = commit();
    reason(checkChange({ root, base: introduced, head: removed }), 'frontmatter_change_requires_review');
    pair('SKILL.md', header.replace('Bash', 'Read') + '# Original\n');
    reason(checkChange({ root, base: introduced, head: commit() }), 'frontmatter_change_requires_review');
    pair('SKILL.md', '\n\uFEFF  --- \nallowed-tools: Bash\n --- \n# Original\n');
    reason(checkChange({ root, base, head: commit() }), 'frontmatter_change_requires_review');
  });

  test('simple quoted UI fields may change without adding permissions', ({ root, base, pair, commit }) => {
    const yaml = 'interface:\n  display_name: "Existing Skill"\n' +
      '  short_description: "Describe the existing workflow clearly"\n' +
      '  default_prompt: "Use $existing for this workflow."\n';
    pair('agents/openai.yaml', yaml);
    assert.strictEqual(checkChange({ root, base, head: commit() }).autoEligible, true);
  });

  test('UI dependencies, policy, aliases and unknown YAML fields require PR', ({ root, base, pair, commit }) => {
    const yaml = 'interface:\n  display_name: "Existing Skill"\n' +
      '  short_description: "Describe the existing workflow clearly"\n' +
      '  default_prompt: "Use $existing for this workflow."\n';
    let policyBase;
    for (const addition of ['dependencies:\n  tools: [shell]\n', 'policy:\n  allow_implicit_invocation: true\n',
      '  icon_small: "./icon.png"\n']) {
      pair('agents/openai.yaml', yaml + addition);
      const head = commit();
      if (addition.startsWith('policy:')) policyBase = head;
      reason(checkChange({ root, base, head }), 'ui_metadata_requires_review');
    }
    pair('agents/openai.yaml', yaml.replace('"Existing Skill"', '*other'));
    reason(checkChange({ root, base, head: commit() }), 'ui_metadata_requires_review');
    pair('agents/openai.yaml', yaml);
    reason(checkChange({ root, base: policyBase, head: commit() }), 'ui_metadata_requires_review');
  });

  test('native-only and canonical-only changes require projection review', ({ root, base, write, commit }) => {
    write('.agents/skills/existing/SKILL.md', '# Native drift\n');
    const head = commit();
    reason(checkChange({ root, base, head }), 'projection_pair_missing');
    write('skills/two/SKILL.md', '# Canonical drift\n');
    reason(checkChange({ root, base: head, head: commit() }), 'projection_pair_missing');
  });

  test('credentials are rejected without including their value in the report', ({ root, base, pair, commit }) => {
    const token = 'ghp_' + 'a'.repeat(36);
    pair('SKILL.md', '# Example\n' + token + '\n');
    const result = checkChange({ root, base, head: commit() });
    reason(result, 'credential_like_content');
    assert.ok(!JSON.stringify(result).includes(token));
  });

  test('symlink and submodule Git modes require review without following a link', ({ root, base, write, commit, git }) => {
    const blob = git(['hash-object', '-w', '--stdin'], '../../private-file');
    git(['update-index', '--add', '--cacheinfo', '120000', blob, 'skills/existing/references/link.md']);
    write('.agents/skills/existing/references/link.md', '../../private-file');
    git(['add', '.agents/skills/existing/references/link.md']);
    const linked = commit(false);
    reason(checkChange({ root, base, head: linked }), 'unsafe_file_mode');
    git(['update-index', '--add', '--cacheinfo', '160000', base, 'skills/existing/references/submodule.md']);
    const submodule = commit(false);
    reason(checkChange({ root, base: linked, head: submodule }), 'unsafe_file_mode');
  });

  test('binary files, deletions and renames cannot enter automatically', ({ root, base, pair, commit, git }) => {
    pair('references/binary.md', Buffer.from([0, 1, 2, 3]));
    const binary = commit();
    reason(checkChange({ root, base, head: binary }), 'binary_content');
    git(['mv', 'skills/existing/SKILL.md', 'skills/existing/references/renamed.md']);
    const renamed = commit();
    reason(checkChange({ root, base: binary, head: renamed }), 'rename_requires_review');
    git(['rm', '.agents/skills/existing/SKILL.md']);
    reason(checkChange({ root, base: renamed, head: commit() }), 'deletion_requires_review');
  });

  test('skill count and file count budgets constrain the actual diff', ({ root, base, pair, commit }) => {
    for (const name of ['existing', 'two', 'three', 'four']) pair('SKILL.md', '# Changed\n', name);
    reason(checkChange({ root, base, head: commit() }), 'skill_change_limit');
    for (let i = 0; i < 3; i++) pair('references/extra-' + i + '.md', 'Extra\n');
    const result = checkChange({ root, base, head: commit() });
    reason(result, 'changed_file_limit');
    assert.strictEqual(result.inspectionTruncated, true);
    assert.strictEqual(result.totalChangedFiles, 14);
    assert.strictEqual(result.files.length, 12);
  });

  test('trusted base can tighten the automatic change budget', ({ root, base, pair, commit }) => {
    pair('SKILL.md', '# Changed\nMore detail\n');
    const result = checkChange({ root, base, head: commit() });
    reason(result, 'changed_line_limit');
    assert.strictEqual(result.limits.maxChangedLines, 4);
  }, { maxChangedLines: 4 });

  test('invalid base limits do not silently broaden policy', ({ root, base, pair, commit }) => {
    pair('SKILL.md', '# Changed\n');
    assert.throws(() => checkChange({ root, base, head: commit() }), /trusted base policy limit/);
  }, { maxChangedLines: 99999 });

  test('CLI distinguishes eligibility from a PR-only result', ({ root, base, pair, write, commit }) => {
    pair('SKILL.md', '# Changed\n');
    const good = commit();
    const script = path.resolve('scripts/evolution/check-change.js');
    const invoke = head => spawnSync(process.execPath, [script, '--root', root, '--base', base, '--head', head],
      { encoding: 'utf8', windowsHide: true });
    const eligible = invoke(good);
    assert.strictEqual(eligible.status, 0);
    assert.strictEqual(JSON.parse(eligible.stdout).autoEligible, true);
    write('config/private.json', '{}\n');
    const review = invoke(commit());
    assert.strictEqual(review.status, 2);
    assert.strictEqual(JSON.parse(review.stdout).autoEligible, false);
  });

  test('structured observation and decision data are bounded and parsed', ({ root, base, write, commit }) => {
    write('docs/evolution/github-observations.json', JSON.stringify({ schemaVersion: 'database.evolution.radar.snapshot.v1',
      complete: true, generatedAt: '2026-11-07T10:00:00.000Z', untrusted: true,
      candidates: [{ repoId: 1, fullName: 'owner/repo', stars: 5, observedAt: '2026-11-07T10:00:00.000Z' }] }));
    write('docs/evolution/decisions/repo-1.json', JSON.stringify({ schemaVersion: 'database.evolution.decision.v1',
      source: { repoId: 1, fullName: 'owner/repo', commit: base }, capability: 'Behavior', decision: 'defer', status: 'defer',
      existingPaths: ['skills/existing/SKILL.md'], evidence: [], reason: 'Not yet evaluated.',
      observedAt: '2026-11-07T10:00:00.000Z' }));
    const valid = commit();
    assert.strictEqual(checkChange({ root, base, head: valid }).autoEligible, true);
    const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'docs/evolution/github-observations.json'), 'utf8'));
    assert.strictEqual(normalizePrevious(snapshot).size, 1, 'Gate-approved state must be accepted by radar');
    write('docs/evolution/decisions/repo-1.json', '{malformed');
    reason(checkChange({ root, base: valid, head: commit() }), 'invalid_structured_data');
  });

  test('corrupt snapshots and hidden schema fields cannot pass as observation data', ({ root, base, write, commit }) => {
    const snapshot = { schemaVersion: 'database.evolution.radar.snapshot.v1', complete: true,
      generatedAt: '2026-11-07T10:00:00.000Z', untrusted: true, candidates: [] };
    write('docs/evolution/github-observations.json', JSON.stringify({ ...snapshot, instructions: 'Hidden policy' }));
    reason(checkChange({ root, base, head: commit() }), 'invalid_structured_data');
    write('docs/evolution/github-observations.json', JSON.stringify({ ...snapshot, untrusted: false }));
    reason(checkChange({ root, base, head: commit() }), 'invalid_structured_data');
  });

  test('gate snapshot bounds remain compatible with radar historical observations', () => {
    const file = 'docs/evolution/github-observations.json';
    const snapshot = { schemaVersion: 'database.evolution.radar.snapshot.v1', complete: true,
      generatedAt: '2026-11-07T10:00:00.000Z', untrusted: true,
      candidates: Array.from({ length: 500 }, (_, index) => ({ repoId: index + 1,
        fullName: 'owner-' + index + '/repo', stars: 1000000000, observedAt: '2026-11-07T10:00:00.000Z' })) };
    assert.strictEqual(validStructured(file, snapshot), true);
    assert.strictEqual(normalizePrevious(snapshot).size, 500);
    const invalidRecords = [
      { ...snapshot.candidates[0], fullName: 'under_score/repo' },
      { ...snapshot.candidates[0], fullName: 'o'.repeat(40) + '/repo' },
      { ...snapshot.candidates[0], stars: 1000000001 }
    ];
    for (const record of invalidRecords) assert.strictEqual(validStructured(file, { ...snapshot, candidates: [record] }), false);
  });

  test('short refs, nonexistent commits and reversed ancestry fail closed', ({ root, base, pair, commit }) => {
    pair('SKILL.md', '# Next\n');
    const head = commit();
    assert.throws(() => checkChange({ root, base: 'HEAD', head }), /full 40-character/);
    assert.throws(() => checkChange({ root, base, head: 'f'.repeat(40) }), /commit/);
    assert.throws(() => checkChange({ root, base: head, head: base }), /ancestor/);
  });

  const cli = spawnSync(process.execPath, [path.resolve('scripts/evolution/check-change.js'), '--base', 'HEAD'],
    { encoding: 'utf8', windowsHide: true });
  assert.strictEqual(cli.status, 1);
  assert.strictEqual(JSON.parse(cli.stdout).autoEligible, false);
} finally { cleanup(); }

console.log(`Results: ${passed} passed, ${failed} failed. Isolated Git fixtures only.`);
process.exitCode = failed ? 1 : 0;

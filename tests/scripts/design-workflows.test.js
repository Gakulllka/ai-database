'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { sync } = require('../../scripts/design/sync-skills');

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-design-workflows-'));
let sequence = 0;
let passed = 0;
let failed = 0;

function write(root, relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function fixture() {
  const root = path.join(scratch, String(++sequence));
  for (const name of ['design-workflow', 'character-art-direction',
    'frontend-design-direction', 'design-system', 'unrelated']) {
    write(root, `skills/${name}/SKILL.md`, `# ${name}\n`);
  }
  write(root, '.agents/skills/unrelated/SKILL.md', 'Keep local projection\n');
  return root;
}

function test(name, run) {
  try { run(fixture()); console.log('PASS: ' + name); passed++; }
  catch (error) { console.error('FAIL: ' + name + '\n' + error.message); failed++; }
}

try {
  test('check detects missing projections without writing or selecting unrelated skills', root => {
    const result = sync(false, root);
    assert.strictEqual(result.skills, 4);
    assert.strictEqual(result.differences.length, 4);
    assert.ok(!fs.existsSync(path.join(root, '.agents/skills/design-workflow')));
    assert.strictEqual(fs.readFileSync(path.join(root, '.agents/skills/unrelated/SKILL.md'), 'utf8'),
      'Keep local projection\n');
  });

  test('write repairs drift and is idempotent for nested and binary resources', root => {
    const asset = Buffer.from([0, 1, 2, 255]);
    write(root, 'skills/character-art-direction/assets/sample.bin', asset);
    write(root, 'skills/character-art-direction/references/production.md', '# Production\n');
    assert.deepStrictEqual(sync(true, root).differences, []);
    const projected = path.join(root, '.agents/skills/character-art-direction/assets/sample.bin');
    assert.deepStrictEqual(fs.readFileSync(projected), asset);
    fs.writeFileSync(projected, Buffer.from([3]));
    const before = sync(false, root);
    assert.strictEqual(before.differences.length, 1);
    assert.deepStrictEqual(fs.readFileSync(projected), Buffer.from([3]));
    sync(true, root);
    assert.deepStrictEqual(fs.readFileSync(projected), asset);
    assert.deepStrictEqual(sync(false, root).differences, []);
  });

  test('shared functional UX links resolve in the projection and root docs stay canonical', root => {
    write(root, 'skills/design-workflow/SKILL.md',
      '[UX](../frontend-design-direction/references/functional-ux.md#tables)\n' +
      '[Guide](../../docs/design/workflows.md)\n');
    write(root, 'skills/frontend-design-direction/references/functional-ux.md', '# Tables\n');
    write(root, 'docs/design/workflows.md', '# Guide\n');
    sync(true, root);
    const projected = path.join(root, '.agents/skills/design-workflow/SKILL.md');
    const text = fs.readFileSync(projected, 'utf8');
    const targets = [...text.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);
    assert.strictEqual(targets.length, 2);
    for (const target of targets) {
      assert.ok(fs.existsSync(path.resolve(path.dirname(projected), target.split('#')[0])));
    }
    assert.ok(targets[0].endsWith('#tables'));
    assert.strictEqual(path.resolve(path.dirname(projected), targets[1]),
      path.join(root, 'docs/design/workflows.md'));
  });

  test('unexpected projection files are reported and never silently deleted', root => {
    sync(true, root);
    write(root, '.agents/skills/design-workflow/local-note.md', 'Keep for review\n');
    const result = sync(true, root);
    assert.strictEqual(result.differences.length, 1);
    assert.ok(result.differences[0].startsWith('Unexpected projection file:'));
    assert.strictEqual(fs.readFileSync(path.join(root, '.agents/skills/design-workflow/local-note.md'), 'utf8'),
      'Keep for review\n');
  });

  test('source junctions or symlinks are rejected before writing any projection', root => {
    const outside = path.join(scratch, 'outside-' + sequence);
    fs.mkdirSync(outside);
    fs.symlinkSync(outside, path.join(root, 'skills/design-system/references'),
      process.platform === 'win32' ? 'junction' : 'dir');
    assert.throws(() => sync(true, root), /symbolic link|junction/);
    assert.ok(!fs.existsSync(path.join(root, '.agents/skills/design-workflow')));
  });
} finally {
  const resolved = path.resolve(scratch);
  if (path.dirname(resolved) !== path.resolve(os.tmpdir()) ||
    !path.basename(resolved).startsWith('ecc-design-workflows-')) {
    console.error('FAIL: refusing cleanup outside the generated test directory');
    failed++;
  } else {
    fs.rmSync(resolved, { recursive: true, force: true });
  }
}

console.log(`\nPassed: ${passed}\nFailed: ${failed}`);
process.exitCode = failed ? 1 : 0;

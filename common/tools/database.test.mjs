import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const installer = fileURLToPath(new URL('database.mjs', import.meta.url));
const temp = fs.realpathSync(os.tmpdir());

function command(program, args, cwd, expected = 0) {
  const result = spawnSync(program, args, { cwd, encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, expected, result.stdout + result.stderr);
  return result.stdout || result.stderr;
}

function write(directory, relative, body) {
  const fullPath = path.join(directory, relative);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, body);
}

function setupFixture(checkout) {
  const names = ['common', 'godot', '1c'];
  const packs = names.map(id => ({ id, title: id, description: id }));
  const skills = names.map(pack => ({ id: pack + '-example', pack, topic: 'example', description: 'An example' }));
  for (const { id, pack } of skills) {
    write(checkout, `${pack}/pack.json`, JSON.stringify({
      schemaVersion: 1, id: pack, dependsOn: pack === 'common' ? [] : ['common'],
      skills: [id], mounts: [{ from: 'skills', to: 'skills' }],
    }));
    write(checkout, `${pack}/skills/${id}/SKILL.md`,
      `---\nname: ${id}\ndescription: An example\n---\n\nSee [the notes](references/notes.md).\n`);
    write(checkout, `${pack}/skills/${id}/references/notes.md`, 'Reference\n');
  }
  write(checkout, 'common/catalog.json', JSON.stringify({ schemaVersion: 1, packs, skills }));
  write(checkout, 'common/templates/AGENTS.md', 'Use the catalog.\n');
  write(checkout, 'common/tools/database.mjs', fs.readFileSync(installer));
  command('git', ['init', '-q'], checkout);
  command('git', ['add', '.'], checkout);
  command('git', ['-c', 'user.name=Database Test', '-c', 'user.email=database-test@example.invalid', 'commit', '-qm', 'Fixture'], checkout);
}

test('setup preserves project guidance and retains installed packs when the goal changes', () => {
  const directory = fs.mkdtempSync(path.join(temp, 'database-onboarding-test-'));
  try {
    const checkout = path.join(directory, 'source');
    const project = path.join(directory, 'existing project');
    setupFixture(checkout);
    write(project, 'AGENTS.md', '# Existing instructions\r\n');
    write(project, 'AGENTS.override.md', '# Active instructions\n');
    write(project, '.agents/skills/common-example/SKILL.md', 'Local custom example\n');
    write(project, 'source.txt', 'Project source\n');
    const cli = (...args) => command(process.execPath, ['common/tools/database.mjs', ...args], checkout);
    assert.match(cli('verify'), /Verified 3 packs, 3 skills/);
    const selected = JSON.parse(cli('setup', '--project', project, '--pack', 'godot'));
    assert.deepEqual(selected.installed, ['common', 'godot']);
    assert.deepEqual(selected.keptLocal, ['.agents/skills/common-example/SKILL.md']);
    const original = fs.readFileSync(path.join(project, 'AGENTS.md'));
    const originalState = fs.readFileSync(path.join(project, '.database/state.json'));
    assert.match(original.toString(), /^# Existing instructions\r\n/);
    assert.match(fs.readFileSync(path.join(project, 'AGENTS.override.md'), 'utf8'), /Active instructions[\s\S]+Use the catalog/);

    cli('setup', '--project', project, '--pack', 'godot');
    assert.deepEqual(fs.readFileSync(path.join(project, 'AGENTS.md')), original);
    assert.deepEqual(fs.readFileSync(path.join(project, '.database/state.json')), originalState);

    // Model a sparse checkout by excluding the already installed topic.
    command('git', ['sparse-checkout', 'set', 'common', '1c'], checkout);
    cli('setup', '--project', project, '--pack', '1c');
    assert.deepEqual(Object.keys(JSON.parse(cli('check', '--project', project)).packs), ['common', 'godot', '1c']);
    assert.equal(fs.readFileSync(path.join(project, 'source.txt'), 'utf8'), 'Project source\n');
    const oldRoute = path.join(project, '.agents', 'skills', 'godot-example');
    const target = path.resolve(oldRoute, '../../../.database/library/godot/skills/godot-example/SKILL.md');
    assert.match(fs.readFileSync(target, 'utf8'), /the notes/);
    assert.equal(fs.readFileSync(path.join(path.dirname(target), 'references', 'notes.md'), 'utf8'), 'Reference\n');
    fs.writeFileSync(target, 'Modified tracked file\n');
    const checked = command(process.execPath, ['common/tools/database.mjs', 'check', '--project', project], checkout, 1);
    assert.deepEqual(JSON.parse(checked).changed, ['.database/library/godot/skills/godot-example/SKILL.md']);
  } finally {
    const resolved = fs.realpathSync(directory);
    assert.equal(path.dirname(resolved), temp);
    assert.ok(path.basename(resolved).startsWith('database-onboarding-test-'));
    fs.rmSync(resolved, { recursive: true });
  }
});

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { inspectProject } = require('../../skills/godot-development/scripts/inspect-project');
const { assessRun } = require('../../skills/godot-testing/scripts/run-smoke');
const { sync } = require('../../scripts/godot/sync-skills');

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-godot-pack-'));
let passed = 0;
let failed = 0;

function write(relative, value) {
  const file = path.join(scratch, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
  return file;
}

function test(name, fn) {
  try { fn(); console.log('PASS: ' + name); passed++; }
  catch (error) { console.error('FAIL: ' + name + '\n' + error.message); failed++; }
}

function digest(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function cleanup() {
  const target = path.resolve(scratch);
  if (path.dirname(target) !== path.resolve(os.tmpdir()) || !path.basename(target).startsWith('ecc-godot-pack-')) {
    throw new Error('Refusing to remove an unexpected test directory');
  }
  fs.rmSync(target, { recursive: true, force: true });
}

try {
  const project = path.join(scratch, 'mixed');
  const configuration = write('mixed/project.godot', `config_version=5
[application]
config/name="Fixture; Example"
config/features=PackedStringArray(
  "4.7",
  "C#",
  "Forward Plus"
) ; a trailing comment
run/main_scene="uid://fixture"
[rendering]
renderer/rendering_method="forward_plus"
[editor_plugins]
enabled=PackedStringArray("res://addons/example/plugin.cfg")
[autoload]
State="*res://state.gd"
`);
  write('mixed/state.gd', '@tool\nextends Node\n# This file must never execute during inspection.\n');
  write('mixed/Logic.cs', 'class Logic {}');
  write('mixed/Fixture.csproj', '<Project />');
  write('mixed/main.tscn', '[gd_scene format=3]\n[node name="Root" type="Control"]\n[node name="Map" type="Node2D" parent="."]\n[node name="World" type="Node3D" parent="."]\n');
  write('mixed/.godot/cache/unused.gd', 'invalid code that must be ignored');
  const secret = 'fixture-signing-secret-not-for-output';
  write('mixed/export_presets.cfg', 'password="' + secret + '"');
  write('mixed/private-save.json', JSON.stringify({ password: secret }));

  test('static inspection recognizes mixed dimensions and languages', () => {
    const result = inspectProject(project);
    assert.deepStrictEqual(result.languageHints, ['GDScript', 'C#']);
    assert.deepStrictEqual(result.dimensionHints, ['2D', '3D']);
    assert.strictEqual(result.declaredName, 'Fixture; Example');
    assert.strictEqual(result.declaredEngineHint, '4.7');
    assert.strictEqual(result.declaredRenderer, 'forward_plus');
    assert.strictEqual(result.declaredMainScene, 'uid://fixture');
    assert.deepStrictEqual(result.autoloadNames, ['State']);
    assert.strictEqual(result.enabledEditorPluginPaths.length, 1);
    assert.strictEqual(result.extensionCounts['.gd'], 1);
  });

  test('inspection is read-only and does not expose export/save contents', () => {
    const before = digest(configuration);
    const result = inspectProject(project);
    assert.strictEqual(digest(configuration), before);
    assert.strictEqual(result.projectSha256, before);
    assert.ok(!JSON.stringify(result).includes(secret));
    assert.ok(!fs.existsSync(path.join(project, 'executed.txt')));
    assert.deepStrictEqual(fs.readdirSync(path.join(project, '.godot/cache')), ['unused.gd']);
  });

  test('physics settings do not falsely classify a UI-only project as 3D', () => {
    const folder = path.join(scratch, 'ui-only');
    write('ui-only/project.godot', 'config_version=5\n[physics]\n3d/physics_engine="Jolt Physics"\n');
    write('ui-only/main.tscn', '[gd_scene format=3]\n[node name="Root" type="Control"]\n');
    const result = inspectProject(folder);
    assert.deepStrictEqual(result.dimensionHints, []);
    assert.strictEqual(result.declaredEngineHint, null);
  });

  test('file and directory budgets report incomplete scans', () => {
    assert.strictEqual(inspectProject(project, { maxFiles: 1 }).scan.truncated, true);
    write('budget/project.godot', 'config_version=5');
    write('budget/nested/main.gd', 'extends Node');
    assert.strictEqual(inspectProject(path.join(scratch, 'budget'), { maxDirectories: 1 }).scan.truncated, true);
    assert.throws(() => inspectProject(project, { maxFiles: 0 }), /positive/);
    const limited = inspectProject(project, { maxEntries: 1 });
    assert.strictEqual(limited.scan.truncated, true);
    assert.strictEqual(limited.scan.scannedEntries, 1);
    assert.throws(() => inspectProject(project, { maxEntries: 0 }), /positive/);
  });

  test('linked directories are not traversed', () => {
    const outside = path.join(scratch, 'other-project');
    write('other-project/extra.cs', 'private source');
    fs.symlinkSync(outside, path.join(project, 'linked-project'), process.platform === 'win32' ? 'junction' : 'dir');
    const result = inspectProject(project);
    assert.strictEqual(result.scan.skippedLinks, 1);
    assert.strictEqual(result.extensionCounts['.cs'], 1);
  });

  test('malformed arrays do not consume or expose following settings', () => {
    const folder = path.join(scratch, 'malformed');
    write('malformed/project.godot', '[application]\nconfig/features=PackedStringArray(\nauth/password="' + secret + '"\n[rendering]\nrenderer/rendering_method="mobile"\n');
    const result = inspectProject(folder);
    assert.deepStrictEqual(result.declaredFeatures, []);
    assert.ok(result.inspectionWarnings.length > 0);
    assert.strictEqual(result.declaredRenderer, 'mobile');
    assert.ok(!JSON.stringify(result).includes(secret));
  });

  test('smoke assessment requires assertions and rejects zero-exit engine errors', () => {
    const stdout = 'ECC_GODOT_SMOKE:' + JSON.stringify({ dimension: '2D', checks: 4, physics_ticks: 4 });
    const result = { exitCode: 0, signal: null, stdout, stderr: '' };
    assert.strictEqual(assessRun(result, '2D').passed, true);
    assert.strictEqual(assessRun({ ...result, stderr: 'SCRIPT ERROR: bad script' }, '2D').passed, false);
    assert.strictEqual(assessRun({ ...result, stdout: 'engine started only' }, '2D').passed, false);
    assert.strictEqual(assessRun({ ...result, exitCode: 1 }, '2D').passed, false);
    assert.strictEqual(assessRun(result, '3D').passed, false);
  });

  test('Godot projections include GDScript and preserve cross-tree references', () => {
    const fixture = path.join(scratch, 'projection');
    write('projection/skills/godot-fixture/SKILL.md', '[rules](../../rules/godot/)\n[language](../gdscript-patterns/SKILL.md)');
    write('projection/skills/gdscript-patterns/SKILL.md', '# GDScript');
    write('projection/skills/1c-excluded/SKILL.md', '# Other pack');
    fs.mkdirSync(path.join(fixture, '.agents/skills'), { recursive: true });
    assert.strictEqual(sync(false, fixture).skills, 2);
    assert.ok(!fs.existsSync(path.join(fixture, '.agents/skills/godot-fixture/SKILL.md')));
    sync(true, fixture);
    assert.deepStrictEqual(sync(false, fixture).differences, []);
    assert.ok(fs.readFileSync(path.join(fixture, '.agents/skills/godot-fixture/SKILL.md'), 'utf8').includes('../../../rules/godot/'));
    assert.ok(!fs.existsSync(path.join(fixture, '.agents/skills/1c-excluded')));
  });

  test('actual Godot projection matches canonical sources', () => {
    assert.deepStrictEqual(sync(false).differences, []);
  });

  test('missing project files fail instead of claiming readiness', () => {
    assert.throws(() => inspectProject(path.join(scratch, 'missing')), /ENOENT/);
  });
} finally {
  cleanup();
}

console.log(`Results: ${passed} passed, ${failed} failed; no game or engine launched by this suite.`);
process.exitCode = failed ? 1 : 0;

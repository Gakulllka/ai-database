'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const { buildPackCatalog, fetchPack, findPacks, packHierarchy, planPack, readPackCatalog } =
  require('../../scripts/lib/skill-packs');

const root = path.resolve(__dirname, '../..');
const catalog = readPackCatalog(root);

test('every canonical skill belongs to one pack and one navigation group', () => {
  const names = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(root, 'skills', entry.name, 'SKILL.md')))
    .map(entry => entry.name).sort();
  const groups = packHierarchy(catalog);
  const paths = groups.flatMap(group => group.packs.flatMap(pack => pack.skills)).sort();
  assert.deepEqual(paths, names);
  assert.equal(new Set(paths).size, names.length);
  assert.equal(groups.flatMap(group => group.packs).length, catalog.packs.size);
});

test('find returns the relevant complete pack on Russian and English task queries', () => {
  const probes = [
    ['плейтест игры', 'game-playtest'],
    ['баланс урона в игре', 'game-balance'],
    ['1С управляемые формы', '1c-development'],
    ['найди задачу в Планфикс', '1c-development'],
    ['настрой складские остатки в 1С', '1c-development'],
    ['учебная лаборатория по исследованиям', 'learning-workflows'],
    ['keyboard navigation in a React settings form', 'framework-language'],
    ['monitor production URL after deploy for errors', 'devops-infra'],
  ];
  for (const [query, id] of probes) assert.equal(findPacks(catalog, query)[0]?.id, id, query);
});

test('group plans include declared dependencies and complete module paths once', () => {
  const oneCPlan = planPack(catalog, '1c-development');
  for (const skill of ['article-writing', 'content-engine', 'ui-demo', 'planfix-tracker']) {
    assert.equal(catalog.owners.get(skill), '1c-development');
    assert.ok(oneCPlan.paths.includes('skills/' + skill));
  }
  const plan = planPack(catalog, 'games-design-media');
  assert.ok(plan.requestedModules.includes('game-balance'));
  assert.ok(plan.requestedModules.includes('godot-development'));
  assert.ok(plan.modules.includes('platform-configs'));
  assert.ok(plan.paths.includes('skills/game-balance'));
  assert.ok(plan.paths.includes('assets/visual-project-skills'));
  assert.equal(new Set(plan.paths).size, plan.paths.length);
  assert.throws(() => planPack(catalog, 'unknown-pack'), /Unknown skill pack/);
});

function git(root, args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function fixture(t) {
  const parent = fs.realpathSync(os.tmpdir());
  const workspace = fs.mkdtempSync(path.join(parent, 'skill-packs-test-'));
  t.after(() => {
    if (path.dirname(fs.realpathSync(workspace)) === parent && !fs.lstatSync(workspace).isSymbolicLink()) {
      fs.rmSync(workspace, { recursive: true, force: true });
    }
  });
  const remote = path.join(workspace, 'origin');
  fs.mkdirSync(remote);
  const moduleData = { modules: [
    { id: 'workflow', description: 'Main', paths: ['skills/example'], targets: ['codex'], dependencies: ['shared'] },
    { id: 'shared', description: 'Support', paths: ['assets/runtime.txt'], targets: ['codex'], dependencies: [] },
    { id: 'other', description: 'Other', paths: ['skills/other'], targets: ['codex'], dependencies: [] },
  ] };
  const groupData = { schemaVersion: 1, groups: [{
    id: 'topics', title: 'Topics', description: 'Task packs', keywords: [],
    packs: [
      { id: 'workflow', title: 'Workflow', keywords: [] },
      { id: 'other', title: 'Other', keywords: [] },
    ],
  }] };
  const files = {
    'LICENSE': 'license',
    'manifests/skill-pack-groups.json': JSON.stringify(groupData),
    'manifests/install-modules.json': JSON.stringify(moduleData),
    'skills/example/SKILL.md': 'instructions',
    'skills/example/references/example.md': 'complete reference',
    'skills/example/assets/demo.bin': Buffer.from([0, 1, 255]),
    'skills/other/SKILL.md': 'unrelated',
    'assets/runtime.txt': 'declared support',
    'assets/unrelated.txt': 'not included',
  };
  for (const [name, content] of Object.entries(files)) {
    const target = path.join(remote, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  git(remote, ['init', '-b', 'database']);
  git(remote, ['config', 'uploadpack.allowFilter', 'true']);
  git(remote, ['add', '.']);
  git(remote, ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'fixture']);
  return { workspace, remote, moduleData, groupData };
}

test('fetch checks out one pinned revision with whole skill trees and declared support', t => {
  const { workspace, remote } = fixture(t);
  const result = fetchPack('workflow', workspace, { remote: pathToFileURL(remote).href });
  assert.equal(result.revision, git(remote, ['rev-parse', 'HEAD']));
  assert.equal(git(result.destination, ['rev-parse', 'HEAD']), result.revision);
  const exists = file => fs.existsSync(path.join(result.destination, file));
  const read = file => fs.readFileSync(path.join(result.destination, file));
  assert.equal(read('skills/example/references/example.md').toString(), 'complete reference');
  assert.deepEqual(read('skills/example/assets/demo.bin'), Buffer.from([0, 1, 255]));
  assert.equal(read('assets/runtime.txt').toString(), 'declared support');
  assert.ok(exists('LICENSE'));
  assert.equal(exists('skills/other'), false);
  assert.equal(exists('assets/unrelated.txt'), false);
  assert.throws(() => fetchPack('missing', workspace, { remote: pathToFileURL(remote).href }), /Unknown skill pack/);
  assert.equal(fs.readdirSync(workspace).filter(name => name.startsWith('missing-')).length, 0);
});

test('catalog rejects duplicate ownership, missing packs and unsafe paths', t => {
  const { moduleData, groupData } = fixture(t);
  moduleData.modules[1].paths = ['../outside'];
  assert.throws(() => planPack(buildPackCatalog(groupData, moduleData), 'workflow'), /Unsupported pack source path/);
  moduleData.modules[1].paths = ['skills/example'];
  assert.throws(() => buildPackCatalog(groupData, moduleData), /Duplicate skill owner/);
  moduleData.modules[1].paths = ['assets/runtime.txt'];
  groupData.groups[0].packs.pop();
  assert.throws(() => buildPackCatalog(groupData, moduleData), /Skill pack missing/);
});

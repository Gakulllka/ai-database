'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DATABASE_REMOTE = 'https://github.com/Gakulllka/ai-database.git';
const DATABASE_BRANCH = 'database';
const GROUPS_FILE = 'manifests/skill-pack-groups.json';
const MODULES_FILE = 'manifests/install-modules.json';
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SKILL_DIR = /^skills\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const SPARSE_PATH = /^[\w.@+-]+(?:\/[\w.@+-]+)*$/;

function checkEntry(entry) {
  if (!ID.test(entry?.id || '') || typeof entry.title !== 'string' || !entry.title.trim()
    || !Array.isArray(entry.keywords) || entry.keywords.some(value => typeof value !== 'string' || !value.trim())) {
    throw new Error('Invalid skill pack catalog entry');
  }
}

function buildPackCatalog(document, source) {
  if (document?.schemaVersion !== 1 || !Array.isArray(document.groups) || !Array.isArray(source?.modules)) {
    throw new Error('Invalid skill pack catalog or install modules');
  }
  const modules = new Map();
  const owners = new Map();
  for (const module of source.modules) {
    if (!ID.test(module.id || '') || modules.has(module.id) || !Array.isArray(module.paths)
      || !Array.isArray(module.targets) || !Array.isArray(module.dependencies)) {
      throw new Error('Invalid or duplicate install module');
    }
    const skills = module.paths.flatMap(item => {
      const match = SKILL_DIR.exec(item);
      if (!match) return [];
      if (owners.has(match[1])) throw new Error('Duplicate skill owner: ' + match[1]);
      owners.set(match[1], module.id);
      return [match[1]];
    }).sort();
    modules.set(module.id, { ...module, skills });
  }

  const groups = new Map();
  const packs = new Map();
  for (const group of document.groups) {
    checkEntry(group);
    if (groups.has(group.id) || typeof group.description !== 'string' || !group.description.trim()
      || !Array.isArray(group.packs) || group.packs.length === 0) {
      throw new Error('Invalid or duplicate skill group: ' + group.id);
    }
    groups.set(group.id, group);
    for (const pack of group.packs) {
      checkEntry(pack);
      if (pack.anchors !== undefined && (!Array.isArray(pack.anchors)
        || pack.anchors.some(value => typeof value !== 'string' || words(value).length !== 1))) {
        throw new Error('Invalid skill pack platform anchors: ' + pack.id);
      }
      const module = modules.get(pack.id);
      if (!module?.skills.length || packs.has(pack.id)) throw new Error('Invalid or duplicate skill pack: ' + pack.id);
      packs.set(pack.id, {
        ...pack, group: group.id, description: module.description, targets: module.targets, skills: module.skills,
      });
    }
  }
  for (const [id, module] of modules) {
    if (module.skills.length && !packs.has(id)) throw new Error('Skill pack missing from catalog: ' + id);
  }
  for (const id of groups.keys()) {
    if (packs.has(id)) throw new Error('Ambiguous group and pack ID: ' + id);
  }
  return { groups, packs, modules, owners };
}

function readPackCatalog(root) {
  return buildPackCatalog(...[GROUPS_FILE, MODULES_FILE].map(file =>
    JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))));
}

function packHierarchy(catalog) {
  return [...catalog.groups.values()].map(group => ({
    ...group,
    packs: group.packs.map(({ id }) => catalog.packs.get(id)),
  }));
}

function words(value) {
  return value.normalize('NFKC').toLowerCase().replaceAll('ё', 'е').match(/[\p{L}\p{N}]+/gu) || [];
}

function matchCount(terms, keywords) {
  return terms.filter(term => keywords.some(keyword => term === keyword
    || (Math.min(term.length, keyword.length) >= 4 && (term.startsWith(keyword) || keyword.startsWith(term))))).length;
}

function findPacks(catalog, query) {
  const terms = [...new Set(words(query))];
  if (!terms.length) return [];
  return [...catalog.packs.values()].flatMap(pack => {
    const group = catalog.groups.get(pack.group);
    const direct = matchCount(terms, words([pack.id, pack.title, ...pack.keywords].join(' ')));
    const skills = matchCount(terms, words(pack.skills.join(' ')));
    const broader = matchCount(terms, words([group.id, group.title, ...group.keywords].join(' ')));
    const exact = query.trim().toLowerCase() === pack.id;
    const anchors = new Set((pack.anchors || []).flatMap(words));
    const namedPlatform = terms.some(term => anchors.has(term));
    const score = (exact ? 1000 : 0) + (namedPlatform ? 32 : 0) + direct * 6 + skills * 2 + broader;
    return score ? [{ ...pack, score }] : [];
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, 8);
}

function validateSourcePath(value) {
  if (typeof value !== 'string' || !SPARSE_PATH.test(value)
    || value.split('/').some(part => part === '.' || part === '..' || part.toLowerCase() === '.git')) {
    throw new Error('Unsupported pack source path: ' + value);
  }
  return value;
}

function planPack(catalog, id) {
  const group = catalog.groups.get(id);
  const pack = catalog.packs.get(id);
  if (!group && !pack) throw new Error('Unknown skill pack or group: ' + id);
  const requestedModules = group ? group.packs.map(entry => entry.id) : [id];
  const selected = new Set();
  function addModule(moduleId) {
    if (selected.has(moduleId)) return;
    const module = catalog.modules.get(moduleId);
    if (!module) throw new Error('Unknown install dependency: ' + moduleId);
    selected.add(moduleId);
    for (const dependency of module.dependencies) addModule(dependency);
  }
  for (const moduleId of requestedModules) addModule(moduleId);
  const modules = [...selected];
  const paths = [...new Set(modules.flatMap(moduleId => catalog.modules.get(moduleId).paths))]
    .map(validateSourcePath).sort();
  const skills = modules.flatMap(moduleId => catalog.modules.get(moduleId).skills).sort();
  return { id, title: (group || pack).title, requestedModules, modules, skills, paths };
}

function git(args, cwd, input) {
  const result = spawnSync('git', args, {
    cwd, input, encoding: 'utf8', windowsHide: true, timeout: 240000,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'Git failed').trim());
  return result.stdout;
}

function fetchPack(id, into, { remote = DATABASE_REMOTE, branch = DATABASE_BRANCH } = {}) {
  if (!ID.test(id || '')) throw new Error('Invalid skill pack or group ID');
  const parent = fs.realpathSync(path.resolve(into));
  const destination = fs.mkdtempSync(path.join(parent, id + '-'));
  try {
    git(['clone', '--filter=blob:none', '--depth', '1', '--single-branch', '--no-checkout', '--branch', branch, '--', remote, destination], parent);
    const revision = git(['rev-parse', 'HEAD'], destination).trim();
    const catalog = buildPackCatalog(...[GROUPS_FILE, MODULES_FILE].map(file =>
      JSON.parse(git(['show', revision + ':' + file], destination))));
    const plan = planPack(catalog, id);
    const paths = [...new Set(['LICENSE', GROUPS_FILE, MODULES_FILE, ...plan.paths])];
    git(['sparse-checkout', 'set', '--no-cone', '--stdin'], destination, paths.map(file => '/' + file + '\n').join(''));
    git(['checkout', '--detach', revision], destination);
    return { ...plan, paths, revision, destination };
  } catch (error) {
    const stat = fs.lstatSync(destination, { throwIfNoEntry: false });
    if (stat?.isDirectory() && !stat.isSymbolicLink() && path.dirname(fs.realpathSync(destination)) === parent) {
      fs.rmSync(destination, { recursive: true, force: true });
    }
    throw error;
  }
}

module.exports = { buildPackCatalog, fetchPack, findPacks, packHierarchy, planPack, readPackCatalog };

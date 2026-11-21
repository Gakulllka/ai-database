import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../..', import.meta.url));
const statePath = '.database/state.json';
const lockPath = '.database/setup.lock';
const begin = '<!-- database:begin -->';
const end = '<!-- database:end -->';
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const rootPack = 'common';
const installAreas = new Set(['skills', 'rules', 'codex-agents', 'docs', 'scripts',
  'schemas', 'assets', 'references', 'templates', 'examples', 'hooks', 'licenses',
  'commands', 'config', 'guides', 'mcp-configs', 'tests', 'manifests', 'tools']);

function assert(condition, reason) {
  if (!condition) throw new Error(reason);
}

function splitRelative(relative) {
  assert(typeof relative === 'string', 'Invalid path');
  const pieces = relative.split('/');
  assert(pieces.every(piece => piece && !/^[.]{1,2}$|[. ]$|[<>:"\\|?*\x00-\x1f]/.test(piece)
    && !/^(?:\.git|con|prn|aux|nul|(?:com|lpt)[0-9])(?:\.|$)/i.test(piece)), `Invalid path: ${relative}`);
  return pieces;
}

function info(file) {
  try { return fs.lstatSync(file); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return null;
  }
}

function checked(root, relative, createParents = false) {
  let location = root;
  const pieces = splitRelative(relative);
  for (const [index, piece] of pieces.entries()) {
    location = path.join(location, piece);
    const entry = info(location);
    assert(!entry?.isSymbolicLink(), `Symbolic link in path: ${location}`);
    if (index < pieces.length - 1) {
      if (!entry && createParents) fs.mkdirSync(location, { recursive: false });
      assert(!entry || entry.isDirectory(), `Expected directory: ${location}`);
    }
  }
  return location;
}

function read(root, relative) {
  const file = checked(root, relative);
  const entry = info(file);
  assert(!entry || entry.isFile(), `Expected file: ${file}`);
  return entry ? fs.readFileSync(file) : null;
}

function json(root, relative) {
  const bytes = read(root, relative);
  assert(bytes, `Missing ${relative} in ${root}`);
  return JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
}

function bytesJson(value) {
  return Buffer.from(JSON.stringify(value, null, 2) + '\n');
}

function hash(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function save(root, relative, bytes, mode, expected) {
  const destination = checked(root, relative, true);
  const previous = read(root, relative);
  const currentHash = () => {
    const current = read(root, relative);
    return current && hash(current);
  };
  if (previous?.equals(bytes)) return;
  assert(expected === undefined || currentHash() === expected, `Changed during setup: ${relative}`);
  const pending = destination + '.database-' + randomUUID();
  try {
    fs.writeFileSync(pending, bytes, { flag: 'wx', mode: mode || info(destination)?.mode || 0o644 });
    assert(expected === undefined || currentHash() === expected, `Changed during setup: ${relative}`);
    fs.renameSync(pending, destination);
  } finally {
    if (info(pending)?.isFile()) fs.unlinkSync(pending);
  }
}

function catalog() {
  const data = json(source, 'common/catalog.json');
  assert(data.schemaVersion === 1 && Array.isArray(data.packs) && Array.isArray(data.skills), 'Invalid catalog');
  const packs = new Set();
  for (const pack of data.packs) {
    assert(idPattern.test(pack.id) && !packs.has(pack.id), `Invalid or repeated pack: ${pack.id}`);
    packs.add(pack.id);
  }
  assert(packs.has(rootPack), 'Missing common pack');
  const skills = new Set();
  for (const skill of data.skills) {
    assert(idPattern.test(skill.id) && !skills.has(skill.id) && packs.has(skill.pack)
      && typeof skill.description === 'string' && skill.description.trim(), `Invalid catalog skill: ${skill.id}`);
    skills.add(skill.id);
  }
  return data;
}

function selectedPacks(data, requested) {
  const loaded = new Map();
  const visiting = new Set();
  function visit(id) {
    if (loaded.has(id)) return;
    assert(data.packs.some(pack => pack.id === id), `Unknown pack: ${id}`);
    assert(!visiting.has(id), `Circular pack dependency: ${id}`);
    visiting.add(id);
    assert(read(source, `${id}/pack.json`), `Fetch the whole pack first: git sparse-checkout add ${id}`);
    const manifest = json(source, `${id}/pack.json`);
    assert(manifest.schemaVersion === 1 && manifest.id === id && Array.isArray(manifest.dependsOn)
      && Array.isArray(manifest.mounts) && Array.isArray(manifest.skills), `Invalid pack manifest: ${id}`);
    const includesCommon = manifest.dependsOn.includes(rootPack);
    assert(id === rootPack ? manifest.dependsOn.length === 0 : includesCommon,
      `Invalid common dependency: ${id}`);
    const expected = data.skills.filter(skill => skill.pack === id).map(skill => skill.id).sort();
    assert(JSON.stringify([...manifest.skills].sort()) === JSON.stringify(expected), `Catalog mismatch: ${id}`);
    for (const dependency of manifest.dependsOn) visit(dependency);
    visiting.delete(id);
    loaded.set(id, manifest);
  }
  visit(rootPack);
  for (const id of requested) visit(id);
  return loaded;
}

function* walk(root, relative) {
  const location = checked(root, relative);
  assert(info(location)?.isDirectory(), `Missing pack directory: ${relative}`);
  for (const entry of fs.readdirSync(location, { withFileTypes: true })) {
    const child = `${relative}/${entry.name}`;
    if (entry.isDirectory()) yield* walk(root, child);
    else {
      assert(entry.isFile(), `Expected a regular file: ${child}`);
      yield child;
    }
  }
}

function skillHeader(content, id) {
  const header = content.toString('utf8').replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]+?)\r?\n---(?=\r?\n|$)/);
  assert(header && new RegExp(`^name:\\s*['"]?${id}['"]?\\s*$`, 'm').test(header[1])
    && /^description:/m.test(header[1]), `Invalid SKILL.md frontmatter: ${id}`);
  return header[0];
}

function payload(packs) {
  const files = new Map();
  const normalizedPaths = new Set();
  function add(relative, bytes, pack, mode) {
    const normalized = relative.toLowerCase();
    const duplicate = files.get(relative);
    assert(!normalizedPaths.has(normalized) || Boolean(duplicate?.bytes.equals(bytes)),
      `Packs disagree on ${relative}`);
    normalizedPaths.add(normalized);
    if (duplicate) {
      duplicate.packs.push(pack);
    } else {
      files.set(relative, { bytes, packs: [pack], mode });
    }
  }
  for (const [id, manifest] of packs) {
    const packageFiles = ['pack.json', 'README.md'];
    if (id === rootPack) packageFiles.push('catalog.json');
    for (const name of packageFiles) {
      const content = read(source, `${id}/${name}`);
      if (content) add(`.database/library/${id}/${name}`, content, id);
    }
    if (id === rootPack) {
      const entrypoint = read(source, 'README.md');
      if (entrypoint) add('.database/library/README.md', entrypoint, id);
    }
    assert(manifest.mounts.some(mount => mount.from === 'skills' && mount.to === 'skills'), `No skill mount in ${id}`);
    for (const { from, to } of manifest.mounts) {
      assert(from === to && installAreas.has(from), `Unsupported pack mount: ${id}/${from}`);
      for (const file of walk(source, `${id}/${from}`)) {
        const suffix = file.slice(id.length + from.length + 2);
        const bytes = read(source, file);
        const mode = info(checked(source, file)).mode;
        add(`.database/library/${id}/${to}/${suffix}`, bytes, id, mode);
        if (to === 'codex-agents') {
          assert(/^[a-z0-9-]+\.toml$/.test(suffix), `Invalid Codex agent: ${file}`);
          add(`.codex/agents/${suffix}`, bytes, id, mode);
        }
      }
    }

    const actual = fs.readdirSync(checked(source, `${id}/skills`), { withFileTypes: true })
      .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
    assert(JSON.stringify(actual) === JSON.stringify([...manifest.skills].sort()), `Pack skill folders disagree: ${id}`);
    for (const skill of manifest.skills) {
      const content = read(source, `${id}/skills/${skill}/SKILL.md`);
      assert(content, `Missing skill: ${id}/${skill}`);
      const header = skillHeader(content, skill);
      const destination = `.agents/skills/${skill}`;
      const link = `../../../.database/library/${id}/skills/${skill}/SKILL.md`;
      const wrapper = `${header}\n\nRead [the installed Database skill](${link}) before applying it. Resolve its relative resources from that file's directory.\n`;
      add(`${destination}/SKILL.md`, Buffer.from(wrapper), id);
      const metadata = read(source, `${id}/skills/${skill}/agents/openai.yaml`);
      if (metadata) add(`${destination}/agents/openai.yaml`, metadata, id);
    }
  }
  return files;
}

function projectRoot(value) {
  assert(value && path.isAbsolute(value), 'Use --project with an absolute existing project directory');
  const target = fs.realpathSync(value);
  const sourceReal = fs.realpathSync(source);
  const relative = path.relative(sourceReal, target);
  assert(info(target)?.isDirectory() && target !== path.parse(target).root, 'Choose an existing project directory');
  assert(relative && (relative.startsWith('..' + path.sep) || relative === '..' || path.isAbsolute(relative)),
    'The target must be outside the Database source checkout');
  return target;
}

function state(project) {
  const previous = read(project, statePath);
  if (!previous) return { schemaVersion: 1, packs: {}, files: {} };
  const data = json(project, statePath);
  assert(data.schemaVersion === 1 && data.packs && data.files, 'Invalid Database project state');
  for (const [relative, entry] of Object.entries(data.files)) {
    assert(/^(?:\.database\/library\/|\.agents\/skills\/|\.codex\/agents\/)/.test(relative)
      && /^[a-f0-9]{64}$/.test(entry.hash) && Array.isArray(entry.packs), `Invalid recorded file: ${relative}`);
    splitRelative(relative);
  }
  return data;
}

function instructions(project, needsOverride) {
  const template = read(source, 'common/templates/AGENTS.md').toString('utf8').replace(/\r\n/g, '\n').trimEnd();
  const result = new Map();
  for (const relative of needsOverride ? ['AGENTS.md', 'AGENTS.override.md'] : ['AGENTS.md']) {
    const before = read(project, relative);
    const previous = before?.toString('utf8') ?? '';
    const start = previous.indexOf(begin);
    const stop = previous.indexOf(end);
    const newline = previous.includes('\r\n') ? '\r\n' : '\n';
    assert((start < 0 && stop < 0) || (start >= 0 && stop > start && previous.indexOf(begin, start + 1) < 0
      && previous.indexOf(end, stop + 1) < 0), `Broken Database markers in ${relative}`);
    const block = `${begin}\n${template}\n${end}`.replaceAll('\n', newline);
    const desired = start >= 0
      ? previous.slice(0, start) + block + previous.slice(stop + end.length)
      : previous + (previous ? newline + newline : '') + block + newline;
    result.set(relative, { bytes: Buffer.from(desired), expected: before && hash(before) });
  }
  return result;
}

function sourceRevision() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8', windowsHide: true });
  const revision = result.stdout?.trim();
  assert(result.status === 0 && /^[a-f0-9]{40,64}$/.test(revision), 'Use a Git checkout so setup can record its revision');
  const status = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], {
    cwd: source, encoding: 'utf8', windowsHide: true,
  });
  assert(status.status === 0 && !status.stdout.trim(), 'Setup requires a clean Database checkout');
  return revision;
}

function install(project, packs, files, revision) {
  const previous = state(project);
  const next = { schemaVersion: 1, packs: { ...previous.packs }, files: { ...previous.files } };
  const guidance = instructions(project, Boolean(read(project, 'AGENTS.override.md')));
  const retire = [];
  const skipped = [];
  const writes = [];
  const overriddenSkills = new Set();
  for (const [relative, entry] of files) {
    const match = relative.match(/^\.agents\/skills\/([a-z0-9-]+)\/SKILL\.md$/);
    if (!match || previous.files[relative]) continue;
    const current = read(project, relative);
    if (current && !current.equals(entry.bytes)) overriddenSkills.add(match[1]);
  }
  for (const [relative, entry] of files) {
    const current = read(project, relative);
    const currentHash = current && hash(current);
    const desiredHash = hash(entry.bytes);
    const old = previous.files[relative];
    const skill = relative.match(/^\.agents\/skills\/([a-z0-9-]+)\//)?.[1];
    if (overriddenSkills.has(skill) || (current && currentHash !== desiredHash && old?.hash !== currentHash)) {
      assert(!relative.startsWith('.database/library/'), `Local library conflict: ${relative}`);
      if (old) delete next.files[relative];
      skipped.push(relative);
      continue;
    }
    if (currentHash !== desiredHash) writes.push([relative, entry.bytes, entry.mode, currentHash]);
    next.files[relative] = { hash: desiredHash, packs: [...new Set([...(old?.packs ?? []), ...entry.packs])].sort() };
  }
  for (const [relative, entry] of Object.entries(previous.files)) {
    if (files.has(relative)) continue;
    const owners = entry.packs.filter(id => !packs.has(id));
    if (owners.length) {
      next.files[relative] = { ...entry, packs: owners };
      continue;
    }
    const current = read(project, relative);
    if (current && hash(current) === entry.hash) retire.push([relative, entry.hash]);
    else if (current) skipped.push(relative);
    delete next.files[relative];
  }
  for (const id of packs.keys()) next.packs[id] = revision;
  next.keptLocal = [...new Set([...(previous.keptLocal ?? []).filter(relative => !files.has(relative)), ...skipped])].sort();
  for (const [relative, bytes, mode, expected] of writes) save(project, relative, bytes, mode, expected);
  for (const [relative, { bytes, expected }] of guidance) save(project, relative, bytes, undefined, expected);
  for (const [relative, expected] of retire) {
    const current = read(project, relative);
    if (current && hash(current) === expected) fs.unlinkSync(checked(project, relative));
  }
  save(project, statePath, bytesJson(next));
  console.log(JSON.stringify({ project, installed: Object.keys(next.packs), revision, keptLocal: skipped }, null, 2));
}

function verifyProject(project) {
  assert(read(project, statePath), `Database is not installed in ${project}`);
  const data = state(project);
  const changed = Object.entries(data.files).filter(([relative, entry]) => {
    const current = read(project, relative);
    return !current || hash(current) !== entry.hash;
  }).map(([relative]) => relative);
  const active = read(project, 'AGENTS.override.md') ?? read(project, 'AGENTS.md');
  const guidance = Boolean(active?.includes(begin) && active.includes(end));
  console.log(JSON.stringify({ project, packs: data.packs, trackedFiles: Object.keys(data.files).length, guidance, changed, keptLocal: data.keptLocal ?? [] }, null, 2));
  if (changed.length || !guidance) process.exitCode = 1;
}

function argumentsFor(command, args) {
  const packs = [];
  let target;
  for (let index = 0; index < args.length; index += 2) {
    const [flag, value] = args.slice(index, index + 2);
    assert(value && !value.startsWith('--'), `Missing value for ${flag}`);
    if (flag === '--project' && !target) target = value;
    else if (command === 'setup' && flag === '--pack') packs.push(value);
    else throw new Error(`Unexpected argument: ${flag}`);
  }
  return { project: projectRoot(target), packs };
}

function main([command, ...args]) {
  assert(['catalog', 'verify', 'setup', 'check'].includes(command),
    'Usage: database.mjs catalog | verify | setup --project PATH [--pack ID ...] | check --project PATH');
  if (command === 'check') return verifyProject(argumentsFor(command, args).project);
  const data = catalog();
  if (command === 'catalog' || command === 'verify') {
    assert(!args.length, `Unexpected arguments for ${command}`);
    if (command === 'catalog') {
      console.log(JSON.stringify(data, null, 2));
      return;
    }
    const files = payload(selectedPacks(data, data.packs.map(pack => pack.id)));
    console.log(`Verified ${data.packs.length} packs, ${data.skills.length} skills and ${files.size} installed files.`);
    return;
  }
  const options = argumentsFor(command, args);
  const packs = selectedPacks(data, options.packs);
  const files = payload(packs);
  const revision = sourceRevision();
  const lock = checked(options.project, lockPath, true);
  let handle;
  try {
    handle = fs.openSync(lock, 'wx');
    fs.writeFileSync(handle, String(process.pid) + '\n');
    install(options.project, packs, files, revision);
  } finally {
    if (handle !== undefined) {
      fs.closeSync(handle);
      fs.unlinkSync(lock);
    }
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

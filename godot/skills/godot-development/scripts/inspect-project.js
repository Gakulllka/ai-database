#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IGNORED = new Set(['.git', '.godot', '.import', 'node_modules', 'build', 'builds',
  'dist', 'tmp', 'temp', '.mono', 'bin', 'obj']);
const EXTENSIONS = ['.gd', '.cs', '.csproj', '.tscn', '.scn', '.tres', '.res', '.gdextension'];

function quotedStrings(value) {
  return [...value.matchAll(/"(?:\\.|[^"\\])*"/g)].flatMap(match => {
    try { return [JSON.parse(match[0])]; } catch { return []; }
  });
}

function withoutComments(value) {
  let quoted = false;
  let escaped = false;
  let result = '';
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (!quoted && character === ';') {
      while (index < value.length && value[index] !== '\n') index++;
      if (index < value.length) result += '\n';
      continue;
    }
    result += character;
    if (escaped) { escaped = false; continue; }
    if (quoted && character === '\\') { escaped = true; continue; }
    if (character === '"') quoted = !quoted;
  }
  return result;
}

function stringArray(value) {
  const expression = withoutComments(value).trim();
  const match = expression.match(/^(?:PackedStringArray|PoolStringArray)\(([\s\S]*)\)$/);
  if (!match) return null;
  const remainder = match[1].replace(/"(?:\\.|[^"\\])*"/g, '""');
  if (!/^\s*(?:""\s*(?:,\s*""\s*)*,?\s*)?$/.test(remainder)) return null;
  const values = quotedStrings(match[1]);
  if (values.length !== (remainder.match(/""/g) || []).length) return null;
  return values;
}

function settingsFromText(text) {
  const settings = {};
  let section = '';
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    const header = line.match(/^\[([^\]]+)\]\s*(?:;.*)?$/);
    if (header) { section = header[1]; continue; }
    const pair = line.match(/^([A-Za-z0-9_./]+)\s*=\s*(.*)$/);
    if (!pair) continue;
    let value = pair[2];
    if (value.startsWith('PackedStringArray(') || value.startsWith('PoolStringArray(')) {
      while (!withoutComments(value).trimEnd().endsWith(')') && index + 1 < lines.length) {
        if (/^\s*(?:\[|[A-Za-z0-9_./]+\s*=)/.test(lines[index + 1])) break;
        value += '\n' + lines[++index];
      }
    }
    settings[section ? section + '/' + pair[1] : pair[1]] = value;
  }
  return settings;
}

function* projectFiles(root, limits, scan) {
  const stack = [root];
  while (stack.length) {
    if (scan.scannedDirectories >= limits.maxDirectories) { scan.truncated = true; return; }
    const directory = stack.pop();
    scan.scannedDirectories++;
    const handle = fs.opendirSync(directory, { bufferSize: 32 });
    try {
      let entry;
      while ((entry = handle.readSync()) !== null) {
        if (scan.scannedEntries >= limits.maxEntries) { scan.truncated = true; return; }
        scan.scannedEntries++;
        if (entry.isSymbolicLink()) { scan.skippedLinks++; continue; }
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          if (IGNORED.has(entry.name)) continue;
          if (scan.scannedDirectories + stack.length >= limits.maxDirectories) {
            scan.truncated = true; return;
          }
          stack.push(file);
          continue;
        }
        if (!entry.isFile()) continue;
        if (scan.scannedFiles >= limits.maxFiles) { scan.truncated = true; return; }
        scan.scannedFiles++;
        yield file;
      }
    } finally { handle.closeSync(); }
  }
}

function sampleNodeTypes(file, nodeTypes) {
  const handle = fs.openSync(file, 'r');
  try {
    const buffer = Buffer.alloc(65536);
    const read = fs.readSync(handle, buffer, 0, buffer.length, 0);
    const partial = fs.fstatSync(handle).size > read;
    const sample = buffer.subarray(0, read).toString('utf8');
    for (const match of sample.matchAll(/^\[node[^\r\n]*\btype="([A-Za-z0-9_]+)"/gm)) nodeTypes.add(match[1]);
    return partial;
  } finally { fs.closeSync(handle); }
}

function scanProjectFiles(root, limits) {
  const counts = Object.fromEntries(EXTENSIONS.map(ext => [ext, 0]));
  const nodeTypes = new Set();
  const scan = { scannedFiles: 0, scannedDirectories: 0, scannedEntries: 0,
    limit: limits.maxFiles, maxDirectories: limits.maxDirectories, maxEntries: limits.maxEntries,
    truncated: false, skippedLinks: 0, partialSceneSamples: 0, ignoredDirectories: [...IGNORED] };
  for (const file of projectFiles(root, limits, scan)) {
    const extension = path.extname(file).toLowerCase();
    if (extension in counts) counts[extension]++;
    if (extension === '.tscn' && sampleNodeTypes(file, nodeTypes)) scan.partialSceneSamples++;
  }
  return { counts, nodeTypes, scan };
}

function validateLimits(limits) {
  for (const [name, value] of Object.entries(limits)) {
    if (!Number.isInteger(value) || value < 1) throw new Error(name + ' must be a positive integer');
  }
}

function readProject(root) {
  const projectFile = path.join(root, 'project.godot');
  const stat = fs.lstatSync(projectFile);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Select a regular project.godot file');
  if (stat.size > 1024 * 1024) throw new Error('project.godot exceeds the inspection size limit');
  const bytes = fs.readFileSync(projectFile);
  return { projectFile, bytes, settings: settingsFromText(bytes.toString('utf8')) };
}

function inspectProject(projectDirectory, { maxFiles = 10000, maxDirectories = 1000, maxEntries = 20000 } = {}) {
  const limits = { maxFiles, maxDirectories, maxEntries };
  validateLimits(limits);
  const root = path.resolve(projectDirectory);
  const { projectFile, bytes, settings } = readProject(root);
  const { counts, nodeTypes, scan } = scanProjectFiles(root, limits);
  const scalar = key => quotedStrings(settings[key] || '')[0] ?? null;
  const parsedFeatures = stringArray(settings['application/config/features'] || '');
  const features = parsedFeatures || [];
  const languages = [];
  if (counts['.gd']) languages.push('GDScript');
  if (counts['.cs'] || counts['.csproj']) languages.push('C#');
  const dimensions = [];
  if ([...nodeTypes].some(type => type.endsWith('2D'))) dimensions.push('2D');
  if ([...nodeTypes].some(type => type.endsWith('3D'))) dimensions.push('3D');
  return {
    projectRoot: root, projectFile,
    projectSha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    declaredName: scalar('application/config/name'),
    declaredFeatures: features,
    declaredEngineHint: features.find(value => /^\d+\.\d+(?:\.\d+)?$/.test(value)) || null,
    declaredMainScene: scalar('application/run/main_scene'),
    declaredRenderer: scalar('rendering/renderer/rendering_method'),
    languageHints: languages, dimensionHints: dimensions,
    enabledEditorPluginPaths: stringArray(settings['editor_plugins/enabled'] || '') || [],
    autoloadNames: Object.keys(settings).filter(key => key.startsWith('autoload/')).map(key => key.slice(9)),
    extensionCounts: counts, sampledNodeTypes: [...nodeTypes].sort(),
    scan,
    settingsOverridePresent: fs.existsSync(path.join(root, 'override.cfg')),
    inspectionWarnings: settings['application/config/features'] && !parsedFeatures
      ? ['Unsupported or malformed feature list; inspect the selected setting manually.'] : [],
    limits: ['Text inspection only; no engine, scripts, plugins or exports executed.',
      'Feature tags and file/type hints do not establish binary version, effective settings or full 2D/3D coverage.',
      'Export presets, credentials, player saves and binary asset contents are not read.']
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 1 || args[0].startsWith('--')) {
    console.error('Usage: node inspect-project.js <project-directory>');
    process.exitCode = 2;
  } else {
    try { console.log(JSON.stringify(inspectProject(args[0]), null, 2)); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}

module.exports = { inspectProject, settingsFromText };

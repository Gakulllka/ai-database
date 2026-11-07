#!/usr/bin/env node
'use strict';

// This gate checks immutable Git objects. It never runs code from the candidate.
const path = require('path');
const { spawnSync } = require('child_process');

const HARD_LIMITS = Object.freeze({ maxSkillChanges: 3, maxChangedFiles: 12, maxChangedLines: 500 });
const MAX_BLOB_BYTES = 1024 * 1024, MAX_DATA_BYTES = 256 * 1024;
const CREDENTIALS = [
  /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/,
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{25,}\b/,
  /\bAIza[A-Za-z0-9_-]{35}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
];

function redacted(value) {
  return CREDENTIALS.reduce((text, regex) => text.replace(new RegExp(regex.source, 'g'), '[REDACTED]'), value);
}

function git(root, args, { buffer = false, allowed = [0] } = {}) {
  const result = spawnSync('git', ['--no-pager', '--literal-pathspecs', '-C', root, ...args], {
    encoding: buffer ? undefined : 'utf8', timeout: 15000, maxBuffer: 8 * 1024 * 1024,
    windowsHide: true, env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0',
      GIT_NO_REPLACE_OBJECTS: '1' }
  });
  if (result.error || !allowed.includes(result.status)) throw new Error('Git object inspection failed');
  return { output: result.stdout, status: result.status };
}

function validateCommit(root, revision) {
  if (typeof revision !== 'string' || !/^[a-f0-9]{40}$/i.test(revision)) {
    throw new Error('Both revisions must be explicit full 40-character commit SHAs');
  }
  let type;
  try { type = git(root, ['cat-file', '-t', revision]).output.trim(); }
  catch { throw new Error('Requested commit is unavailable'); }
  if (type !== 'commit') throw new Error('Requested object must be a commit');
}

function entryAt(root, revision, file) {
  const output = git(root, ['ls-tree', '-z', '--full-tree', revision, '--', file]).output;
  if (!output) return null;
  const match = output.match(/^(\d{6}) (blob|commit|tree) ([a-f0-9]{40})\t[^\0]+\0$/);
  if (!match) throw new Error('Unexpected Git tree result');
  return { mode: match[1], type: match[2], hash: match[3] };
}

function blobAt(root, entry, limit = MAX_BLOB_BYTES) {
  const size = Number(git(root, ['cat-file', '-s', entry.hash]).output.trim());
  if (!Number.isSafeInteger(size) || size < 0) throw new Error('Invalid Git blob size');
  if (size > limit) return null;
  return git(root, ['cat-file', 'blob', entry.hash], { buffer: true }).output;
}

function limitsAt(root, base) {
  const entry = entryAt(root, base, 'config/database-evolution.json');
  if (!entry) return { ...HARD_LIMITS };
  if (entry.mode !== '100644' || entry.type !== 'blob') throw new Error('Trusted base config must be a regular file');
  const bytes = blobAt(root, entry, 65536);
  let config;
  try { config = JSON.parse(bytes ? bytes.toString('utf8') : ''); }
  catch { throw new Error('Trusted base config is invalid or too large'); }
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Invalid trusted base config');
  if (config.policy === undefined) return { ...HARD_LIMITS };
  if (!config.policy || typeof config.policy !== 'object' || Array.isArray(config.policy)) {
    throw new Error('Invalid trusted base policy');
  }
  return Object.fromEntries(Object.entries(HARD_LIMITS).map(([key, ceiling]) => {
    const value = config.policy[key] === undefined ? ceiling : config.policy[key];
    if (!Number.isInteger(value) || value < 1 || value > ceiling) throw new Error('Invalid trusted base policy limit');
    return [key, value];
  }));
}

function parseChanges(output) {
  if (!output) return [];
  const parts = output.split('\0');
  if (parts.pop() !== '') throw new Error('Incomplete Git change list');
  const changes = [];
  for (let index = 0; index < parts.length;) {
    const status = parts[index++];
    const first = parts[index++];
    if (!first || !/^[ACDMRTUXB][0-9]*$/.test(status)) throw new Error('Invalid Git change list');
    if (/^[RC]/.test(status)) {
      const second = parts[index++];
      if (!second) throw new Error('Incomplete Git rename');
      changes.push({ path: second, oldPath: first, status });
    } else changes.push({ path: first, status });
  }
  return changes;
}

function parseStats(output) {
  const stats = new Map();
  let changedLines = 0;
  for (const part of output.split('\0').filter(Boolean)) {
    const match = part.match(/^(\d+|-)\t(\d+|-)\t([\s\S]+)$/);
    if (!match) throw new Error('Invalid Git line statistics');
    const binary = match[1] === '-' || match[2] === '-';
    const added = binary ? 0 : Number(match[1]);
    const deleted = binary ? 0 : Number(match[2]);
    changedLines += added + deleted;
    if (!Number.isSafeInteger(changedLines)) throw new Error('Git change size exceeds supported bounds');
    stats.set(match[3], { added, deleted, binary });
  }
  return { stats, changedLines };
}

function classify(file) {
  const match = file.match(/^(skills|\.agents\/skills)\/([a-z0-9][a-z0-9-]{0,63})\/(SKILL\.md|agents\/openai\.yaml|references\/(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+\.md)$/);
  if (match && !file.split('/').includes('..')) {
    return { kind: 'skill', skill: match[2], canonical: 'skills/' + match[2] + '/' + match[3],
      native: '.agents/skills/' + match[2] + '/' + match[3] };
  }
  if (file === 'docs/evolution/github-observations.json' ||
      /^docs\/evolution\/decisions\/[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}\.json$/.test(file)) {
    return { kind: 'data' };
  }
  return { kind: 'protected' };
}

function objectWithKeys(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}

function utcTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) ||
      !Number.isFinite(Date.parse(value))) return false;
  const normalized = new Date(value).toISOString();
  return value === normalized || value === normalized.replace('.000Z', 'Z');
}

function shortText(value, max) {
  if (typeof value !== 'string' || !value.length || value.length > max) return false;
  return [...value].every(character => character.charCodeAt(0) >= 32 || '\t\r\n'.includes(character));
}

function repoName(value) {
  return shortText(value, 140) && /^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_.-]{1,100}$/.test(value) &&
    value.split('/').every(part => part !== '.' && part !== '..');
}

function canonicalPath(value) {
  return shortText(value, 300) && /^(?:skills|rules|agents|docs|\.ecc\/memory\/team)\/[A-Za-z0-9_./-]+$/.test(value) &&
    value.split('/').every(part => part && part !== '.' && part !== '..');
}

function validObservation(item) {
  return objectWithKeys(item, ['repoId', 'fullName', 'stars', 'observedAt']) &&
    Number.isSafeInteger(item.repoId) && item.repoId > 0 && repoName(item.fullName) &&
    Number.isSafeInteger(item.stars) && item.stars >= 0 && item.stars <= 1000000000 && utcTimestamp(item.observedAt);
}

// Exact keys; retain at most 500 historical observations and 256 KiB per file.
function validSnapshot(value) {
  if (!objectWithKeys(value, ['schemaVersion', 'complete', 'generatedAt', 'untrusted', 'candidates']) ||
      value.schemaVersion !== 'database.evolution.radar.snapshot.v1' || value.complete !== true ||
      value.untrusted !== true || !utcTimestamp(value.generatedAt) ||
      !Array.isArray(value.candidates) || value.candidates.length > 500) return false;
  const ids = new Set();
  return value.candidates.every(item => {
    if (!validObservation(item) || ids.has(item.repoId)) return false;
    ids.add(item.repoId);
    return true;
  });
}

function validSource(value) {
  return objectWithKeys(value, ['repoId', 'fullName', 'commit']) &&
    Number.isSafeInteger(value.repoId) && value.repoId > 0 && repoName(value.fullName) &&
    typeof value.commit === 'string' && /^[a-f0-9]{40}$/i.test(value.commit);
}

function boundedList(value, max, predicate) {
  return Array.isArray(value) && value.length <= max && value.every(predicate);
}

// Exact source/schema/enums; evidence contains text references, never commands.
function validDecision(value) {
  const keys = ['schemaVersion', 'source', 'capability', 'decision', 'status', 'existingPaths',
    'evidence', 'reason', 'observedAt'];
  const pairs = { covered: ['skip'], extend: ['applied', 'proposed', 'defer'],
    new: ['applied', 'proposed'], defer: ['defer'], reject: ['rejected'] };
  return objectWithKeys(value, keys) && value.schemaVersion === 'database.evolution.decision.v1' &&
    validSource(value.source) && shortText(value.capability, 300) && shortText(value.decision, 16) &&
    Object.hasOwn(pairs, value.decision) && pairs[value.decision].includes(value.status) &&
    shortText(value.reason, 4000) && utcTimestamp(value.observedAt) &&
    boundedList(value.existingPaths, 30, canonicalPath) && boundedList(value.evidence, 12, item => shortText(item, 2000)) &&
    (value.status !== 'applied' || value.evidence.length > 0);
}

function validStructured(file, value) {
  return file === 'docs/evolution/github-observations.json' ? validSnapshot(value) : validDecision(value);
}

function frontmatter(text) {
  const opening = text.match(/^[\s\uFEFF]*---[ \t]*\r?\n/);
  if (!opening) return null;
  const closing = text.slice(opening[0].length).match(/^[ \t]*---[ \t]*(?:\r?\n|$)/m);
  return closing ? text.slice(0, opening[0].length + closing.index + closing[0].length) : false;
}

function simpleUiYaml(text, skill) {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.shift() !== 'interface:' || lines.length !== 3) return false;
  const values = {};
  for (const line of lines) {
    const match = line.match(/^ {2}(display_name|short_description|default_prompt): ("(?:[^"\\]|\\.)*")$/);
    if (!match || Object.hasOwn(values, match[1])) return false;
    try { values[match[1]] = JSON.parse(match[2]); } catch { return false; }
  }
  return shortText(values.display_name, 100) && shortText(values.short_description, 64) &&
    values.short_description.length >= 25 && shortText(values.default_prompt, 2000) &&
    values.default_prompt.includes('$' + skill) && Object.values(values).every(value => !/[\r\n]/.test(value));
}

function inspectSkillInterface(root, change, classification, before, text, addReason) {
  if (classification.kind !== 'skill') return;
  if (classification.canonical.endsWith('/agents/openai.yaml')) {
    const previous = before?.mode === '100644' ? blobAt(root, before) : null;
    if (!simpleUiYaml(text, classification.skill) ||
        (before && (!previous || !simpleUiYaml(previous.toString('utf8'), classification.skill)))) {
      addReason('ui_metadata_requires_review', change.path);
    }
  }
  if (classification.canonical === 'skills/' + classification.skill + '/SKILL.md') {
    const previous = before?.mode === '100644' ? blobAt(root, before) : null;
    if (before?.mode === '100644' && !previous) { addReason('base_blob_size_limit', change.path); return; }
    const oldHeader = previous ? frontmatter(previous.toString('utf8')) : null;
    const newHeader = frontmatter(text);
    if (oldHeader === false || newHeader === false || oldHeader !== newHeader) {
      addReason('frontmatter_change_requires_review', change.path);
    }
  }
}

function inspectContents(root, head, change, classification, addReason, before) {
  const entry = entryAt(root, head, change.path);
  if (!entry) { addReason('missing_candidate_path', change.path); return; }
  if (entry.mode !== '100644' || entry.type !== 'blob') {
    addReason('unsafe_file_mode', change.path); return;
  }
  const bytes = blobAt(root, entry, classification.kind === 'data' ? MAX_DATA_BYTES : MAX_BLOB_BYTES);
  if (!bytes) { addReason('blob_size_limit', change.path); return; }
  const text = bytes.toString('utf8');
  if (bytes.includes(0) || !Buffer.from(text, 'utf8').equals(bytes)) {
    addReason('binary_content', change.path); return;
  }
  if (CREDENTIALS.some(regex => regex.test(text))) addReason('credential_like_content', change.path);
  inspectSkillInterface(root, change, classification, before, text, addReason);
  if (classification.kind === 'data') {
    try {
      const value = JSON.parse(text);
      if (!validStructured(change.path, value)) addReason('invalid_structured_data', change.path);
    } catch { addReason('invalid_structured_data', change.path); }
  }
}

function inspectChange(root, base, head, change, context) {
  const { changedPaths, skills, addReason } = context;
  const classification = classify(change.path);
  if (classification.kind === 'protected') addReason('protected_path', change.path);
  if (/^[RC]/.test(change.status)) addReason('rename_requires_review', change.path);
  else if (change.status === 'D') addReason('deletion_requires_review', change.path);
  else if (!['A', 'M'].includes(change.status)) addReason('unsupported_change_type', change.path);
  const before = entryAt(root, base, change.path);
  if (before && (before.mode !== '100644' || before.type !== 'blob')) addReason('unsafe_file_mode', change.path);
  if (classification.kind === 'skill') {
    skills.add(classification.skill);
    const manifest = entryAt(root, base, 'skills/' + classification.skill + '/SKILL.md');
    if (!manifest || manifest.mode !== '100644' || manifest.type !== 'blob') {
      addReason('requires_registration_review', change.path);
    }
    if (!changedPaths.has(classification.canonical) || !changedPaths.has(classification.native)) {
      addReason('projection_pair_missing', change.path);
    }
  }
  if (change.status !== 'D') inspectContents(root, head, change, classification, addReason, before);
}

function checkChange({ root, base, head } = {}) {
  if (typeof root !== 'string' || !root.trim()) throw new Error('An explicit repository root is required');
  root = path.resolve(root);
  validateCommit(root, base);
  validateCommit(root, head);
  if (git(root, ['merge-base', '--is-ancestor', base, head], { allowed: [0, 1] }).status !== 0) {
    throw new Error('Base commit must be an ancestor of candidate head');
  }
  const limits = limitsAt(root, base);
  const flags = ['--no-ext-diff', '--no-textconv'];
  const changes = parseChanges(git(root, ['diff', ...flags, '--name-status', '-z', '--find-renames', base, head, '--']).output);
  const { stats, changedLines } = parseStats(git(root,
    ['diff', ...flags, '--numstat', '-z', '--no-renames', base, head, '--']).output);
  const reasons = [];
  const reasonKeys = new Set();
  const addReason = (code, file) => {
    const safePath = file === undefined ? undefined : redacted(file);
    const key = code + ':' + (safePath || '');
    if (!reasonKeys.has(key)) { reasonKeys.add(key); reasons.push({ code, ...(safePath ? { path: safePath } : {}) }); }
  };
  if (changes.length > limits.maxChangedFiles) addReason('changed_file_limit');
  if (changedLines > limits.maxChangedLines) addReason('changed_line_limit');
  const skills = new Set();
  const context = { skills, addReason, changedPaths: new Set(changes.map(change => change.path)) };
  // A failed scope budget is already PR-only. Bound further blob inspection.
  const inspected = changes.slice(0, limits.maxChangedFiles);
  for (const change of inspected) {
    if (CREDENTIALS.some(regex => regex.test(change.path))) addReason('credential_like_path', change.path);
    if (stats.get(change.path)?.binary) addReason('binary_content', change.path);
    inspectChange(root, base, head, change, context);
  }
  if (skills.size > limits.maxSkillChanges) addReason('skill_change_limit');
  return { autoEligible: reasons.length === 0, reasons,
    files: inspected.map(change => ({ path: redacted(change.path), status: change.status,
      ...(change.oldPath ? { oldPath: redacted(change.oldPath) } : {}),
      ...(stats.get(change.path) || {}) })), changedLines, limits,
    totalChangedFiles: changes.length, inspectionTruncated: inspected.length !== changes.length,
    semanticReviewRequired: true };
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!['--root', '--base', '--head'].includes(key) || !args[i + 1] || options[key.slice(2)]) {
      throw new Error('Usage: check-change.js --root REPO --base FULL_SHA --head FULL_SHA');
    }
    options[key.slice(2)] = args[i + 1];
  }
  return options;
}

if (require.main === module) {
  try {
    const result = checkChange(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.autoEligible ? 0 : 2;
  } catch (error) {
    console.log(JSON.stringify({ autoEligible: false, error: redacted(error.message) }));
    process.exitCode = 1;
  }
}

module.exports = { checkChange, validStructured };

#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DAY_MS = 86400000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_SNAPSHOT_REPOSITORIES = 500;
const DEFAULT_ROOT = path.resolve(__dirname, '../..');
const STOP_WORDS = new Set((
  'and the for with this that from into your you are was were has have had its our '
  + 'will can use using when which than then them they these those not all any '
  + 'для или это как при что его она они так все всё без над под ещё уже если чтобы '
  + 'когда также между через который которая которые этот эта эти того этого быть может нужно свой'
).split(' '));
const DEFAULT_QUERIES = [
  'topic:ai-agents stars:>=20',
  'topic:llm created:>={{since}} stars:>=20',
  'topic:mcp-server created:>={{since}} stars:>=10',
  '"agent harness" in:name,description created:>={{since}}',
];

class RadarError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

function integer(value, fallback, min, max, name) {
  const result = value === undefined ? fallback : value;
  if (!Number.isInteger(result) || result < min || result > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return result;
}

function timestamp(value, label) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${label} must be a valid timestamp`);
  }
  return new Date(value).toISOString();
}

function resolveRadarConfig(input = {}, now = new Date().toISOString()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)
      || (input.radar !== undefined && (!input.radar || typeof input.radar !== 'object' || Array.isArray(input.radar)))) {
    throw new Error('radar configuration must be an object');
  }
  const settings = input.radar || {};
  const windowDays = integer(settings.windowDays, 90, 1, 3650, 'windowDays');
  const since = new Date(Date.parse(timestamp(now, 'now')) - windowDays * DAY_MS).toISOString().slice(0, 10);
  const rawQueries = settings.queries === undefined ? DEFAULT_QUERIES : settings.queries;
  if (!Array.isArray(rawQueries) || rawQueries.length < 3 || rawQueries.length > 5
      || rawQueries.some(q => typeof q !== 'string' || !q.trim() || q.length > 400)) {
    throw new Error('queries must contain between 3 and 5 bounded strings');
  }
  const queries = rawQueries.map(q => {
    const expanded = q.replaceAll('{{since}}', since);
    if (/\{\{|\}\}/.test(expanded)) throw new Error('queries contain an unsupported template');
    return `${expanded} is:public archived:false fork:false`;
  });
  return {
    queries, windowDays,
    maxCandidates: integer(settings.maxCandidates, 20, 1, 20, 'maxCandidates'),
    perQuery: integer(settings.perQuery, 10, 1, 20, 'perQuery'),
    minTrendHours: integer(settings.minTrendHours, 6, 1, 168, 'minTrendHours'),
    timeoutMs: integer(settings.timeoutMs, 15000, 10, 30000, 'timeoutMs'),
    maxInventoryFiles: integer(settings.maxInventoryFiles, 2500, 1, 5000, 'maxInventoryFiles'),
  };
}

function noLinkedAncestors(candidate) {
  const resolved = path.resolve(candidate);
  const parsed = path.parse(resolved);
  let current = parsed.root;
  for (const segment of resolved.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    let stat;
    try { stat = fs.lstatSync(current); } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    if (stat.isSymbolicLink()) throw new RadarError('SYMLINK_SKIPPED', 'Linked paths are not inspected');
  }
}

function readHead(file, maxBytes = 65536) {
  noLinkedAncestors(file);
  const stat = fs.lstatSync(file);
  if (!stat.isFile()) throw new RadarError('INVALID_FILE', 'Expected a regular file');
  const handle = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
  try {
    if (!fs.fstatSync(handle).isFile()) throw new RadarError('INVALID_FILE', 'Expected a regular file');
    const buffer = Buffer.alloc(Math.min(stat.size, maxBytes));
    const count = fs.readSync(handle, buffer, 0, buffer.length, 0);
    return { text: buffer.subarray(0, count).toString('utf8'), truncated: stat.size > count };
  } finally { fs.closeSync(handle); }
}

function yamlScalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"')) return JSON.parse(trimmed);
  if (trimmed.startsWith("'")) {
    if (!trimmed.endsWith("'")) throw new Error('Unterminated YAML scalar');
    return trimmed.slice(1, -1).replaceAll("''", "'");
  }
  return trimmed.replace(/\s+#.*$/, '').trim();
}

function metadataFromText(text, requireHeader = false) {
  const normalized = text.replace(/^\uFEFF/, '');
  const header = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!header && requireHeader) throw new Error('Missing or oversized skill frontmatter');
  const result = {};
  const lines = (header?.[1] || '').split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const pair = lines[index].match(/^(name|description):\s*(.*)$/);
    if (!pair) continue;
    let value = pair[2];
    if (/^[>|][-+]?\s*$/.test(value)) {
      const pieces = [];
      while (index + 1 < lines.length && /^(?:\s+|$)/.test(lines[index + 1])) pieces.push(lines[++index].trim());
      value = pieces.join(' ');
    } else { value = yamlScalar(value); }
    if (typeof value !== 'string') throw new Error('Unsupported metadata scalar');
    result[pair[1]] = value.slice(0, 2000);
  }
  const body = header ? normalized.slice(header[0].length) : normalized;
  result.title = body.match(/^#\s+(.+)$/m)?.[1]?.slice(0, 200) || '';
  result.description ||= body.split(/\r?\n/).filter(line => line.trim() && !/^#|^>|^---/.test(line)).slice(0, 3).join(' ').slice(0, 1000);
  if (requireHeader && (!result.name || !result.description)) throw new Error('Skill name and description are required');
  return result;
}

function inventoryError(state, code, file) {
  state.errors.push({ code, path: path.relative(state.root, file).split(path.sep).join('/') });
}

function addInventoryFile(state, kind, file, fallbackName) {
  if (state.scannedFiles >= state.maxFiles) throw new RadarError('INVENTORY_LIMIT', 'Inventory file limit reached');
  state.scannedFiles++;
  try {
    const { text, truncated } = readHead(file);
    const metadata = metadataFromText(text, kind === 'skills');
    state[kind].push({ kind, path: path.relative(state.root, file).split(path.sep).join('/'),
      name: metadata.name || fallbackName, description: metadata.description,
      title: metadata.title, boundedTextSample: truncated });
  } catch (error) { inventoryError(state, error.code || 'INVALID_METADATA', file); }
}

function* directoryEntries(state, directory) {
  noLinkedAncestors(directory);
  if (++state.scannedDirectories > 1000) throw new RadarError('INVENTORY_LIMIT', 'Directory limit reached');
  const handle = fs.opendirSync(directory, { bufferSize: 32 });
  try {
    let entry;
    while ((entry = handle.readSync()) !== null) {
      if (++state.scannedEntries > 20000) throw new RadarError('INVENTORY_LIMIT', 'Entry limit reached');
      const file = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) { inventoryError(state, 'SYMLINK_SKIPPED', file); continue; }
      yield { entry, file };
    }
  } finally { handle.closeSync(); }
}

function collectKind(state, kind) {
  const base = path.join(state.root, kind);
  if (kind === 'skills') {
    for (const { entry, file } of directoryEntries(state, base)) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) addInventoryFile(state, kind, path.join(file, 'SKILL.md'), entry.name);
    }
    return;
  }
  const stack = [{ directory: base, depth: 0 }];
  while (stack.length) {
    const { directory, depth } = stack.pop();
    for (const { entry, file } of directoryEntries(state, directory)) {
      if (entry.isFile() && entry.name.endsWith('.md')) addInventoryFile(state, kind, file, path.basename(file, '.md'));
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        if (depth >= 6 || stack.length >= 1000) throw new RadarError('INVENTORY_LIMIT', 'Directory/depth limit reached');
        stack.push({ directory: file, depth: depth + 1 });
      }
    }
  }
}

function collectInventory(root, config) {
  const state = { root: path.resolve(root), maxFiles: config.maxInventoryFiles,
    scannedFiles: 0, scannedDirectories: 0, scannedEntries: 0, errors: [], skills: [], rules: [], agents: [] };
  for (const kind of ['skills', 'rules', 'agents']) {
    try { collectKind(state, kind); }
    catch (error) { inventoryError(state, error.code || 'INVENTORY_READ_FAILED', path.join(state.root, kind)); }
  }
  return { complete: state.errors.length === 0, canonicalOnly: true, skills: state.skills,
    rules: state.rules, agents: state.agents, scannedFiles: state.scannedFiles,
    scannedEntries: state.scannedEntries, errors: state.errors };
}

function validStars(value) { return Number.isSafeInteger(value) && value >= 0 && value <= 1000000000; }
function validRepoId(value) { return Number.isSafeInteger(value) && value > 0; }
function validFullName(value) { return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_.-]{1,100}$/.test(value); }

function normalizePrevious(previous) {
  if (!previous) return new Map();
  const source = previous.persistedSnapshot || previous;
  if (source.complete !== true) throw new Error('Previous snapshot must be complete');
  const at = timestamp(source.generatedAt, 'Previous generatedAt');
  if (!Array.isArray(source.candidates) || source.candidates.length > MAX_SNAPSHOT_REPOSITORIES) throw new Error('Previous candidates exceed bounds');
  const found = new Map();
  for (const item of source.candidates) {
    if (!validRepoId(item.repoId) || !validFullName(item.fullName) || !validStars(item.stars)) throw new Error('Invalid previous metrics');
    if (found.has(item.repoId)) throw new Error('Previous snapshot has duplicate repository IDs');
    found.set(item.repoId, { repoId: item.repoId, fullName: item.fullName, stars: item.stars,
      observedAt: timestamp(item.observedAt || at, 'Previous observedAt') });
  }
  return found;
}

function computeStarTrend(current, previous, minTrendHours = 6) {
  if (!validStars(current.stars) || !Number.isFinite(Date.parse(current.observedAt))) {
    return { status: 'unavailable', reason: 'invalid-current-observation', starsDelta: null, starsPerDay: null, rankingEligible: false };
  }
  if (!previous) return { status: 'baseline', starsDelta: null, starsPerDay: null, rankingEligible: false };
  const interval = Date.parse(current.observedAt) - Date.parse(previous.observedAt);
  if (!validStars(current.stars) || !validStars(previous.stars) || !Number.isFinite(interval) || interval <= 0) {
    return { status: 'unavailable', reason: 'invalid-or-nonpositive-observation-interval', starsDelta: null, starsPerDay: null, rankingEligible: false };
  }
  const starsDelta = current.stars - previous.stars;
  const longEnough = interval >= minTrendHours * 3600000;
  return { status: longEnough ? 'measured' : 'short-interval', previousStars: previous.stars,
    previousObservedAt: previous.observedAt, elapsedDays: interval / DAY_MS, starsDelta,
    starsPerDay: longEnough ? Number((starsDelta * DAY_MS / interval).toFixed(4)) : null,
    rankingEligible: longEnough && starsDelta > 0 };
}

function terms(text) {
  return new Set((text.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || [])
    .filter(term => !STOP_WORDS.has(term)).slice(0, 500));
}

function shortlistMatches(repo, inventory) {
  const source = [repo.fullName || repo.full_name || '', repo.description || '', ...(repo.topics || [])].join(' ');
  const candidateTerms = terms(source);
  const matches = [...inventory.skills, ...inventory.rules, ...inventory.agents].flatMap(item => {
    const common = [...terms([item.name, item.description, item.title].join(' '))].filter(t => candidateTerms.has(t));
    return common.length ? [{ path: item.path, kind: item.kind, name: item.name,
      matchedTerms: common.slice(0, 12), score: common.length / Math.max(candidateTerms.size, 1) }] : [];
  }).sort((a, b) => b.score - a.score || a.path.localeCompare(b.path)).slice(0, 5);
  return { shortlistOnly: true, semanticDeduplicationPerformed: false, matches };
}

function validTopics(value) {
  return value === undefined || (Array.isArray(value) && value.length <= 50
    && value.every(topic => typeof topic === 'string' && topic.length <= 100));
}

function checkRepository(item) {
  if (!item || !validRepoId(item.id) || !validFullName(item.full_name) || !validStars(item.stargazers_count)
      || item.archived !== false || item.fork !== false || item.private !== false
      || (item.description !== null && typeof item.description !== 'string')
      || !validTopics(item.topics)) {
    throw new RadarError('INVALID_REPOSITORY', 'Invalid repository metadata');
  }
}

function optionalTime(value) {
  if (value === undefined || value === null) return null;
  try { return timestamp(value, 'Repository timestamp'); }
  catch { throw new RadarError('INVALID_REPOSITORY', 'Invalid repository timestamp'); }
}

function normalizeRepository(item, observedAt) {
  if (item?.archived === true || item?.fork === true || item?.private === true) return null;
  checkRepository(item);
  return { repoId: item.id, fullName: item.full_name, url: `https://github.com/${item.full_name}`,
    stars: item.stargazers_count, observedAt, description: (item.description || '').slice(0, 2000),
    topics: (item.topics || []).slice(0, 20), defaultBranch: typeof item.default_branch === 'string' ? item.default_branch.slice(0, 100) : null,
    createdAt: optionalTime(item.created_at), pushedAt: optionalTime(item.pushed_at), untrusted: true };
}

async function readResponseText(response) {
  const advertised = Number(response.headers?.get('content-length'));
  if (advertised > MAX_RESPONSE_BYTES) throw new RadarError('RESPONSE_LIMIT', 'Response exceeds byte limit');
  if (!response.body?.getReader) {
    const text = await response.text();
    if (Buffer.byteLength(text) > MAX_RESPONSE_BYTES) throw new RadarError('RESPONSE_LIMIT', 'Response exceeds byte limit');
    return text;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new RadarError('RESPONSE_LIMIT', 'Response exceeds byte limit');
      }
      chunks.push(Buffer.from(chunk.value));
    }
    return Buffer.concat(chunks, length).toString('utf8');
  } finally { reader.releaseLock(); }
}

async function requestQuery(query, config, fetchImpl, token) {
  const controller = new AbortController();
  let timer;
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'ECC-Database-Radar', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const parameters = new URLSearchParams({ q: query, sort: 'stars', order: 'desc', per_page: String(config.perQuery) });
  const execute = async () => {
    const response = await fetchImpl('https://api.github.com/search/repositories?' + parameters, { headers, signal: controller.signal, redirect: 'error' });
    if (!response.ok) {
      const rateLimited = response.status === 429 || (response.status === 403 && response.headers?.get('x-ratelimit-remaining') === '0');
      throw new RadarError(rateLimited ? 'RATE_LIMIT' : 'HTTP_ERROR', `GitHub HTTP ${response.status}`);
    }
    const text = await readResponseText(response);
    let data;
    try { data = JSON.parse(text); } catch { throw new RadarError('INVALID_JSON', 'GitHub response is not valid JSON'); }
    if (!data || !Array.isArray(data.items) || data.items.length > config.perQuery) throw new RadarError('INVALID_RESPONSE', 'GitHub response has invalid item bounds');
    return data;
  };
  try {
    return await Promise.race([execute(), new Promise((resolve, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new RadarError('TIMEOUT', 'GitHub request timed out')); }, config.timeoutMs);
    })]);
  } finally { clearTimeout(timer); }
}

async function discover(config, fetchImpl, token, now) {
  const results = await Promise.all(config.queries.map(async (query, queryIndex) => {
    try { return { queryIndex, data: await requestQuery(query, config, fetchImpl, token) }; }
    catch (error) { return { queryIndex, error: { queryIndex, code: error instanceof RadarError ? error.code : 'NETWORK_ERROR',
      message: error instanceof RadarError ? error.message : 'GitHub request failed' } }; }
  }));
  const errors = [];
  const repositories = new Map();
  const queries = [];
  for (const result of results) {
    queries.push({ queryIndex: result.queryIndex, query: config.queries[result.queryIndex],
      retrievedCount: result.data?.items.length || 0, complete: !result.error && result.data?.incomplete_results === false });
    if (result.error) { errors.push(result.error); continue; }
    if (result.data.incomplete_results !== false) errors.push({ queryIndex: result.queryIndex, code: 'INCOMPLETE_RESULTS', message: 'GitHub search did not confirm complete results' });
    for (const item of result.data.items) {
      try {
        const repo = normalizeRepository(item, now);
        if (repo) {
          if (!repositories.has(repo.repoId)) repositories.set(repo.repoId, { ...repo, queryIndices: [] });
          const indices = repositories.get(repo.repoId).queryIndices;
          if (!indices.includes(result.queryIndex)) indices.push(result.queryIndex);
        }
      } catch (error) { errors.push({ queryIndex: result.queryIndex, code: error.code, message: error.message }); }
    }
  }
  const candidates = [...repositories.values()];
  return { candidates, errors, queries };
}

function selectCandidates(observations, config) {
  const growing = observations.filter(repo => repo.starTrend.rankingEligible)
    .sort((a, b) => b.starTrend.starsPerDay - a.starTrend.starsPerDay
      || b.starTrend.starsDelta - a.starTrend.starsDelta || b.stars - a.stars || a.repoId - b.repoId);
  const selected = growing.slice(0, config.maxCandidates);
  const selectedIds = new Set(selected.map(repo => repo.repoId));
  const buckets = config.queries.map((query, index) => ({ index, recent: /\bcreated:/.test(query),
    repos: observations.filter(repo => repo.queryIndices.includes(index))
      .sort((a, b) => b.stars - a.stars || a.repoId - b.repoId) }))
    .sort((a, b) => Number(b.recent) - Number(a.recent) || a.index - b.index);
  let advanced = true;
  while (selected.length < config.maxCandidates && advanced) {
    advanced = false;
    for (const bucket of buckets) {
      const next = bucket.repos.find(repo => !selectedIds.has(repo.repoId));
      if (!next) continue;
      selected.push(next); selectedIds.add(next.repoId); advanced = true;
      if (selected.length === config.maxCandidates) break;
    }
  }
  return selected;
}

function buildSnapshot(candidates, previous, now) {
  const records = new Map(previous);
  for (const { repoId, fullName, stars, observedAt } of candidates) records.set(repoId, { repoId, fullName, stars, observedAt });
  return { schemaVersion: 'database.evolution.radar.snapshot.v1', complete: true, generatedAt: now,
    untrusted: true, candidates: [...records.values()].sort((a, b) => b.observedAt.localeCompare(a.observedAt) || a.repoId - b.repoId).slice(0, MAX_SNAPSHOT_REPOSITORIES) };
}

async function createReport({ root = DEFAULT_ROOT, config = resolveRadarConfig(), previous = null,
  refresh = false, now = new Date().toISOString(), fetchImpl = globalThis.fetch, token = '' } = {}) {
  now = timestamp(now, 'now');
  const inventory = collectInventory(root, config);
  const errors = inventory.errors.map(e => ({ ...e, stage: 'inventory' }));
  let prior = new Map();
  try { prior = normalizePrevious(previous); }
  catch { errors.push({ code: 'INVALID_PREVIOUS', stage: 'previous', message: 'Previous snapshot is invalid or incomplete' }); }
  const discovery = refresh ? await discover(config, fetchImpl, token, now) : { candidates: [], errors: [], queries: [] };
  errors.push(...discovery.errors);
  const observations = discovery.candidates.map(repo => ({ ...repo,
    starTrend: computeStarTrend(repo, prior.get(repo.repoId), config.minTrendHours) }));
  const candidates = selectCandidates(observations, config).map(repo => ({ ...repo,
    lexicalMatches: shortlistMatches(repo, inventory) }));
  const complete = errors.length === 0;
  return { schemaVersion: 'database.evolution.radar.v1', generatedAt: now, complete,
    source: { kind: 'github-rest-metadata', untrusted: true, refreshed: refresh, coverage: 'bounded-query-sample' },
    limits: { maxCandidates: config.maxCandidates, perQuery: config.perQuery,
      maxObservedRepositories: config.queries.length * config.perQuery, minTrendHours: config.minTrendHours,
      snapshotRepositoryLimit: MAX_SNAPSHOT_REPOSITORIES },
    selection: { observedRepositories: observations.length,
      eligibleGrowthSignals: observations.filter(repo => repo.starTrend.rankingEligible).length,
      method: 'positive-observed-growth-then-recent-query-round-robin' },
    inventory, queries: discovery.queries, candidates, errors,
    persistedSnapshot: complete && refresh ? buildSnapshot(observations, prior, now) : null };
}

function readJsonFile(file, maxBytes, missingAllowed = false) {
  try {
    const input = readHead(file, maxBytes);
    if (input.truncated) throw new Error('JSON input exceeds byte limit');
    return JSON.parse(input.text.replace(/^\uFEFF/, ''));
  } catch (error) {
    if (missingAllowed && error.code === 'ENOENT') return null;
    throw error;
  }
}

function writeReport(output, report) {
  const destination = path.resolve(output);
  if (path.extname(destination).toLowerCase() !== '.json') throw new Error('Report output must use a .json filename');
  noLinkedAncestors(destination);
  if (fs.existsSync(destination) && !fs.lstatSync(destination).isFile()) throw new Error('Report output must be a regular file');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const flags = fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC | (fs.constants.O_NOFOLLOW || 0);
  const handle = fs.openSync(destination, flags, 0o600);
  try { fs.writeFileSync(handle, JSON.stringify(report, null, 2) + '\n', 'utf8'); }
  finally { fs.closeSync(handle); }
}

function parseArgs(args) {
  const result = { root: DEFAULT_ROOT, refresh: false };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--refresh') { result.refresh = true; continue; }
    if (!['--root', '--output', '--previous'].includes(arg) || !args[index + 1] || args[index + 1].startsWith('--')) throw new Error('Usage: github-radar.js [--root DIR] --output FILE.json [--previous FILE.json] [--refresh]');
    const key = arg.slice(2);
    if (result[key] !== undefined && key !== 'root') throw new Error('Repeated option: ' + arg);
    result[key] = path.resolve(args[++index]);
  }
  if (!result.output) throw new Error('--output is required');
  if (result.output === result.previous) throw new Error('Output must not overwrite the previous metric snapshot');
  return result;
}

async function main(args) {
  const options = parseArgs(args);
  const now = new Date().toISOString();
  const rawConfig = readJsonFile(path.join(options.root, 'config/database-evolution.json'), 65536, true) || {};
  const config = resolveRadarConfig(rawConfig, now);
  const previous = options.previous ? readJsonFile(options.previous, MAX_RESPONSE_BYTES, true) : null;
  const report = await createReport({ ...options, config, previous, now, token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '' });
  writeReport(options.output, report);
  process.stdout.write(JSON.stringify({ output: options.output, complete: report.complete,
    candidates: report.candidates.length, errors: report.errors.map(e => e.code) }) + '\n');
  return report.complete ? 0 : 1;
}

if (require.main === module) {
  main(process.argv.slice(2)).then(code => { process.exitCode = code; }).catch(() => {
    console.error('GitHub radar failed: invalid input, inaccessible path, or unsafe output. No credentials are logged.');
    process.exitCode = 1;
  });
}

module.exports = { resolveRadarConfig, collectInventory, metadataFromText, normalizePrevious,
  computeStarTrend, shortlistMatches, normalizeRepository, createReport, writeReport, main };

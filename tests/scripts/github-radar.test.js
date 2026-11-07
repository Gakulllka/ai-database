'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const {
  computeStarTrend, collectInventory, normalizePrevious, shortlistMatches,
  resolveRadarConfig, createReport, writeReport,
} = require('../../scripts/evolution/github-radar');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-radar-test-'));
  for (const folder of ['skills/example', 'rules/common', 'agents', '.agents/skills/projected', 'config']) {
    fs.mkdirSync(path.join(root, folder), { recursive: true });
  }
  fs.writeFileSync(path.join(root, 'skills/example/SKILL.md'),
    '---\nname: example\ndescription: "Agent memory retrieval and durable handoff"\n---\n# Example\n');
  fs.writeFileSync(path.join(root, 'rules/common/testing.md'), '# Testing\nVerify observable results.\n');
  fs.writeFileSync(path.join(root, 'agents/reviewer.md'),
    '---\nname: reviewer\ndescription: Review agent memory changes\n---\n# Reviewer\n');
  fs.writeFileSync(path.join(root, '.agents/skills/projected/SKILL.md'),
    '---\nname: projected\ndescription: A duplicate projection\n---\n');
  return root;
}

function cleanup(root) {
  const resolved = path.resolve(root);
  assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
  assert.match(path.basename(resolved), /^ecc-radar-test-/);
  fs.rmSync(resolved, { recursive: true, force: true });
}

const NOW = '2026-11-07T12:00:00.000Z';
const BEFORE = '2026-11-05T12:00:00.000Z';
const QUERIES = ['topic:artificial-intelligence', 'topic:ai-agents', 'topic:machine-learning'];

function repo(id = 1, changes = {}) {
  return { id, full_name: 'example/agent-memory', stargazers_count: 120,
    private: false, archived: false, fork: false, description: 'Agent memory retrieval',
    topics: ['artificial-intelligence', 'memory'], default_branch: 'main',
    created_at: BEFORE, pushed_at: NOW, ...changes };
}

function response(body, status = 200, headers = {}) {
  return { ok: status >= 200 && status < 300, status,
    headers: { get: name => headers[name.toLowerCase()] || null },
    text: async () => typeof body === 'string' ? body : JSON.stringify(body) };
}

function config(changes = {}) {
  return resolveRadarConfig({ radar: { queries: QUERIES, ...changes } }, NOW);
}

test('first observation is a baseline; decrease and interval remain explicit', () => {
  assert.equal(computeStarTrend({ stars: 100, observedAt: NOW }, null).status, 'baseline');
  assert.equal(computeStarTrend({ stars: 100, observedAt: NOW }, null).starsDelta, null);
  const measured = computeStarTrend({ stars: 90, observedAt: NOW }, { stars: 100, observedAt: BEFORE });
  assert.equal(measured.status, 'measured');
  assert.equal(measured.starsDelta, -10);
  assert.equal(measured.starsPerDay, -5);
  assert.equal(computeStarTrend({ stars: 120, observedAt: BEFORE }, { stars: 100, observedAt: NOW }).status, 'unavailable');
});

test('canonical inventory excludes native projections and bounds traversal', () => {
  const root = fixture();
  try {
    const inventory = collectInventory(root, config());
    assert.equal(inventory.complete, true);
    assert.deepEqual(inventory.skills.map(s => s.name), ['example']);
    assert.equal(inventory.rules.length, 1);
    assert.equal(inventory.agents.length, 1);
    assert.equal(collectInventory(root, config({ maxInventoryFiles: 1 })).complete, false);
  } finally { cleanup(root); }
});

test('linked skill directories are skipped and incomplete scope is disclosed', t => {
  const root = fixture();
  try {
    try { fs.symlinkSync(path.join(root, 'skills/example'), path.join(root, 'skills/linked'), 'junction'); }
    catch (error) { if (['EPERM', 'EACCES'].includes(error.code)) { t.skip('Links unavailable'); return; } throw error; }
    const inventory = collectInventory(root, config());
    assert.equal(inventory.complete, false);
    assert.ok(inventory.errors.some(e => e.code === 'SYMLINK_SKIPPED'));
    assert.equal(inventory.skills.length, 1);
  } finally { cleanup(root); }
});

test('config enforces request/candidate limits and does not accept unbounded queries', () => {
  assert.throws(() => config({ maxCandidates: 21 }), /maxCandidates/);
  assert.throws(() => config({ queries: Array(6).fill('topic:ai') }), /queries/);
  assert.throws(() => config({ perQuery: 1000 }), /perQuery/);
  assert.throws(() => config({ timeoutMs: 0 }), /timeoutMs/);
  assert.throws(() => config({ maxInventoryFiles: 0 }), /maxInventoryFiles/);
});

test('query windows expand from the injected date and unsupported templates fail', () => {
  const settings = resolveRadarConfig({ radar: { windowDays: 7, queries: [
    'topic:llm created:>={{since}}', 'topic:ai-agents', 'topic:mcp-server',
  ] } }, NOW);
  assert.ok(settings.queries[0].includes('created:>=2026-10-31'));
  assert.ok(settings.queries.every(q => q.includes('is:public archived:false fork:false')));
  assert.throws(() => resolveRadarConfig({ radar: [] }, NOW), /configuration/);
  assert.throws(() => config({ queries: ['{{unknown}}', 'topic:ai', 'topic:llm'] }), /template/);
});

test('lexical matches nominate existing capabilities without a semantic verdict', () => {
  const root = fixture();
  try {
    const shortlist = shortlistMatches(repo(), collectInventory(root, config()));
    assert.ok(shortlist.matches.some(m => m.path === 'skills/example/SKILL.md'));
    assert.equal(shortlist.shortlistOnly, true);
    assert.equal(shortlist.semanticDeduplicationPerformed, false);
    assert.equal(Object.hasOwn(shortlist, 'duplicate'), false);
  } finally { cleanup(root); }
});

test('common English and Russian words alone cannot nominate a capability', () => {
  const inventory = { skills: [{ name: 'common', path: 'skills/common/SKILL.md', kind: 'skills',
    description: 'The and for with this that from using для или это как при чтобы когда' }], rules: [], agents: [] };
  const commonOnly = { description: 'THE and for with this that from using ДЛЯ или это как при чтобы когда', topics: [] };
  assert.deepEqual(shortlistMatches(commonOnly, inventory).matches, []);
  inventory.skills[0].description += ' durable memory';
  const meaningful = shortlistMatches({ description: 'The durable memory for agents' }, inventory);
  assert.deepEqual(meaningful.matches[0].matchedTerms, ['durable', 'memory']);
  assert.equal(meaningful.semanticDeduplicationPerformed, false);
});

test('repository identity survives rename and old unseen observations are retained', async () => {
  const root = fixture();
  try {
    const previous = { complete: true, generatedAt: BEFORE,
      candidates: [{ repoId: 1, fullName: 'old/old-name', stars: 100 },
        { repoId: 2, fullName: 'old/unseen', stars: 12 }] };
    const report = await createReport({ root, config: config(), previous, refresh: true, now: NOW,
      fetchImpl: async () => response({ incomplete_results: false, items: [repo(1, { full_name: 'new/renamed' })] }) });
    assert.equal(report.complete, true);
    assert.equal(report.candidates.length, 1);
    assert.equal(report.candidates[0].fullName, 'new/renamed');
    assert.equal(report.candidates[0].starTrend.starsDelta, 20);
    const carried = report.persistedSnapshot.candidates.find(c => c.repoId === 2);
    assert.equal(carried.stars, 12);
    assert.equal(carried.observedAt, BEFORE);
    assert.equal(report.persistedSnapshot.complete, true);
    assert.equal(Object.hasOwn(report.persistedSnapshot, 'inventory'), false);
  } finally { cleanup(root); }
});

test('confirmed growth influences selection before the cap and the full pool warms metrics', async () => {
  const root = fixture();
  try {
    const previous = { complete: true, generatedAt: BEFORE, candidates: [
      { repoId: 1, fullName: 'example/popular-stable', stars: 10000 },
      { repoId: 2, fullName: 'example/small-growing', stars: 30 },
    ] };
    const items = [repo(1, { full_name: 'example/popular-stable', stargazers_count: 10000 }),
      repo(2, { full_name: 'example/small-growing', stargazers_count: 50 }),
      repo(3, { full_name: 'example/new-baseline', stargazers_count: 50000 })];
    const report = await createReport({ root, config: config({ maxCandidates: 1 }), previous,
      refresh: true, now: NOW, fetchImpl: async () => response({ incomplete_results: false, items }) });
    assert.equal(report.candidates[0].repoId, 2);
    assert.equal(report.candidates[0].starTrend.starsDelta, 20);
    assert.equal(report.candidates[0].starTrend.rankingEligible, true);
    assert.equal(report.persistedSnapshot.candidates.length, 3);
    assert.ok(report.persistedSnapshot.candidates.some(candidate => candidate.repoId === 3 && candidate.stars === 50000));
  } finally { cleanup(root); }
});

test('short intervals do not become growth signals and recent query buckets receive fallback places', async () => {
  const root = fixture();
  try {
    const recent = config({ maxCandidates: 2, queries: [
      'topic:ai-agents', 'topic:llm created:>={{since}}', 'topic:mcp-server created:>={{since}}',
    ] });
    const previous = { complete: true, generatedAt: '2026-11-07T11:00:00.000Z', candidates: [
      { repoId: 1, fullName: 'example/mature', stars: 10000 },
      { repoId: 2, fullName: 'example/one-hour-spike', stars: 10 },
    ] };
    const report = await createReport({ root, config: recent, previous, refresh: true, now: NOW,
      fetchImpl: async url => {
        const query = new URL(url).searchParams.get('q');
        const items = query.startsWith('topic:ai-agents')
          ? [repo(1, { full_name: 'example/mature', stargazers_count: 10000 })]
          : query.startsWith('topic:llm')
            ? [repo(2, { full_name: 'example/one-hour-spike', stargazers_count: 60 })]
            : [repo(3, { full_name: 'example/another-new-project', stargazers_count: 20 })];
        return response({ incomplete_results: false, items });
      } });
    assert.deepEqual(report.candidates.map(candidate => candidate.repoId), [2, 3]);
    const short = report.candidates.find(candidate => candidate.repoId === 2).starTrend;
    assert.equal(short.status, 'short-interval');
    assert.equal(short.starsDelta, 50);
    assert.equal(short.starsPerDay, null);
    assert.equal(short.rankingEligible, false);
    assert.equal(report.candidates.find(candidate => candidate.repoId === 3).starTrend.status, 'baseline');
  } finally { cleanup(root); }
});

test('local-only mode performs no fetch and produces no new metric snapshot', async () => {
  const root = fixture();
  try {
    const report = await createReport({ root, config: config(), refresh: false, now: NOW,
      fetchImpl: () => { throw new Error('Network forbidden'); } });
    assert.equal(report.complete, true);
    assert.equal(report.source.refreshed, false);
    assert.equal(report.persistedSnapshot, null);
    assert.deepEqual(report.candidates, []);
  } finally { cleanup(root); }
});

test('incomplete results, malformed JSON and rate limits cannot publish snapshots', async () => {
  const root = fixture();
  try {
    for (const [fake, expected] of [
      [() => response({ incomplete_results: true, items: [repo()] }), 'INCOMPLETE_RESULTS'],
      [() => response('{malformed'), 'INVALID_JSON'],
      [() => response({}, 403, { 'x-ratelimit-remaining': '0' }), 'RATE_LIMIT'],
    ]) {
      const report = await createReport({ root, config: config(), refresh: true, now: NOW, fetchImpl: fake });
      assert.equal(report.complete, false);
      assert.equal(report.persistedSnapshot, null);
      assert.ok(report.errors.some(e => e.code === expected));
    }
  } finally { cleanup(root); }
});

test('invalid metadata is reported; archives, forks and private repos are excluded', async () => {
  const root = fixture();
  try {
    const items = [repo(), repo(2, { archived: true }), repo(3, { fork: true }),
      repo(4, { private: true }), repo(5, { stargazers_count: -1 })];
    const report = await createReport({ root, config: config(), refresh: true, now: NOW,
      fetchImpl: async () => response({ incomplete_results: false, items }) });
    assert.deepEqual(report.candidates.map(c => c.repoId), [1]);
    assert.equal(report.complete, false);
    assert.ok(report.errors.some(e => e.code === 'INVALID_REPOSITORY'));
  } finally { cleanup(root); }
});

test('timeout and candidate caps are enforced; auth never appears in the report', async () => {
  const root = fixture();
  try {
    const timedOut = await createReport({ root, config: config({ timeoutMs: 20 }), refresh: true, now: NOW,
      fetchImpl: async () => new Promise(() => {}) });
    assert.equal(timedOut.complete, false);
    assert.ok(timedOut.errors.some(e => e.code === 'TIMEOUT'));
    const token = 'fixture-credential-that-must-not-appear';
    const urls = [];
    const report = await createReport({ root, config: config({ maxCandidates: 2 }), refresh: true, now: NOW, token,
      fetchImpl: async (url, options) => {
        urls.push(url);
        assert.equal(options.headers.Authorization, 'Bearer ' + token);
        return response({ incomplete_results: false, items: [repo(1), repo(2), repo(3)] });
      } });
    assert.equal(report.candidates.length, 2);
    assert.equal(urls.length, 3);
    assert.ok(urls.every(url => new URL(url).hostname === 'api.github.com'));
    assert.equal(JSON.stringify(report).includes(token), false);
    assert.equal(report.source.untrusted, true);
  } finally { cleanup(root); }
});

test('previous snapshots must be successful and unique by repository ID', () => {
  assert.throws(() => normalizePrevious({ complete: false, generatedAt: BEFORE, candidates: [] }), /complete/);
  assert.throws(() => normalizePrevious({ complete: true, generatedAt: BEFORE,
    candidates: [{ repoId: 1, stars: 10, fullName: 'a/b' }, { repoId: 1, stars: 20, fullName: 'a/b' }] }), /duplicate/);
});

test('oversized API responses and arbitrary transport errors disclose no payload', async () => {
  const root = fixture();
  try {
    const oversized = await createReport({ root, config: config(), refresh: true, now: NOW,
      fetchImpl: async () => response('x'.repeat(2 * 1024 * 1024 + 1)) });
    assert.equal(oversized.complete, false);
    assert.ok(oversized.errors.some(e => e.code === 'RESPONSE_LIMIT'));
    const report = await createReport({ root, config: config(), refresh: true, now: NOW,
      fetchImpl: async () => { const error = new Error('fixture-private-credential'); error.code = 'UNEXPECTED'; throw error; } });
    assert.equal(report.complete, false);
    assert.equal(JSON.stringify(report).includes('fixture-private-credential'), false);
  } finally { cleanup(root); }
});

test('native streamed UTF-8 responses are parsed and byte-limited before publication', async () => {
  const root = fixture();
  try {
    const makeStream = bytes => new ReadableStream({ start(controller) {
      controller.enqueue(bytes.subarray(0, 77));
      controller.enqueue(bytes.subarray(77));
      controller.close();
    } });
    const data = Buffer.from(JSON.stringify({ incomplete_results: false, items: [repo(1, { description: 'Память агента' })] }));
    const valid = await createReport({ root, config: config(), refresh: true, now: NOW,
      fetchImpl: async () => new Response(makeStream(data)) });
    assert.equal(valid.complete, true);
    assert.equal(valid.candidates[0].description, 'Память агента');
    const invalid = await createReport({ root, config: config(), refresh: true, now: NOW,
      fetchImpl: async () => new Response(makeStream(Buffer.alloc(2 * 1024 * 1024 + 1, 32))) });
    assert.equal(invalid.complete, false);
    assert.equal(invalid.persistedSnapshot, null);
    assert.ok(invalid.errors.some(e => e.code === 'RESPONSE_LIMIT'));
  } finally { cleanup(root); }
});

test('report output refuses a linked ancestor and CLI rejects malformed previous JSON', t => {
  const root = fixture();
  try {
    const previous = path.join(root, 'previous.json');
    fs.writeFileSync(previous, '{malformed');
    const output = path.join(root, 'reports/not-written.json');
    const cli = path.resolve(__dirname, '../../scripts/evolution/github-radar.js');
    const result = spawnSync(process.execPath, [cli, '--root', root, '--output', output, '--previous', previous], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.equal(fs.existsSync(output), false);
    try { fs.symlinkSync(path.join(root, 'config'), path.join(root, 'linked-output'), 'junction'); }
    catch (error) { if (['EPERM', 'EACCES'].includes(error.code)) { t.skip('Links unavailable'); return; } throw error; }
    assert.throws(() => writeReport(path.join(root, 'linked-output/output.json'), {}), /Linked/);
    assert.equal(fs.existsSync(path.join(root, 'config/output.json')), false);
  } finally { cleanup(root); }
});

test('CLI has no network by default, accepts missing first baseline and writes only its output', () => {
  const root = fixture();
  try {
    const output = path.join(root, 'reports/radar.json');
    const cli = path.resolve(__dirname, '../../scripts/evolution/github-radar.js');
    const result = spawnSync(process.execPath, [cli, '--root', root, '--output', output,
      '--previous', path.join(root, 'not-yet-created.json')], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(fs.readFileSync(output, 'utf8')).source.refreshed, false);
    assert.equal(fs.existsSync(path.join(root, 'config/database-evolution.json')), false);
    assert.throws(() => writeReport(path.join(root, 'skills/example/SKILL.md'), {}), /json/);
  } finally { cleanup(root); }
});

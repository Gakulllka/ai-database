'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { repairInstalledStates } = require('../../scripts/lib/install-lifecycle');
const { readInstallState, writeInstallState } = require('../../scripts/lib/install-state');
const { createInstallPlanFromRequest } = require('../../scripts/lib/install/runtime');
const { createManifestInstallPlan } = require('../../scripts/lib/install/plan');
const { resolveInstallPlan } = require('../../scripts/lib/install-manifests');
const { normalizeInstallRequest } = require('../../scripts/lib/install/request');
const { normalizeGuidedInstallRequest } = require('../../scripts/lib/multi-harness-setup');

const retiredModuleIds = ['hooks-runtime', 'hermes-hooks'];
const fixtureRoot = path.join(os.tmpdir(), 'ecc-codex-only-preview');

test('replayed hook flags and package IDs cannot enable non-Codex hooks', () => {
  for (const target of ['claude', 'claude-project', 'cursor', 'antigravity', 'opencode', 'grok', 'hermes']) {
    const request = normalizeInstallRequest({
      profileId: 'core',
      moduleIds: ['commands-core', ...retiredModuleIds],
      includeComponentIds: ['baseline:hooks'],
      excludeComponentIds: ['baseline:hooks'],
      enableHooks: true,
      target,
    });
    assert.equal(request.hookConsent, 'declined', target);
    assert.deepEqual(request.moduleIds, ['commands-core'], target);
    assert.deepEqual(request.includeComponentIds, [], target);
    assert.deepEqual(request.excludeComponentIds, [], target);
  }
  assert.throws(
    () => normalizeInstallRequest({ moduleIds: ['hooks-runtime'] }),
    /selected hook packages have been retired/
  );
});

test('old manifest requests are filtered without falling back to a broader content profile', () => {
  const options = { homeDir: fixtureRoot, projectRoot: fixtureRoot };
  const old = {
    mode: 'manifest', target: 'antigravity', moduleIds: ['commands-core', 'hooks-runtime'],
    includeComponentIds: ['baseline:hooks'], hookConsent: 'enabled',
  };
  const plan = createInstallPlanFromRequest(old, options);
  assert.equal(plan.hookConsent, 'declined');
  assert.ok(plan.selectedModuleIds.includes('commands-core'));
  assert.ok(!plan.selectedModuleIds.includes('hooks-runtime'));
  assert.throws(
    () => createInstallPlanFromRequest({ ...old, moduleIds: ['hooks-runtime'] }, options),
    /only selected retired hooks/,
  );
});

test('recorded repair leaves retired hook bytes and prior ownership alone', () => {
  const tempRoot = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(tempRoot, 'ecc-provider-hook-repair-'));
  try {
    const options = { homeDir: root, projectRoot: root };
    const plan = createManifestInstallPlan({ ...options, target: 'antigravity', moduleIds: ['commands-core'] });
    const destinationPath = path.join(plan.targetRoot, 'hooks.json');
    const registration = {
      kind: 'merge-json', ownership: 'managed', moduleId: 'hooks-runtime',
      strategy: 'merge-json', scaffoldOnly: false, sourceRelativePath: 'hooks/hooks.json',
      destinationPath, mergePayload: { 'ecc-guard': {} }, contentSha256: '0'.repeat(64),
    };
    const content = '{"userEdits":true}\n';
    fs.mkdirSync(plan.targetRoot, { recursive: true });
    fs.writeFileSync(destinationPath, content);
    const prior = plan.statePreview;
    writeInstallState(plan.installStatePath, {
      ...prior,
      request: { ...prior.request, modules: ['commands-core', 'hooks-runtime'], hookConsent: 'enabled' },
      resolution: { ...prior.resolution, selectedModules: ['commands-core', 'hooks-runtime'] },
      operations: [registration],
    });

    const result = repairInstalledStates({ ...options, targets: ['antigravity'] }).results[0];
    assert.equal(result.status, 'ok', result.error);
    assert.ok(result.warnings.some(warning => warning.includes('Repair skipped retired hook registrations')));
    assert.equal(fs.readFileSync(destinationPath, 'utf8'), content);
    assert.deepEqual(readInstallState(plan.installStatePath).operations, [registration]);
  } finally {
    assert.equal(path.dirname(fs.realpathSync(root)), tempRoot);
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('full installs retain content and shared libraries without registering provider hooks', () => {
  for (const target of ['claude', 'claude-project', 'cursor', 'antigravity', 'opencode', 'grok', 'hermes', 'openclaw']) {
    const plan = resolveInstallPlan({
      profileId: 'full', target,
      homeDir: fixtureRoot, projectRoot: fixtureRoot,
      trust: true, consent: { hooks: true },
      exemptValidationCodes: ['opencode-plugin-not-built'],
    });
    assert.ok(plan.operations.some(operation => operation.moduleId === 'commands-core'), target);
    assert.ok(!plan.selectedModuleIds.some(id => retiredModuleIds.includes(id)), target);
    assert.ok(!plan.operations.some(operation =>
      operation.kind === 'update-claude-settings'
      || /^hooks(?:\/|$)/.test(operation.sourceRelativePath)
      || /^\.cursor\/hooks(?:[/.]|$)/.test(operation.sourceRelativePath)
    ), target);
  }
  const claude = resolveInstallPlan({ profileId: 'core', target: 'claude', homeDir: fixtureRoot });
  assert.ok(claude.operations.some(operation =>
    operation.moduleId === 'shared-runtime-libraries' && operation.sourceRelativePath === 'scripts/lib'
  ));
});

test('guided Claude setup no longer requires or enables a legacy hook profile', () => {
  const base = { harnesses: ['claude'], claudeScope: 'project' };
  assert.equal(normalizeGuidedInstallRequest(base).claudeHooks, 'off');
  assert.equal(normalizeGuidedInstallRequest({ ...base, claudeHooks: 'strict' }).claudeHooks, 'off');
});

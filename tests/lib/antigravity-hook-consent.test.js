'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { createManifestInstallPlan } = require('../../scripts/lib/install/plan');
const { applyInstallPlan, previewInstallPlan } = require('../../scripts/lib/install/apply');
const { readInstallState, writeInstallState } = require('../../scripts/lib/install-state');
const { withHookConsent } = require('../../scripts/lib/install/hook-consent');

function seedPriorHookRegistration(plan, { legacy = false } = {}) {
  const hooksPath = path.join(plan.targetRoot, 'hooks.json');
  const setupPath = path.join(plan.targetRoot, 'ecc', 'setup.json');
  const bridgePath = path.join(plan.targetRoot, 'scripts', 'hooks', 'antigravity-hook-bridge.js');
  const mergePayload = {
    'ecc-guard': {
      PostToolUse: [{ matcher: 'write_to_file', hooks: [{ type: 'command', command: 'previous-ecc-hook' }] }],
    },
  };
  fs.mkdirSync(path.dirname(bridgePath), { recursive: true });
  fs.writeFileSync(bridgePath, '// Synthetic prior bridge. It must never be invoked.\n');
  fs.writeFileSync(hooksPath, JSON.stringify(mergePayload));
  if (!legacy) {
    fs.mkdirSync(path.dirname(setupPath), { recursive: true });
    fs.writeFileSync(setupPath, JSON.stringify({ hooks: { enabled: true }, userSetting: 'keep' }));
  }

  const state = {
    ...plan.statePreview,
    request: { ...plan.statePreview.request, modules: ['hooks-runtime'], hookConsent: 'enabled' },
    resolution: { ...plan.statePreview.resolution, selectedModules: ['hooks-runtime'] },
    operations: [{
      kind: 'merge-json', moduleId: 'hooks-runtime', sourceRelativePath: 'hooks/hooks.json',
      destinationPath: hooksPath, strategy: 'merge-json', ownership: 'managed', scaffoldOnly: false,
      mergePayload,
    }],
  };
  writeInstallState(plan.installStatePath, state);
  return { hooksPath, setupPath };
}

for (const target of ['antigravity', 'antigravity-home']) {
  for (const legacy of [false, true]) {
    test(`${target} revokes ${legacy ? 'older' : 'previously managed'} hooks and does not reactivate them`, () => {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-hook-consent-'));
      try {
        const options = { moduleIds: ['commands-core'], target, homeDir: root, projectRoot: root };
        const plan = createManifestInstallPlan(options);
        const { hooksPath, setupPath } = seedPriorHookRegistration(plan, { legacy });
        const config = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
        const userHook = { Stop: [{ type: 'command', command: 'user-selected-hook' }] };
        fs.writeFileSync(hooksPath, JSON.stringify({ ...config, 'user-hook': userHook }));
        const declinePlan = withHookConsent(createManifestInstallPlan(options), 'declined');
        const beforePreview = fs.readFileSync(hooksPath, 'utf8');
        const preview = previewInstallPlan(declinePlan);
        assert.ok(preview.operations.some(operation => operation.kind === 'remove-antigravity-hooks'));
        assert.ok(preview.warnings.some(warning => /disabl.*Antigravity hooks/i.test(warning)));
        assert.equal(fs.readFileSync(hooksPath, 'utf8'), beforePreview);
        applyInstallPlan(declinePlan);
        const declined = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
        assert.deepEqual(declined['user-hook'], userHook);
        assert.equal(Object.hasOwn(declined, 'ecc-guard'), false);
        const setup = JSON.parse(fs.readFileSync(setupPath, 'utf8'));
        assert.equal(setup.hooks.enabled, false);
        if (!legacy) assert.equal(setup.userSetting, 'keep');
        assert.equal(readInstallState(plan.installStatePath).request.hookConsent, 'declined');
        applyInstallPlan(withHookConsent(createManifestInstallPlan(options), 'declined'));
        assert.deepEqual(JSON.parse(fs.readFileSync(hooksPath, 'utf8')), { 'user-hook': userHook });
      } finally {
        assert.equal(path.dirname(fs.realpathSync(root)), fs.realpathSync(os.tmpdir()));
        fs.rmSync(root, { recursive: true, force: true });
      }
    });
  }

  for (const unsafe of ['modified-hooks', 'symlinked-setup', 'swapped-setup']) {
    test(`${target} refuses ${unsafe} before recording declined consent`, {
      skip: process.platform === 'win32' && unsafe !== 'modified-hooks'
        ? 'Creating file symlinks requires Windows developer mode or elevation' : false,
    }, () => {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-unsafe-revocation-'));
      try {
        const options = { moduleIds: ['commands-core'], target, homeDir: root, projectRoot: root };
        const plan = createManifestInstallPlan(options);
        const { hooksPath, setupPath } = seedPriorHookRegistration(plan);
        const original = fs.readFileSync(hooksPath, 'utf8');
        if (unsafe === 'modified-hooks') {
          const hooks = JSON.parse(original);
          fs.writeFileSync(hooksPath, JSON.stringify({
            ...hooks, 'ecc-guard': { ...hooks['ecc-guard'], Stop: [{ command: 'user-customized-hook' }] },
          }));
        } else if (unsafe === 'symlinked-setup') {
          fs.rmSync(setupPath);
          fs.symlinkSync(path.join(root, 'outside.json'), setupPath);
        }
        const before = fs.readFileSync(hooksPath, 'utf8');
        assert.throws(() => applyInstallPlan(withHookConsent(createManifestInstallPlan(options), 'declined'), {
          beforeOperationWrite({ operation }) {
            if (unsafe === 'swapped-setup' && operation.destinationPath === setupPath) {
              fs.rmSync(setupPath);
              fs.symlinkSync(path.join(root, 'outside.json'), setupPath);
            }
          },
        }),
          /modified Antigravity hooks|symlink|outside the install root/i);
        if (unsafe !== 'swapped-setup') assert.equal(fs.readFileSync(hooksPath, 'utf8'), before);
        assert.equal(fs.existsSync(path.join(root, 'outside.json')), false);
        assert.equal(JSON.parse(fs.readFileSync(plan.installStatePath, 'utf8')).request.hookConsent, 'enabled');
      } finally {
        assert.equal(path.dirname(fs.realpathSync(root)), fs.realpathSync(os.tmpdir()));
        fs.rmSync(root, { recursive: true, force: true });
      }
    });
  }

  test(`${target} fresh installation creates no hook runtime`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-fresh-declined-'));
    try {
      const plan = createManifestInstallPlan({ moduleIds: ['commands-core'], target, homeDir: root, projectRoot: root });
      applyInstallPlan(plan);
      assert.equal(fs.existsSync(path.join(plan.targetRoot, 'hooks.json')), false);
      assert.equal(fs.existsSync(path.join(plan.targetRoot, 'ecc', 'setup.json')), false);
      assert.equal(fs.existsSync(path.join(plan.targetRoot, 'scripts', 'hooks')), false);
    } finally {
      assert.equal(path.dirname(fs.realpathSync(root)), fs.realpathSync(os.tmpdir()));
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test(`${target} failed deactivation does not record declined consent`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-decline-failure-'));
    try {
      const options = { moduleIds: ['commands-core'], target, homeDir: root, projectRoot: root };
      const plan = createManifestInstallPlan(options);
      const { setupPath } = seedPriorHookRegistration(plan);
      const declined = withHookConsent(createManifestInstallPlan(options), 'declined');
      assert.throws(() => applyInstallPlan(declined, {
        beforeOperationWrite({ operation }) {
          if (operation.destinationPath === setupPath) {
            throw new Error('injected setup write failure');
          }
        },
      }), /injected setup write failure/);
      assert.equal(readInstallState(plan.installStatePath).request.hookConsent, 'enabled');
      applyInstallPlan(declined);
      assert.equal(readInstallState(plan.installStatePath).request.hookConsent, 'declined');
    } finally {
      assert.equal(path.dirname(fs.realpathSync(root)), fs.realpathSync(os.tmpdir()));
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}

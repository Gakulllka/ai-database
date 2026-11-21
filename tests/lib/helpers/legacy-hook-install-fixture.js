'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { createInstallState, writeInstallState } = require('../../../scripts/lib/install-state');

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

function legacyGroup(id) {
  return { id, matcher: '.*', hooks: [{ type: 'command', command: 'node --version' }] };
}

function createLegacyClaudeHookSource(root) {
  const modules = [{
    id: 'hooks-runtime', kind: 'hooks', description: 'Legacy hook fixture',
    paths: ['hooks'], targets: ['claude', 'claude-project'],
    dependencies: [], defaultInstall: false, cost: 'light', stability: 'stable',
  }];
  writeJson(path.join(root, 'package.json'), { version: '1.0.0' });
  writeJson(path.join(root, 'manifests', 'install-modules.json'), { version: 1, modules });
  writeJson(path.join(root, 'manifests', 'install-profiles.json'), { version: 1, profiles: {} });
  writeJson(path.join(root, 'manifests', 'install-components.json'), { version: 1, components: [] });
  const entry = legacyGroup('session:start');
  entry.hooks[0].command = 'node -e "var e=process.env.CLAUDE_PLUGIN_ROOT;process.stdout.write(e)"';
  writeJson(path.join(root, 'hooks', 'hooks.json'), { hooks: { SessionStart: [entry] } });
  writeJson(path.join(root, 'manifests', 'install-assets', 'claude-project-scripts-package.json'), { type: 'commonjs' });
  return root;
}

function seedLegacyClaudeHooks(targetRoot, {
  target = 'claude', includeConfigHealth = false, scriptBoundaries = false, otherSettings = {},
} = {}) {
  fs.mkdirSync(targetRoot, { recursive: true });
  targetRoot = fs.realpathSync(targetRoot);
  const settingsPath = path.join(targetRoot, 'settings.json');
  const installStatePath = path.join(targetRoot, 'ecc', 'install-state.json');
  const operations = [{
    kind: 'update-claude-settings', moduleId: 'hooks-runtime',
    sourceRelativePath: 'hooks/hooks.json', destinationPath: settingsPath,
    strategy: 'merge-hook-ids', ownership: 'managed', scaffoldOnly: false,
    managedHooks: { SessionStart: [legacyGroup('session:start')] },
  }];
  if (includeConfigHealth) {
    operations.push({
      kind: 'update-claude-settings', moduleId: 'config-health',
      sourceRelativePath: 'manifests/install-assets/config-health-hooks.json', destinationPath: settingsPath,
      strategy: 'merge-hook-ids', ownership: 'managed', scaffoldOnly: false,
      managedHooks: { SessionStart: [legacyGroup('config-health:session-start')] },
    });
  }
  writeJson(settingsPath, {
    includeCoAuthoredBy: false,
    ...otherSettings,
    hooks: {
      ...otherSettings.hooks,
      SessionStart: [
        ...(otherSettings.hooks?.SessionStart || []),
        ...operations.flatMap(operation => operation.managedHooks.SessionStart),
      ],
    },
  });
  if (scriptBoundaries) {
    for (const section of ['hooks', 'lib']) {
      const destinationPath = path.join(targetRoot, 'scripts', section, 'package.json');
      writeJson(destinationPath, { type: 'commonjs' });
      operations.push({
        kind: 'copy-file', moduleId: 'hooks-runtime', destinationPath,
        sourceRelativePath: 'manifests/install-assets/claude-project-scripts-package.json',
        strategy: 'preserve-relative-path', ownership: 'managed', scaffoldOnly: false,
        contentSha256: crypto.createHash('sha256').update(fs.readFileSync(destinationPath)).digest('hex'),
      });
    }
  }
  const state = createInstallState({
    adapter: { target, id: target === 'claude' ? 'claude-home' : 'claude-project', kind: target === 'claude' ? 'home' : 'project' },
    targetRoot, installStatePath,
    request: { profile: 'core', hookConsent: 'enabled' },
    resolution: { selectedModules: [...new Set(operations.map(operation => operation.moduleId))] },
    source: { repoVersion: '1.0.0', manifestVersion: 1 },
    operations,
  });
  fs.mkdirSync(path.dirname(installStatePath), { recursive: true });
  writeInstallState(installStatePath, state);
  return { state, settingsPath, installStatePath };
}

module.exports = { createLegacyClaudeHookSource, seedLegacyClaudeHooks };

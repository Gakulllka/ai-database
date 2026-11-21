'use strict';

const {
  createLegacyCompatInstallPlan,
  createLegacyInstallPlan,
  createManifestInstallPlan,
} = require('../install-executor');
const { resolveInvocationEnvironment } = require('../invocation-environment');
const { withHookConsent } = require('./hook-consent');
const { RETIRED_HOOK_COMPONENT, RETIRED_HOOK_MODULES } = require('./request');

function createInstallPlanFromRequest(request, options = {}) {
  if (!request || typeof request !== 'object') {
    throw new Error('A normalized install request is required');
  }

  // Recorded requests from older installs predate the current CLI normalization.
  const requestedModules = request.moduleIds || [];
  const requestedComponents = request.includeComponentIds || [];
  const moduleIds = requestedModules.filter(id => !RETIRED_HOOK_MODULES.has(id));
  const includeComponentIds = requestedComponents.filter(id => id !== RETIRED_HOOK_COMPONENT);
  const excludeComponentIds = (request.excludeComponentIds || []).filter(id => id !== RETIRED_HOOK_COMPONENT);
  const lostSelection = moduleIds.length !== requestedModules.length
    || includeComponentIds.length !== requestedComponents.length;
  if (request.mode === 'manifest' && lostSelection && !request.profileId
    && moduleIds.length === 0 && includeComponentIds.length === 0) {
    throw new Error('The recorded install only selected retired hooks. Choose a content module or uninstall the recorded hooks.');
  }
  const hookConsent = request.target === 'codex' ? request.hookConsent || null : 'declined';
  return withHookConsent(
    createRawInstallPlan({ ...request, moduleIds, includeComponentIds, excludeComponentIds, hookConsent }, options),
    hookConsent
  );
}

function createRawInstallPlan(request, options = {}) {
  if (request.mode === 'manifest') {
    return createManifestInstallPlan({
      target: request.target,
      profileId: request.profileId,
      moduleIds: request.moduleIds,
      includeComponentIds: request.includeComponentIds,
      excludeComponentIds: request.excludeComponentIds,
      projectRoot: options.projectRoot,
      homeDir: options.homeDir,
      env: resolveInvocationEnvironment(options),
      sourceRoot: options.sourceRoot,
      sourceUrl: options.sourceUrl,
      sourceSha: options.sourceSha || request.sourceSha,
      trust: request.trust,
      consent: {
        hooks: request.hookConsent === 'enabled',
        mcp: Object.fromEntries((request.consentMcp || []).map(id => [id, true])),
      },
      exemptValidationCodes: options.exemptValidationCodes || [],
    });
  }

  if (request.mode === 'legacy-compat') {
    return createLegacyCompatInstallPlan({
      target: request.target,
      legacyLanguages: request.legacyLanguages,
      includeComponentIds: request.includeComponentIds,
      excludeComponentIds: request.excludeComponentIds,
      projectRoot: options.projectRoot,
      homeDir: options.homeDir,
      env: resolveInvocationEnvironment(options),
      claudeRulesDir: options.claudeRulesDir,
      sourceRoot: options.sourceRoot,
      exemptValidationCodes: options.exemptValidationCodes || [],
    });
  }

  if (request.mode === 'legacy') {
    return createLegacyInstallPlan({
      target: request.target,
      languages: request.languages,
      projectRoot: options.projectRoot,
      homeDir: options.homeDir,
      env: resolveInvocationEnvironment(options),
      claudeRulesDir: options.claudeRulesDir,
      sourceRoot: options.sourceRoot,
    });
  }

  throw new Error(`Unsupported install request mode: ${request.mode}`);
}

module.exports = {
  createInstallPlanFromRequest,
};

#!/usr/bin/env node
'use strict';

const path = require('path');
const { syncSkillProjections } = require('../lib/sync-skill-projections');
const root = path.resolve(__dirname, '../..');
const names = new Set(['ecosystem-design-consistency', 'local-first-sync',
  'tabular-import-reconciliation', 'ai-artifact-contracts']);

function sync(write = false, repoRoot = root) {
  return syncSkillProjections({ write, repoRoot, select: name => names.has(name) });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--write', '--check'].includes(arg))) {
    throw new Error('Usage: node scripts/delta/sync-skills.js [--check | --write]');
  }
  const result = sync(args.includes('--write'));
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.differences.length ? 1 : 0;
}

module.exports = { sync };

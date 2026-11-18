#!/usr/bin/env node
'use strict';

const path = require('path');
const { syncSkillProjections } = require('../lib/sync-skill-projections');
const { modules } = require('../../manifests/install-modules.json');
const root = path.resolve(__dirname, '../..');
const godotModule = modules.find(module => module.id === 'godot-development');
const names = new Set(godotModule.paths.filter(source => source.startsWith('skills/'))
  .map(source => path.basename(source)));

function sync(write = false, repoRoot = root) {
  return syncSkillProjections({ write, repoRoot,
    select: name => names.has(name) });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--write', '--check'].includes(arg))) {
    throw new Error('Usage: node scripts/godot/sync-skills.js [--check | --write]');
  }
  const result = sync(args.includes('--write'));
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.differences.length ? 1 : 0;
}

module.exports = { sync };

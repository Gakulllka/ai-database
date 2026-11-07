#!/usr/bin/env node
'use strict';
const path = require('path');
const { projectMarkdown, syncSkillProjections } = require('../lib/sync-skill-projections');
const root = path.resolve(__dirname, '../..');
function sync(write = false, repoRoot = root) {
  return syncSkillProjections({ write, repoRoot, select: name => name.startsWith('1c-') });
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--write', '--check'].includes(arg))) {
    throw new Error('Usage: node scripts/1c/sync-skills.js [--check | --write]');
  }
  const result = sync(args.includes('--write'));
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.differences.length ? 1 : 0;
}
module.exports = { projectMarkdown, sync };

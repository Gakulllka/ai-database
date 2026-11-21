#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { fetchPack, findPacks, packHierarchy, planPack, readPackCatalog } = require('./lib/skill-packs');

const HELP = [
  'Browse and fetch Database skill packs',
  '',
  '  node scripts/skill-packs.js list [--json]',
  '  node scripts/skill-packs.js find "<task>" [--json]',
  '  node scripts/skill-packs.js show <pack-or-group> [--json]',
  '  node scripts/skill-packs.js fetch <pack-or-group> --into <existing-directory> [--json]',
  '',
  'Fetching creates a new folder with complete source paths and their declared module dependencies.',
].join('\n');

function printPlan(plan) {
  console.log(plan.title + ' [' + plan.id + ']');
  console.log('Modules: ' + plan.modules.join(', '));
  console.log('Skills (' + plan.skills.length + '): ' + plan.skills.join(', '));
  console.log('Source paths: ' + plan.paths.join(', '));
}

function main(args) {
  const json = args.includes('--json');
  const [command, ...values] = args.filter(arg => arg !== '--json');
  if (!command || command === '--help' || command === '-h') {
    console.log(HELP);
    return;
  }
  const catalog = readPackCatalog(path.join(__dirname, '..'));
  let result;
  if (command === 'list' && values.length === 0) {
    result = packHierarchy(catalog);
    if (!json) for (const group of result) {
      console.log(group.title + ' [' + group.id + ']');
      for (const pack of group.packs) console.log('  ' + pack.id + ' · ' + pack.title + ' (' + pack.skills.length + ')');
    }
  } else if (command === 'find' && values.length && values.every(value => !value.startsWith('--'))) {
    result = findPacks(catalog, values.join(' '));
    if (!json && !result.length) console.log('No matching packs. Run list to browse the catalog.');
    if (!json) for (const pack of result) console.log(pack.id + ' · ' + pack.title + ' [' + pack.group + ']');
  } else if (command === 'show' && values.length === 1) {
    result = planPack(catalog, values[0]);
    if (!json) printPlan(result);
  } else if (command === 'fetch' && values.length === 3 && values[1] === '--into') {
    planPack(catalog, values[0]);
    result = fetchPack(values[0], values[2]);
    if (!json) {
      printPlan(result);
      console.log('Checkout: ' + result.destination);
      console.log('Revision: ' + result.revision);
    }
  } else {
    throw new Error('Unknown skill pack command or arguments. Run with --help.');
  }
  if (json) console.log(JSON.stringify(result, null, 2));
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error('Error: ' + error.message);
  process.exitCode = 1;
}

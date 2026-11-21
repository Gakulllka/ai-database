'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const legacyShimPath = path.join(repoRoot, 'legacy-command-shims', 'commands', 'context-budget.md');

const legacyShim = fs.readFileSync(legacyShimPath, 'utf8');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    failed += 1;
  }
}

console.log('\n=== Context budget skill tests ===\n');

test('legacy alias points to the native live-context commands', () => {
  assert.match(legacyShim, /Codex, enter `\/status`/i);
  assert.match(legacyShim, /Claude Code, enter `\/context`/i);
  assert.doesNotMatch(legacyShim, /Assume a 200K context window/i);
});

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);

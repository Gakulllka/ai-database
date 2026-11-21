'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '../..');
const install = 'node scripts/codex/install-database-hooks.js';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('root README points to the supported standalone Codex hook install', () => {
  const text = read('README.md');
  assert.ok(text.includes(install + ' --dry-run'));
  assert.match(text, /\(hooks\/README\.md\)/);
  assert.doesNotMatch(text, /--modules hooks-runtime --enable-hooks/);
});

test('Codex hook instructions cover plan, install, global settings and trust', () => {
  const text = read('hooks/README.md');
  assert.ok(text.includes(install + ' --dry-run'));
  assert.ok(text.includes(install + '\n'));
  assert.match(text, /hooks\.json/);
  assert.match(text, /trust[\s\S]+\/hooks/);
  assert.doesNotMatch(text, /--modules hooks-runtime --enable-hooks/);
});

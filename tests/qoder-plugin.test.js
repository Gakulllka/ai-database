/** Qoder plugin manifest and retired lifecycle registration. */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(repoRoot, '.qoder-plugin', 'plugin.json');
const hooksPath = path.join(repoRoot, 'hooks', 'qoder-hooks.json');
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
const releaseScript = fs.readFileSync(path.join(repoRoot, 'scripts', 'release.sh'), 'utf8');

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

console.log('\n=== Qoder native plugin ===\n');

test('manifest and hook projection exist', () => {
  assert.ok(fs.existsSync(manifestPath), 'Expected .qoder-plugin/plugin.json');
  assert.ok(fs.existsSync(hooksPath), 'Expected hooks/qoder-hooks.json');
});

if (fs.existsSync(manifestPath) && fs.existsSync(hooksPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

  test('manifest stays versioned with the npm package', () => {
    assert.strictEqual(manifest.name, 'ecc');
    assert.strictEqual(manifest.version, packageJson.version);
  });

  test('release tooling updates and stages the Qoder manifest', () => {
    assert.ok(releaseScript.includes('QODER_PLUGIN_JSON=".qoder-plugin/plugin.json"'));
    assert.ok(releaseScript.includes('update_version "$QODER_PLUGIN_JSON"'));
    const gitAddLine = releaseScript
      .split(/\r?\n/)
      .find(line => /^\s*git add\b/.test(line));
    assert.ok(gitAddLine, 'Expected release tooling to contain a git add command');
    assert.ok(
      gitAddLine.includes('"$QODER_PLUGIN_JSON"'),
      'Expected the git add command to stage the Qoder manifest'
    );
  });

  test('manifest reuses canonical plugin resources', () => {
    assert.strictEqual(manifest.skills, './skills/');
    assert.strictEqual(manifest.commands, './commands/');
    assert.strictEqual(manifest.mcpServers, './.mcp.json');
    assert.strictEqual(manifest.hooks, './hooks/qoder-hooks.json');
  });

  test('agent colors are accepted by Qoder', () => {
    const allowedColors = new Set([
      'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan',
    ]);
    for (const fileName of fs.readdirSync(path.join(repoRoot, 'agents'))) {
      if (!fileName.endsWith('.md')) continue;
      const source = fs.readFileSync(path.join(repoRoot, 'agents', fileName), 'utf8');
      const match = source.match(/^color:\s*(\S+)$/m);
      if (match) {
        assert.ok(allowedColors.has(match[1]), `${fileName} uses unsupported Qoder color ${match[1]}`);
      }
    }
  });

  test('Qoder package has no Database lifecycle hook registrations', () => {
    assert.deepStrictEqual(hooks, { hooks: {} });
  });
}

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);

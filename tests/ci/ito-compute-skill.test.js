/**
 * Contract tests for the Itô compute bridge documentation and packaging.
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.error(`    ${error.message}`);
    return false;
  }
}

function main() {
  console.log("\n=== Testing Itô compute bridge surface ===\n");

  const tests = [
    ["keeps README and integration docs aligned with the separated auth contract", () => {
      for (const relativePath of [
        "README.md",
        "docs/design/ecc-ito-compute-integration.md",
      ]) {
        const source = read(relativePath);
        assert.match(source, /ecc ito login \[?--no-browser\]?/i, relativePath);
        assert.match(source, /ecc ito auth/i, relativePath);
        assert.match(source, /auth.*validat/i, relativePath);
        assert.match(source, /login.*(?:Keychain|device authorization)/is, relativePath);
        assert.doesNotMatch(source, /ecc ito auth --no-browser/i, relativePath);
        assert.match(source, /ITO_API_KEY.*(?:auth|find|status)/is, relativePath);
        assert.match(source, /ITO_AUTH_MODE=legacy[^.]*not required/i, relativePath);
      }
    }],
    ["publishes the bridge without bundling the Itô CLI", () => {
      const packageJson = readJson("package.json");
      assert.ok(packageJson.files.includes("scripts/ito.js"));
      assert.ok(!packageJson.dependencies?.["ito-compute-cli"]);
      assert.ok(!packageJson.optionalDependencies?.["ito-compute-cli"]);
      assert.ok(!packageJson.bin?.ito);
    }],
    ["offers an opt-in local MCP template with the exact real tool boundary", () => {
      const mcpConfig = readJson("mcp-configs/mcp-servers.json");
      const server = mcpConfig.mcpServers["ito-compute"];
      assert.ok(server, "ito-compute MCP template is missing");
      assert.strictEqual(server.command, "node");
      assert.deepStrictEqual(server.args, [
        "/absolute/path/to/ito-cloud-runtime/cli/ito-compute-cli/dist/bin/ito-mcp.js",
      ]);
      assert.doesNotMatch(JSON.stringify(server), /npx|ito_lock|ito_run|paper|simulat/i);
      assert.match(server.description, /ito_auth, ito_find, ito_status, and ito_accept/);
      assert.match(server.description, /unpublished/i);
      assert.match(server.description, /ito_auth.*validat/i);
      assert.match(server.description, /macOS Keychain/i);
      assert.match(server.description, /no browser automation/i);
    }],
  ];

  let passed = 0;
  let failed = 0;
  for (const [name, fn] of tests) {
    if (runTest(name, fn)) passed += 1;
    else failed += 1;
  }

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main();

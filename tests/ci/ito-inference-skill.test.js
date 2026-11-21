/**
 * Verify the Itô CLI bridge rejects unsupported inference serving.
 */

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

function test(name, fn) {
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

console.log("\n=== Testing Itô inference bridge boundary ===\n");

const results = [
  test("keeps unsupported serving outside the executable bridge", () => {
    const bridge = read("scripts/ito.js");
    assert.match(bridge, /SUPPORTED_COMMANDS[^\n]+login[^\n]+auth[^\n]+find[^\n]+status[^\n]+evals/);
    assert.doesNotMatch(bridge, /SUPPORTED_COMMANDS[^\n]+serve/);
    assert.match(bridge, /Unsupported Itô command/);

    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ecc-ito-serve-reject-"));
    try {
      const canonicalDir = path.join(fixtureRoot, "cli", "ito-compute-cli", "dist", "bin");
      fs.mkdirSync(canonicalDir, { recursive: true });
      const marker = path.join(fixtureRoot, "spawned");
      const executable = path.join(canonicalDir, "ito.js");
      fs.writeFileSync(executable, `require("fs").writeFileSync(${JSON.stringify(marker)}, "spawned");\n`);
      const result = spawnSync(process.execPath, [
        path.join(REPO_ROOT, "scripts", "ecc.js"), "ito", "serve",
        "--booking", "booking_test", "--model", "model_test",
      ], {
        encoding: "utf8",
        env: { ...process.env, ECC_ITO_CLI_EXECUTABLE: executable },
      });
      assert.notStrictEqual(result.status, 0);
      assert.match(result.stderr, /Unsupported Itô command "serve"/);
      assert.ok(!fs.existsSync(marker), "unsupported serve spawned the canonical child");
    } finally {
      fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
  }),

];

const failed = results.filter((passed) => !passed).length;
console.log(`\nPassed: ${results.length - failed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);

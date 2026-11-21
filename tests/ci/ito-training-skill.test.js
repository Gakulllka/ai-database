/**
 * Verify the Itô CLI bridge rejects unsupported training.
 * No test contacts Itô, opens a browser, books capacity, or starts a run.
 */

"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

const tests = [];
function test(name, fn) { tests.push([name, fn]); }

test("keeps unsupported training outside the executable bridge", () => {
  const bridge = read("scripts/ito.js");
  assert.match(bridge, /SUPPORTED_COMMANDS[^\n]+login[^\n]+auth[^\n]+find[^\n]+status[^\n]+evals/);
  assert.doesNotMatch(bridge, /SUPPORTED_COMMANDS[^\n]+train/);
  assert.match(bridge, /Unsupported Itô command/);

  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ecc-ito-train-reject-"));
  try {
    const canonicalDir = path.join(fixtureRoot, "cli", "ito-compute-cli", "dist", "bin");
    fs.mkdirSync(canonicalDir, { recursive: true });
    const marker = path.join(fixtureRoot, "spawned");
    const executable = path.join(canonicalDir, "ito.js");
    fs.writeFileSync(executable, `require("fs").writeFileSync(${JSON.stringify(marker)}, "spawned");\n`);
    const result = spawnSync(process.execPath, [
      path.join(REPO_ROOT, "scripts", "ecc.js"), "ito", "train",
      "--booking", "booking_test", "--model-size", "8B",
    ], {
      encoding: "utf8",
      env: { ...process.env, ECC_ITO_CLI_EXECUTABLE: executable },
    });
    assert.notStrictEqual(result.status, 0);
    assert.match(result.stderr, /Unsupported Itô command "train"/);
    assert.ok(!fs.existsSync(marker), "unsupported train spawned the canonical child");
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

(async () => {
  let passed = 0;
  let failed = 0;
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed += 1;
    } catch (error) {
      console.log(`  ✗ ${name}`);
      console.error(`    ${error.message}`);
      failed += 1;
    }
  }
  console.log(`${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
  else console.log("PASS Itô training bridge boundary");
})();

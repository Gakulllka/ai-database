'use strict';

async function main() {
  const [
    { default: assert }, { readFileSync }, { dirname, resolve },
    { runInNewContext }, { test },
  ] = await Promise.all([
    import('node:assert/strict'), import('node:fs'), import('node:path'),
    import('node:vm'), import('node:test'),
  ]);

  const skillPath = process.argv[2] || resolve(dirname(resolve(process.argv[1])), '../SKILL.md');
  const source = readFileSync(skillPath, 'utf8');
  const snippet = [...source.matchAll(/\x60\x60\x60javascript\r?\n([\s\S]*?)\r?\n\x60\x60\x60/g)]
    .map(match => match[1])
    .find(code => /\bfunction compareCacheCost\s*\(/.test(code));
  assert.ok(snippet, 'The documented calculator must be executable offline');
  const calculate = runInNewContext(snippet + '\ncompareCacheCost', Object.create(null), { timeout: 1000 });

  const rates = { input: 3, write: 3.75, read: 0.3, output: 15, storage: 1 };
  const usage = { uncached: 20000, written: 10000, read: 90000, output: 20000, storageTokenHours: 0 };
  function near(actual, expected) {
    assert.ok(Math.abs(actual - expected) < 1e-10, actual + ' != ' + expected);
  }

  test('ten requests include the cache write and ordinary output costs', () => {
    const costs = calculate(usage, rates);
    near(costs.baseline, 0.66);
    near(costs.actual, 0.4245);
    near(costs.savings, 0.2355);
    near(costs.outputCost, 0.3);
  });

  test('a one-off cache write increases the bill', () => {
    const costs = calculate({ ...usage, uncached: 2000, written: 10000, read: 0, output: 2000 }, rates);
    near(costs.savings, -0.0075);
  });

  test('an ineligible short prefix produces zero cache savings', () => {
    const costs = calculate({ ...usage, uncached: 5000, written: 0, read: 0, output: 1000 }, rates);
    near(costs.savings, 0);
  });

  test('storage token-hours add a separate storage cost', () => {
    const costs = calculate({ ...usage, storageTokenHours: 20000 }, rates);
    near(costs.storageCost, 0.02);
    near(costs.actual, 0.4445);
    near(costs.savings, 0.2155);
  });

  test('output-heavy work preserves the same absolute cache savings', () => {
    const costs = calculate({ ...usage, output: 1000000 }, rates);
    near(costs.outputCost, 15);
    near(costs.savings, 0.2355);
  });

  test('each cache write is charged after expiration', () => {
    const costs = calculate({ ...usage, written: 100000, read: 0 }, rates);
    near(costs.savings, -0.075);
  });

  test('invalid or missing usage and rates fail clearly', () => {
    for (const invalid of [-1, NaN, Infinity, '3', undefined]) {
      assert.throws(() => calculate({ ...usage, read: invalid }, rates), /nonnegative/);
      assert.throws(() => calculate(usage, { ...rates, storage: invalid }), /nonnegative/);
    }
  });
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

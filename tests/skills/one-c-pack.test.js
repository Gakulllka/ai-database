'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { pathToFileURL } = require('url');
const { sync } = require('../../scripts/1c/sync-skills');

const root = path.resolve(__dirname, '../..');
const operations = path.join(root, 'skills/1c-platform-tools/operations');
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-1c-pack-'));
const python = process.env.PYTHON || 'python';
let passed = 0;
let failed = 0;

function run(script, args = [], cwd = scratch) {
  const result = spawnSync(python, [script, ...args], {
    cwd, encoding: 'utf8', timeout: 30000,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONDONTWRITEBYTECODE: '1' }
  });
  assert.ifError(result.error);
  return result;
}

function success(result) {
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
}

function tool(operation, file = operation) {
  return path.join(operations, operation, 'scripts', file + '.py');
}

async function test(name, fn) {
  try {
    await fn();
    console.log('PASS: ' + name);
    passed++;
  } catch (error) {
    console.error('FAIL: ' + name + '\n' + error.message);
    failed++;
  }
}

async function main() {
  const configuration = path.join(scratch, 'consumer-a', 'src');
  await test('configuration helpers work from an independent consumer CWD', () => {
    success(run(tool('cf-init'), ['-Name', 'FixtureConfiguration', '-OutputDir', configuration,
      '-CompatibilityMode', 'Version8_3_24', '-FormatVersion', '2.17']));
    success(run(tool('cf-validate'), ['-ConfigPath', configuration]));
    success(run(tool('cf-edit'), ['-ConfigPath', configuration, '-Operation', 'modify-property',
      '-Value', 'Version=1.2.3.4']));
    const xml = fs.readFileSync(path.join(configuration, 'Configuration.xml'), 'utf8');
    assert.ok(xml.includes('<Version>1.2.3.4</Version>'));
    success(run(tool('cf-validate'), ['-ConfigPath', configuration]));
  });

  await test('a failed child validator makes the editor fail', () => {
    const fakeOperations = path.join(scratch, 'failing-validator');
    const edit = path.join(fakeOperations, 'cf-edit/scripts/cf-edit.py');
    const validate = path.join(fakeOperations, 'cf-validate/scripts/cf-validate.py');
    fs.mkdirSync(path.dirname(edit), { recursive: true });
    fs.mkdirSync(path.dirname(validate), { recursive: true });
    fs.copyFileSync(tool('cf-edit'), edit);
    fs.writeFileSync(validate, 'import sys\nprint("fixture validation failure")\nsys.exit(7)\n');
    const result = run(edit, ['-ConfigPath', configuration, '-Operation', 'modify-property',
      '-Value', 'Version=1.2.3.5']);
    assert.strictEqual(result.status, 7, result.stdout + result.stderr);
  });

  await test('spreadsheet template compilation produces structurally valid XML', () => {
    const definition = path.join(scratch, 'layout.json');
    const output = path.join(scratch, 'Template.xml');
    fs.writeFileSync(definition, JSON.stringify({ columns: 2, areas: [
      { name: 'Header', rows: [{ cells: ['Code', 'Amount'] }] }
    ] }));
    success(run(tool('mxl-compile'), ['-JsonPath', definition, '-OutputPath', output]));
    success(run(tool('mxl-validate'), ['-TemplatePath', output]));
    assert.ok(fs.readFileSync(output, 'utf8').includes('Header'));
  });

  await test('role generation preserves explicit read rights', () => {
    const definition = path.join(scratch, 'role.json');
    fs.writeFileSync(definition, JSON.stringify({ name: 'FixtureRead', objects: [
      'Catalog.FixtureCatalog: @view'
    ] }));
    success(run(tool('role-compile'), ['-JsonPath', definition, '-OutputDir', configuration]));
    const rights = path.join(configuration, 'Roles/FixtureRead/Ext/Rights.xml');
    success(run(tool('role-validate'), ['-RightsPath', rights]));
    const xml = fs.readFileSync(rights, 'utf8');
    assert.ok(xml.includes('Catalog.FixtureCatalog'));
    assert.ok(xml.includes('<name>Read</name>'));
  });

  await test('two consumer projects have separate web runtime paths', () => {
    const moduleUrl = pathToFileURL(path.join(operations, 'web-test/scripts/engine/core/state.mjs')).href;
    const code = `import(${JSON.stringify(moduleUrl)}).then(m=>console.log(JSON.stringify({root:m.projectRoot,runtime:m.runtimeDir})))`;
    const states = ['consumer-a', 'consumer-b'].map(name => {
      const consumer = path.join(scratch, name);
      fs.mkdirSync(consumer, { recursive: true });
      const result = spawnSync(process.execPath, ['-e', code], { cwd: consumer,
        env: { ...process.env, ECC_1C_PROJECT_ROOT: consumer }, encoding: 'utf8', timeout: 10000 });
      success(result);
      return JSON.parse(result.stdout);
    });
    assert.notStrictEqual(states[0].runtime, states[1].runtime);
    for (const state of states) {
      assert.strictEqual(state.runtime, path.join(state.root, '.scratch/1c-web-client'));
      assert.ok(!state.runtime.startsWith(operations));
    }
  });

  await test('web credentials come only from explicit web-client fields', async () => {
    const url = pathToFileURL(path.join(operations, 'web-test/scripts/cli/credentials.mjs')).href;
    const { credentialsFromEnvironment } = await import(url);
    assert.strictEqual(credentialsFromEnvironment({ MCP_USER: 'unrelated' }), null);
    assert.throws(() => credentialsFromEnvironment({ ECC_1C_WEB_PASSWORD: 'fixture' }), /USER/);
    assert.deepStrictEqual(credentialsFromEnvironment({ ECC_1C_WEB_USER: 'fixture-user',
      ECC_1C_WEB_PASSWORD: 'fixture-value' }), { username: 'fixture-user', password: 'fixture-value' });
  });

  await test('the Codex projection matches current canonical resources', () => {
    assert.deepStrictEqual(sync(false).differences, []);
  });

  await test('projection preflight rejects junctions before writing any skill', () => {
    const fixture = path.join(scratch, 'projection-fixture');
    const first = path.join(fixture, '.agents/skills/1c-a/SKILL.md');
    const outside = path.join(scratch, 'junction-target');
    for (const name of ['1c-a', '1c-b']) {
      fs.mkdirSync(path.join(fixture, 'skills', name), { recursive: true });
      fs.writeFileSync(path.join(fixture, 'skills', name, 'SKILL.md'), 'desired projection');
    }
    fs.mkdirSync(path.dirname(first), { recursive: true });
    fs.writeFileSync(first, 'keep until all destinations are checked');
    fs.mkdirSync(outside, { recursive: true });
    const sentinel = path.join(outside, 'SKILL.md');
    fs.writeFileSync(sentinel, 'outside sentinel');
    fs.symlinkSync(outside, path.join(fixture, '.agents/skills/1c-b'),
      process.platform === 'win32' ? 'junction' : 'dir');
    assert.throws(() => sync(true, fixture), /symbolic link|junction/);
    assert.strictEqual(fs.readFileSync(first, 'utf8'), 'keep until all destinations are checked');
    assert.strictEqual(fs.readFileSync(sentinel, 'utf8'), 'outside sentinel');
  });

  await test('error screenshots create consumer directories and never return missing files', async () => {
    const url = pathToFileURL(path.join(operations, 'web-test/scripts/cli/error-shots.mjs')).href;
    const { writeErrorShot } = await import(url);
    const target = path.join(scratch, 'fresh-consumer/.scratch/1c-web-client/error-shot.png');
    const png = Buffer.from('synthetic screenshot bytes');
    assert.strictEqual(writeErrorShot(png, target), target);
    assert.deepStrictEqual(fs.readFileSync(target), png);
    const blocked = path.join(scratch, 'blocked-parent');
    fs.writeFileSync(blocked, 'not a directory');
    assert.throws(() => writeErrorShot(png, path.join(blocked, 'error-shot.png')));
  });

  await test('web execution context handles an error without a real browser', () => {
    const modulePath = path.join(operations, 'web-test/scripts/cli/exec-context.mjs');
    const helperPath = path.join(operations, 'web-test/scripts/cli/error-shots.mjs');
    const runtime = path.join(scratch, 'mock-browser/.scratch/1c-web-client');
    const code = `
      const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert');
      const context=vm.createContext({console});
      const cache=new Map();
      const values={
        fs:{readFileSync:fs.readFileSync,writeFileSync:fs.writeFileSync,mkdirSync:fs.mkdirSync},
        path:require('node:path'),
        '../engine/core/state.mjs':{runtimeDir:${JSON.stringify(runtime)}},
        '../browser.mjs':{screenshot:async()=>Buffer.from('synthetic image'),isRecording:()=>false},
        './util.mjs':{elapsed:()=>0,slugify:value=>value}
      };
      function load(name){
        if(cache.has(name))return cache.get(name);
        let module;
        if(name==='./error-shots.mjs')module=new vm.SourceTextModule(fs.readFileSync(${JSON.stringify(helperPath)},'utf8'),{context});
        else {
          const data=values[name];assert.ok(data,'Unexpected dependency '+name);
          module=new vm.SyntheticModule(Object.keys(data),function(){for(const [key,value] of Object.entries(data))this.setExport(key,value);},{context});
        }
        cache.set(name,module);return module;
      }
      (async()=>{
        const module=new vm.SourceTextModule(fs.readFileSync(${JSON.stringify(modulePath)},'utf8'),{context});
        await module.link(load);await module.evaluate();
        const api=module.namespace.buildContext({noRecord:true});
        assert.strictEqual(typeof api.writeFileSync,'function');
        assert.strictEqual(typeof api.readFileSync,'function');
        const result=await module.namespace.executeScript('throw new Error("fixture error")');
        assert.strictEqual(result.ok,false);assert.strictEqual(result.error,'fixture error');
        assert.ok(fs.existsSync(result.screenshot));
      })().catch(error=>{console.error(error);process.exitCode=1;});
    `;
    const result = spawnSync(process.execPath, ['--experimental-vm-modules', '-e', code],
      { encoding: 'utf8', timeout: 10000 });
    success(result);
  });

  console.log(`Results: ${passed} passed, ${failed} failed. Synthetic files only; no 1C runtime.`);
  process.exitCode = failed ? 1 : 0;
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => {
  const target = path.resolve(scratch);
  const tempRoot = path.resolve(os.tmpdir());
  if (path.dirname(target) !== tempRoot || !path.basename(target).startsWith('ecc-1c-pack-')) {
    throw new Error('Refusing to remove an unexpected synthetic-test directory');
  }
  fs.rmSync(target, { recursive: true, force: true });
});

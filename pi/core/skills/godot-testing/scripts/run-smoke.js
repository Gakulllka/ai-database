#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const crypto = require('crypto');

function execute(engine, args, cwd) {
  const result = spawnSync(engine, args, { cwd, encoding: 'utf8', timeout: 30000,
    windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  if (result.error) throw result.error;
  return { exitCode: result.status, signal: result.signal,
    stdout: result.stdout || '', stderr: result.stderr || '' };
}

function assessRun(result, dimension) {
  const combined = result.stdout + '\n' + result.stderr;
  const marker = result.stdout.split(/\r?\n/).find(line => line.startsWith('ECC_GODOT_SMOKE:'));
  let evidence;
  try { evidence = marker ? JSON.parse(marker.slice('ECC_GODOT_SMOKE:'.length)) : null; }
  catch { evidence = null; }
  return { passed: result.exitCode === 0 && !result.signal && !/\b(?:SCRIPT ERROR|ERROR):/.test(combined)
    && evidence?.dimension === dimension && evidence?.checks === 4 && evidence?.physics_ticks >= 4,
  evidence };
}

function runSmoke({ engine, outputDirectory }) {
  const executable = path.resolve(engine);
  if (!fs.statSync(executable).isFile()) throw new Error('Select an existing Godot executable');
  const output = path.resolve(outputDirectory);
  fs.mkdirSync(output, { recursive: true });
  const work = fs.mkdtempSync(path.join(output, 'ecc-godot-smoke-'));
  const version = execute(executable, ['--version'], work);
  if (version.exitCode !== 0 || !/^4\./.test(version.stdout.trim())) {
    throw new Error('These fixtures require a verified Godot 4 executable: ' + version.stdout + version.stderr);
  }
  const help = execute(executable, ['--help'], work);
  for (const flag of ['--headless', '--path', '--log-file', '--quit-after']) {
    if (help.exitCode !== 0 || !help.stdout.includes(flag)) throw new Error('Required CLI flag not verified: ' + flag);
  }
  const runs = [];
  for (const name of ['2d', '3d']) {
    const project = path.join(work, name);
    fs.mkdirSync(project);
    for (const file of ['smoke.gd', 'main.tscn']) {
      fs.copyFileSync(path.join(__dirname, '../assets', 'godot4-' + name, file), path.join(project, file));
    }
    const profileName = 'ECCGodotValidation/' + crypto.randomUUID() + '/' + name;
    const config = `config_version=5\n\n[application]\nconfig/name="ECC Godot Fixture ${name}"\nrun/main_scene="res://main.tscn"\nconfig/features=PackedStringArray("4.0", "GL Compatibility")\nconfig/use_custom_user_dir=true\nconfig/custom_user_dir_name=${JSON.stringify(profileName)}\n\n[rendering]\nrenderer/rendering_method="gl_compatibility"\n`;
    fs.writeFileSync(path.join(project, 'project.godot'), config);
    const args = ['--headless', '--path', project, '--log-file', path.join(project, 'engine.log'), '--quit-after', '300'];
    const result = execute(executable, args, project);
    const assessment = assessRun(result, name.toUpperCase());
    runs.push({ dimension: name.toUpperCase(), project, userDataProfile: profileName, args,
      ...result, ...assessment });
  }
  const report = { engine: executable, version: version.stdout.trim(), work,
    passed: runs.every(run => run.passed), runs,
    limits: ['Synthetic Godot 4 projects only; the consumer game is never loaded.',
      'Unique QA user-data profiles may be created in the OS application-data location.',
      'No renderer/audio/device/network/export or C# acceptance is established.'] };
  fs.writeFileSync(path.join(work, 'evidence.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 4 || args[0] !== '--engine' || args[2] !== '--output') {
    console.error('Usage: node run-smoke.js --engine <Godot4-executable> --output <owned-QA-directory>');
    process.exitCode = 2;
  } else {
    try {
      const report = runSmoke({ engine: args[1], outputDirectory: args[3] });
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = report.passed ? 0 : 1;
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}

module.exports = { assessRun, runSmoke };

#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
function projectMarkdown(text, sourceFile, destinationFile, repoRoot = root) {
  const sourceRoot = path.join(repoRoot, 'skills');
  const destinationRoot = path.join(repoRoot, '.agents/skills');
  return text.replace(/(\[[^\]]*\]\()([^\s)]+)(\))/g, (all, start, target, end) => {
    if (/^(https?:|#|[A-Z]:)/i.test(target)) return all;
    const [file, anchor] = target.split('#');
    const resolved = path.resolve(path.dirname(sourceFile), file);
    const mapped = resolved.startsWith(sourceRoot + path.sep)
      ? path.join(destinationRoot, path.relative(sourceRoot, resolved)) : resolved;
    let relative = path.relative(path.dirname(destinationFile), mapped).split(path.sep).join('/');
    if (target.endsWith('/') && !relative.endsWith('/')) relative += '/';
    return start + relative + (anchor ? '#' + anchor : '') + end;
  });
}

function listFiles(directory, prefix = '') {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relative = path.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Unexpected symbolic link: ' + relative);
    if (!entry.isDirectory() && !entry.isFile()) throw new Error('Unexpected resource type: ' + relative);
    return entry.isDirectory()
      ? listFiles(path.join(directory, entry.name), relative) : [relative];
  });
}

function inspectPath(repoRoot, candidate, directory = false) {
  const relative = path.relative(repoRoot, candidate);
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
    throw new Error('Path is outside the selected repository: ' + candidate);
  }
  const parts = relative ? relative.split(path.sep) : [];
  for (let index = 0; index <= parts.length; index++) {
    const current = path.join(repoRoot, ...parts.slice(0, index));
    let stat;
    try { stat = fs.lstatSync(current); } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    if (stat.isSymbolicLink()) throw new Error('Refusing symbolic link or junction: ' + current);
    const isDirectory = index < parts.length || directory;
    if (isDirectory ? !stat.isDirectory() : !stat.isFile()) {
      throw new Error('Unexpected path type: ' + current);
    }
  }
}

function syncSkillProjections({ write = false, repoRoot = root, select } = {}) {
  if (typeof select !== "function") throw new Error("A skill selector is required");
  repoRoot = path.resolve(repoRoot);
  const sourceRoot = path.join(repoRoot, 'skills');
  const destinationRoot = path.join(repoRoot, '.agents/skills');
  inspectPath(repoRoot, sourceRoot, true);
  inspectPath(repoRoot, destinationRoot, true);
  const skills = fs.readdirSync(sourceRoot).filter(select);
  // Inspect every tree before any write, including roots and existing file ancestors.
  const plans = skills.map(skill => {
    const sourceDir = path.join(sourceRoot, skill);
    const destinationDir = path.join(destinationRoot, skill);
    inspectPath(repoRoot, sourceDir, true);
    inspectPath(repoRoot, destinationDir, true);
    const expectedFiles = listFiles(sourceDir);
    const actualFiles = listFiles(destinationDir);
    for (const file of expectedFiles) {
      inspectPath(repoRoot, path.join(destinationDir, file));
    }
    return { skill, sourceDir, destinationDir, expectedFiles, actualFiles };
  });
  const differences = [];
  let checked = 0;
  for (const { skill, sourceDir, destinationDir, expectedFiles, actualFiles } of plans) {
    for (const relative of expectedFiles) {
      const source = path.join(sourceDir, relative);
      const destination = path.join(destinationDir, relative);
      const expected = relative.endsWith('.md')
        ? Buffer.from(projectMarkdown(fs.readFileSync(source, 'utf8'), source, destination, repoRoot))
        : fs.readFileSync(source);
      checked++;
      if (fs.existsSync(destination) && fs.readFileSync(destination).equals(expected)) continue;
      if (write) {
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, expected);
      } else differences.push(path.join(skill, relative));
    }
    for (const relative of actualFiles) {
      if (!expectedFiles.includes(relative)) differences.push('Unexpected projection file: ' + path.join(skill, relative));
    }
  }
  return { skills: skills.length, files: checked, differences };
}

module.exports = { projectMarkdown, syncSkillProjections };

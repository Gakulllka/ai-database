// Database adaptation: report an error-shot path only after its file exists.
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export function writeErrorShot(png, target) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, png);
  return target;
}

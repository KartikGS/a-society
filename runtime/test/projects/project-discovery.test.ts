import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { discoverProjects } from '../../src/projects/project-discovery.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

console.log('\nproject-discovery');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-project-discovery-'));

fs.mkdirSync(path.join(tmpDir, 'alpha', 'a-docs'), { recursive: true });
fs.mkdirSync(path.join(tmpDir, 'beta'), { recursive: true });
fs.mkdirSync(path.join(tmpDir, 'gamma', 'a-docs'), { recursive: true });
fs.mkdirSync(path.join(tmpDir, 'delta'), { recursive: true });
fs.writeFileSync(path.join(tmpDir, 'README.md'), 'not a directory');

test('discoverProjects: groups top-level directories by presence of a-docs', () => {
  const discovery = discoverProjects(tmpDir);

  assert.deepStrictEqual(
    discovery.withADocs.map((project) => project.folderName),
    ['alpha', 'gamma']
  );
  assert.deepStrictEqual(
    discovery.withoutADocs.map((project) => project.folderName),
    ['beta', 'delta']
  );
});

test('discoverProjects: returns empty groups for a missing workspace root', () => {
  const discovery = discoverProjects(path.join(tmpDir, 'missing-workspace'));

  assert.deepStrictEqual(discovery, { withADocs: [], withoutADocs: [] });
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

fs.rmSync(tmpDir, { recursive: true, force: true });

if (failed > 0) {
  process.exit(1);
}

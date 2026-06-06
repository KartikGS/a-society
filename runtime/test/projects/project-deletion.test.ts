import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deleteProject, ProjectDeletionError } from '../../src/projects/project-deletion.js';

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

console.log('\nproject-deletion');

function makeWorkspace(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-project-delete-'));
}

test('deleteProject removes the project folder and project state folder', () => {
  const workspaceRoot = makeWorkspace();
  const projectRoot = path.join(workspaceRoot, 'demo-project');
  const stateProjectRoot = path.join(workspaceRoot, '.a-society', 'state', 'demo-project');
  const siblingStateRoot = path.join(workspaceRoot, '.a-society', 'state', 'other-project');
  fs.mkdirSync(path.join(projectRoot, 'a-docs'), { recursive: true });
  fs.mkdirSync(path.join(stateProjectRoot, 'flow-1', 'record'), { recursive: true });
  fs.mkdirSync(siblingStateRoot, { recursive: true });

  const result = deleteProject(workspaceRoot, 'demo-project');

  assert.strictEqual(result.removedProjectRoot, true);
  assert.strictEqual(result.removedStateProjectRoot, true);
  assert.strictEqual(fs.existsSync(projectRoot), false);
  assert.strictEqual(fs.existsSync(stateProjectRoot), false);
  assert.strictEqual(fs.existsSync(siblingStateRoot), true);

  fs.rmSync(workspaceRoot, { recursive: true, force: true });
});

test('deleteProject removes state even when the project folder is already gone', () => {
  const workspaceRoot = makeWorkspace();
  const stateProjectRoot = path.join(workspaceRoot, '.a-society', 'state', 'state-only');
  fs.mkdirSync(path.join(stateProjectRoot, 'flow-1'), { recursive: true });

  const result = deleteProject(workspaceRoot, 'state-only');

  assert.strictEqual(result.removedProjectRoot, false);
  assert.strictEqual(result.removedStateProjectRoot, true);
  assert.strictEqual(fs.existsSync(stateProjectRoot), false);

  fs.rmSync(workspaceRoot, { recursive: true, force: true });
});

test('deleteProject refuses the A-Society framework folder', () => {
  const workspaceRoot = makeWorkspace();
  const frameworkRoot = path.join(workspaceRoot, 'a-society');
  fs.mkdirSync(path.join(frameworkRoot, 'runtime'), { recursive: true });

  assert.throws(
    () => deleteProject(workspaceRoot, 'a-society'),
    (error) => error instanceof ProjectDeletionError && error.statusCode === 400
  );
  assert.strictEqual(fs.existsSync(frameworkRoot), true);

  fs.rmSync(workspaceRoot, { recursive: true, force: true });
});

test('deleteProject rejects path separators', () => {
  const workspaceRoot = makeWorkspace();

  assert.throws(
    () => deleteProject(workspaceRoot, '../demo'),
    /Invalid project namespace/
  );

  fs.rmSync(workspaceRoot, { recursive: true, force: true });
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}

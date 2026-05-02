import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveFlowWorkflow } from '../../src/context/workflow-file.js';

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

console.log('\nworkflow-file');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-workflow-file-'));
const projectNamespace = 'test-project';
const projectDir = path.join(tmpDir, projectNamespace);
const recordDir = path.join(projectDir, 'records', 'test-flow');
const workflowDir = path.join(projectDir, 'a-docs', 'workflow');

fs.mkdirSync(recordDir, { recursive: true });
fs.mkdirSync(workflowDir, { recursive: true });

test('resolveFlowWorkflow: merges canonical node contracts into a minimal record snapshot', () => {
  fs.writeFileSync(path.join(workflowDir, 'main.yaml'), `workflow:
  name: canonical-flow
  nodes:
    - id: owner-intake
      role: Owner
      guidance:
        - Use the canonical guidance.
    - id: owner-closure
      role: Owner
  edges:
    - from: owner-intake
      to: owner-closure
`);

  fs.writeFileSync(path.join(recordDir, 'workflow.yaml'), `workflow:
  name: record-flow
  nodes:
    - id: owner-intake
      role: Owner
    - id: owner-closure
      role: Owner
  edges:
    - from: owner-intake
      to: owner-closure
`);

  const workflow = resolveFlowWorkflow(recordDir, tmpDir, projectNamespace);
  const ownerIntake = workflow.nodes.find((node) => node.id === 'owner-intake');

  assert.ok(ownerIntake, 'expected owner-intake node to exist');
  assert.deepStrictEqual(ownerIntake?.guidance, ['Use the canonical guidance.']);
  assert.strictEqual(workflow.name, 'record-flow');
  assert.deepStrictEqual(workflow.edges, [{ from: 'owner-intake', to: 'owner-closure' }]);
});

test('resolveFlowWorkflow: falls back to the record snapshot when no canonical workflow exists', () => {
  fs.rmSync(path.join(workflowDir, 'main.yaml'), { force: true });
  fs.writeFileSync(path.join(recordDir, 'workflow.yaml'), `workflow:
  name: record-only-flow
  nodes:
    - id: owner-intake
      role: Owner
      guidance:
        - Use the record guidance.
  edges: []
`);

  const workflow = resolveFlowWorkflow(recordDir, tmpDir, projectNamespace);
  const ownerIntake = workflow.nodes.find((node) => node.id === 'owner-intake');

  assert.ok(ownerIntake, 'expected owner-intake node to exist');
  assert.deepStrictEqual(ownerIntake?.guidance, ['Use the record guidance.']);
  assert.strictEqual(workflow.name, 'record-only-flow');
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

fs.rmSync(tmpDir, { recursive: true, force: true });

if (failed > 0) process.exit(1);

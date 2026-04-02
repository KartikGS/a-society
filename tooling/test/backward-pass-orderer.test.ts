import assert from 'node:assert';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  computeBackwardPassOrder,
  orderWithPromptsFromFile,
} from '../src/backward-pass-orderer.js';
import type { WorkflowNode, WorkflowEdge } from '../src/backward-pass-orderer.js';

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

console.log('\nbackward-pass-orderer');

const LINEAR_NODES: WorkflowNode[] = [
  { id: '1', role: 'Owner' },
  { id: '2', role: 'Curator' },
];
const LINEAR_EDGES: WorkflowEdge[] = [
  { from: '1', to: '2' },
];

const PARALLEL_NODES: WorkflowNode[] = [
  { id: 'start', role: 'Owner' },
  { id: 'fork', role: 'Technical Architect' },
  { id: 'track-a', role: 'Tooling Developer' },
  { id: 'track-b', role: 'Runtime Developer' },
  { id: 'join', role: 'Curator' },
];
const PARALLEL_EDGES: WorkflowEdge[] = [
  { from: 'start', to: 'fork' },
  { from: 'fork', to: 'track-a' },
  { from: 'fork', to: 'track-b' },
  { from: 'track-a', to: 'join' },
  { from: 'track-b', to: 'join' },
];

test('computeBackwardPassOrder (Linear): reverses roles and appends synthesis', () => {
  const result = computeBackwardPassOrder(LINEAR_NODES, LINEAR_EDGES, 'Curator');
  // 2D structure: [[Curator-meta], [Owner-meta], [Curator-synth]]
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[0][0].role, 'Curator');
  assert.strictEqual(result[1][0].role, 'Owner');
  assert.strictEqual(result[2][0].role, 'Curator');
  assert.strictEqual(result[2][0].stepType, 'synthesis');
});

test('computeBackwardPassOrder (Parallel): produces concurrent group for parallel tracks', () => {
  const result = computeBackwardPassOrder(PARALLEL_NODES, PARALLEL_EDGES, 'Curator');
  
  // Distances from Curator(join):
  // Join: 0
  // Track-a, Track-b: 1
  // Fork: 2
  // Start: 3
  
  // Expected role groups:
  // 1. [Curator] (meta)
  // 2. [Tooling Developer, Runtime Developer] (concurrent meta)
  // 3. [Technical Architect] (meta)
  // 4. [Owner] (meta)
  // 5. [Curator] (synthesis)
  
  assert.strictEqual(result.length, 5);
  assert.strictEqual(result[0].length, 1); // Curator
  assert.strictEqual(result[1].length, 2); // Tooling + Runtime (Concurrent)
  assert.strictEqual(result[2].length, 1); // TA
  assert.strictEqual(result[3].length, 1); // Owner
  assert.strictEqual(result[4].length, 1); // Curator (Synthesis)

  assert.ok(result[1][0].role === 'Tooling Developer' || result[1][0].role === 'Runtime Developer');
  assert.ok(result[1][1].role === 'Tooling Developer' || result[1][1].role === 'Runtime Developer');
});

test('concurrent group prompt includes sub-labeled findings note', () => {
  const result = computeBackwardPassOrder(PARALLEL_NODES, PARALLEL_EDGES, 'Curator');
  const concurrentEntry = result[1][0];
  const linearEntry = result[2][0];

  assert.ok(concurrentEntry.prompt.includes('Note: this step is concurrent'));
  assert.ok(concurrentEntry.prompt.includes('sub-labeled position (e.g., NNa-, NNb-)'));
  assert.ok(!linearEntry.prompt.includes('Note: this step is concurrent'));
});

test('orderWithPromptsFromFile: threads edges and handles complex graph', () => {
  const recordFolder = fs.mkdtempSync(path.join(tmpdir(), 'bp-order-complex-'));
  const workflowFile = path.join(recordFolder, 'workflow.md');

  fs.writeFileSync(
    workflowFile,
    `---
workflow:
  nodes:
    - id: 'a'
      role: RoleA
    - id: 'b'
      role: RoleB
    - id: 'c'
      role: RoleC
  edges:
    - from: 'a'
      to: 'b'
    - from: 'b'
      to: 'c'
---
`,
    'utf8'
  );

  try {
    const result = orderWithPromptsFromFile(recordFolder, 'RoleC');
    // Distances:
    // c: 0
    // b: 1
    // a: 2
    
    // Groups: [RoleC], [RoleB], [RoleA], [RoleC-Synth]
    assert.strictEqual(result.length, 4);
    assert.strictEqual(result[0][0].role, 'RoleC');
    assert.strictEqual(result[1][0].role, 'RoleB');
    assert.strictEqual(result[2][0].role, 'RoleA');
    assert.strictEqual(result[3][0].role, 'RoleC');
    assert.strictEqual(result[3][0].stepType, 'synthesis');
  } finally {
    fs.rmSync(recordFolder, { recursive: true, force: true });
  }
});

test('errors when no terminal nodes found (cycle or empty)', () => {
  assert.throws(() => {
    computeBackwardPassOrder([{ id: 'a', role: 'R'}], [{ from: 'a', to: 'a' }], 'R');
  }, /workflow\.nodes must produce at least one terminal node/);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);


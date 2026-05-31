import assert from 'node:assert';
import { WorkflowGraph, allIncidentEdgesCovered } from '../../src/orchestration/workflow-graph.js';

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

console.log('\nworkflow-graph');

await test('allIncidentEdgesCovered requires every incoming and outgoing handoff for the node', () => {
  const wf = new WorkflowGraph({
    nodes: [
      { id: 'owner-intake', role: 'owner' },
      { id: 'curator-work', role: 'curator' },
      { id: 'owner-close', role: 'owner' },
    ],
    edges: [
      { from: 'owner-intake', to: 'curator-work' },
      { from: 'curator-work', to: 'owner-close' },
    ],
  });

  assert.strictEqual(
    allIncidentEdgesCovered(wf, ['owner-intake=>curator-work'], 'curator-work'),
    false
  );
  assert.strictEqual(
    allIncidentEdgesCovered(wf, ['owner-intake=>curator-work', 'curator-work=>owner-close'], 'curator-work'),
    true
  );
});

await test('allIncidentEdgesCovered treats a single node as covered when no incident edges exist', () => {
  const wf = new WorkflowGraph({
    nodes: [{ id: 'owner-intake', role: 'owner' }],
    edges: [],
  });

  assert.strictEqual(allIncidentEdgesCovered(wf, [], 'owner-intake'), true);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);

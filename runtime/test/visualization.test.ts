import assert from 'node:assert';
import { renderFlowStatus } from '../src/visualization.js';
import type { FlowRun } from '../src/types.js';

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

console.log('\nvisualization');

const WF = {
  nodes: [
    { id: 'start', role: 'Owner' },
    { id: 'fork', role: 'TA' },
    { id: 't1', role: 'TD' },
    { id: 't2', role: 'RD' },
    { id: 'join', role: 'Curator' },
  ],
  edges: [
    { from: 'start', to: 'fork' },
    { from: 'fork', to: 't1' },
    { from: 'fork', to: 't2' },
    { from: 't1', to: 'join' },
    { from: 't2', to: 'join' },
  ]
};

test('renderFlowStatus: single active node, no completed', () => {
  const flowRun: FlowRun = {
    flowId: 'uuid',
    projectRoot: '.',
    projectNamespace: 'test-project',
    recordFolderPath: './records/r1',
    activeNodes: ['start'],
    completedNodes: [],
    completedNodeArtifacts: {},
    pendingNodeArtifacts: { 'start': ['p.md'] },
    status: 'running',
    stateVersion: '2'
  };

  const output = renderFlowStatus(flowRun, WF);
  assert.ok(output.includes('Active nodes:'));
  assert.ok(output.includes('[→] start (Owner)'));
  assert.ok(output.includes('Completed nodes:'));
  assert.ok(output.includes('(none)'));
  assert.ok(!output.includes('Pending joins:'));
});

test('renderFlowStatus: multiple active, multiple completed, pending join', () => {
    const flowRun: FlowRun = {
      flowId: 'uuid',
      projectRoot: '.',
      projectNamespace: 'test-project',
      recordFolderPath: './records/r1',
      activeNodes: ['t1'],
      completedNodes: ['start', 'fork', 't2'],
      completedNodeArtifacts: { 'start': 'p1.md', 'fork': '', 't2': 'p2.md' },
      pendingNodeArtifacts: { 't1': ['p3.md'] },
      status: 'running',
      stateVersion: '2'
    };
  
    const output = renderFlowStatus(flowRun, WF);
    assert.ok(output.includes('[→] t1 (TD)'));
    assert.ok(output.includes('[✓] start (Owner)'));
    assert.ok(output.includes('[✓] fork (TA)'));
    assert.ok(output.includes('[✓] t2 (RD)'));
    // Join should be pending join for t1 to finish
    assert.ok(output.includes('Pending joins:'));
    assert.ok(output.includes('[ ] join (Curator) — waiting for: t1'));
});

test('renderFlowStatus: awaiting_human status renders explicit suspended notice', () => {
  const flowRun: FlowRun = {
    flowId: 'uuid',
    projectRoot: '.',
    projectNamespace: 'test-project',
    recordFolderPath: './records/r1',
    activeNodes: ['start'],
    completedNodes: [],
    completedNodeArtifacts: {},
    pendingNodeArtifacts: { 'start': [] },
    status: 'awaiting_human',
    stateVersion: '2'
  };
  const output = renderFlowStatus(flowRun, WF);
  assert.ok(output.includes('Status: awaiting_human'), 'must show awaiting_human status');
  assert.ok(output.includes('Suspended: waiting for operator input'), 'must show suspended notice');
});

test('renderFlowStatus: multiple active nodes renders all', () => {
  const flowRun: FlowRun = {
    flowId: 'uuid',
    projectRoot: '.',
    projectNamespace: 'test-project',
    recordFolderPath: './records/r1',
    activeNodes: ['t1', 't2'],
    completedNodes: ['start', 'fork'],
    completedNodeArtifacts: { 'start': 'p1.md', 'fork': '' },
    pendingNodeArtifacts: { 't1': ['p2.md'], 't2': ['p3.md'] },
    status: 'running',
    stateVersion: '2'
  };
  const output = renderFlowStatus(flowRun, WF);
  assert.ok(output.includes('[→] t1 (TD)'));
  assert.ok(output.includes('[→] t2 (RD)'));
  assert.ok(!output.includes('Pending joins:'), 'no pending joins when both fork branches are active');
});

test('renderFlowStatus: completed flow', () => {
    const flowRun: FlowRun = {
        flowId: 'uuid',
        projectRoot: '.',
        projectNamespace: 'test-project',
        recordFolderPath: './records/r1',
        activeNodes: [],
        completedNodes: ['start', 'fork', 't1', 't2', 'join'],
        completedNodeArtifacts: { 'start': 'p1.md', 'fork': '', 't1': 'p4.md', 't2': 'p2.md', 'join': 'p5.md' },
        pendingNodeArtifacts: {},
        status: 'completed',
        stateVersion: '2'
      };
    
      const output = renderFlowStatus(flowRun, WF);
      assert.ok(output.includes('Status: completed'));
      assert.ok(output.includes('Active nodes:'));
      assert.ok(output.includes('(none)'));
      assert.ok(output.includes('[✓] join (Curator)'));
      assert.ok(!output.includes('Pending joins:'));
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);

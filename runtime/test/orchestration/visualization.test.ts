import assert from 'node:assert';
import { renderFlowStatus } from '../../src/orchestration/visualization.js';
import type { FlowRun } from '../../src/common/types.js';

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
    workspaceRoot: '.',
    projectNamespace: 'test-project',
    recordFolderPath: './records/r1',
    readyNodes: ['start'],
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedNodes: [],
    completedHandoffs: [],
    pendingNodeArtifacts: { 'start': ['p.md'] }, receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: '9'
  };

  const output = renderFlowStatus(flowRun, WF);
  assert.ok(output.includes('Ready nodes:'));
  assert.ok(output.includes('[→] start (Owner)'));
  assert.ok(output.includes('Completed nodes:'));
  assert.ok(output.includes('(none)'));
  assert.ok(!output.includes('Pending joins:'));
});

test('renderFlowStatus: multiple active, multiple completed, pending join', () => {
    const flowRun: FlowRun = {
      flowId: 'uuid',
      workspaceRoot: '.',
      projectNamespace: 'test-project',
      recordFolderPath: './records/r1',
      readyNodes: ['t1'],
      runningNodes: [],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      completedNodes: ['start', 'fork', 't2'],
      completedHandoffs: ['start=>fork', 'fork=>t1', 'fork=>t2', 't2=>join'],
      pendingNodeArtifacts: { 't1': ['p3.md'] }, receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
      status: 'running',
      stateVersion: '9'
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

test('renderFlowStatus: awaitingHumanNodes render explicit operator-input notice', () => {
  const flowRun: FlowRun = {
    flowId: 'uuid',
    workspaceRoot: '.',
    projectNamespace: 'test-project',
    recordFolderPath: './records/r1',
    readyNodes: [],
    runningNodes: [],
    awaitingHumanNodes: { start: { role: 'Owner', reason: 'prompt-human' } },
    pendingHumanInputs: {},
    completedNodes: [],
    completedHandoffs: [],
    pendingNodeArtifacts: { 'start': [] }, receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: '9'
  };
  const output = renderFlowStatus(flowRun, WF);
  assert.ok(output.includes('Status: running'), 'must show flow phase status');
  assert.ok(output.includes('Human input: waiting for operator input'), 'must show node-level waiting notice');
});

test('renderFlowStatus: multiple active nodes renders all', () => {
  const flowRun: FlowRun = {
    flowId: 'uuid',
    workspaceRoot: '.',
    projectNamespace: 'test-project',
    recordFolderPath: './records/r1',
    readyNodes: ['t1', 't2'],
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedNodes: ['start', 'fork'],
    completedHandoffs: ['start=>fork', 'fork=>t1', 'fork=>t2'],
    pendingNodeArtifacts: { 't1': ['p2.md'], 't2': ['p3.md'] }, receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: '9'
  };
  const output = renderFlowStatus(flowRun, WF);
  assert.ok(output.includes('[→] t1 (TD)'));
  assert.ok(output.includes('[→] t2 (RD)'));
  assert.ok(!output.includes('Pending joins:'), 'no pending joins when both fork branches are active');
});

test('renderFlowStatus: completed flow', () => {
    const flowRun: FlowRun = {
        flowId: 'uuid',
        workspaceRoot: '.',
        projectNamespace: 'test-project',
        recordFolderPath: './records/r1',
        readyNodes: [],
        runningNodes: [],
        awaitingHumanNodes: {},
        pendingHumanInputs: {},
        completedNodes: ['start', 'fork', 't1', 't2', 'join'],
        completedHandoffs: ['start=>fork', 'fork=>t1', 'fork=>t2', 't1=>join', 't2=>join'],
        pendingNodeArtifacts: {}, receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
        status: 'completed',
        stateVersion: '9'
      };
    
      const output = renderFlowStatus(flowRun, WF);
      assert.ok(output.includes('Status: completed'));
      assert.ok(output.includes('Ready nodes:'));
      assert.ok(output.includes('(none)'));
      assert.ok(output.includes('[✓] join (Curator)'));
      assert.ok(!output.includes('Pending joins:'));
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);

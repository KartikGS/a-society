import assert from 'node:assert';
import { CURRENT_FLOW_STATE_VERSION, type FlowRun } from '../../src/common/types.js';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { WorkflowGraph } from '../../src/orchestration/workflow-graph.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';

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

console.log('\nscheduler-ordering');

function makeFlowRun(overrides: Partial<FlowRun> = {}): FlowRun {
  return {
    flowId: 'test-flow',
    workspaceRoot: '/tmp/a-society-test',
    projectNamespace: 'test-project',
    recordFolderPath: '/tmp/a-society-test/.a-society/state/test-project/test-flow/record',
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedNodes: [],
    visitedNodeIds: [],
    completedHandoffs: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    ...overrides,
  };
}

test('received handoff runnable nodes follow graph order, not receivingHandoff insertion order', () => {
  const wf = new WorkflowGraph({
    nodes: [
      { id: 'owner-intake', role: 'owner' },
      { id: 'ta', role: 'ta' },
      { id: 'owner-gate', role: 'owner' },
    ],
    edges: [
      { from: 'owner-intake', to: 'ta' },
      { from: 'ta', to: 'owner-gate' },
    ],
  });
  const flowRun = makeFlowRun({
    receivingHandoff: {
      'ta=>owner-gate': ['later.md'],
      'ta=>owner-intake': ['earlier.md'],
    },
  });

  const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
  const runnableNodeIds = (orchestrator as any).deriveRunnableNodeIds(flowRun, wf);

  assert.deepStrictEqual(runnableNodeIds, ['owner-intake', 'owner-gate']);
});

test('awaiting node does not wake from stale forward handoff while its backward handoff is active', () => {
  const wf = new WorkflowGraph({
    nodes: [
      { id: 'a', role: 'owner' },
      { id: 'b', role: 'reviewer' },
    ],
    edges: [
      { from: 'a', to: 'b' },
    ],
  });
  const flowRun = makeFlowRun({
    receivingHandoff: {
      'a=>b': ['old-forward.md'],
      'b=>a': ['backward-correction.md'],
    },
    awaitingHandoff: ['b'],
  });

  const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
  const runnableNodeIds = (orchestrator as any).deriveRunnableNodeIds(flowRun, wf);

  assert.deepStrictEqual(runnableNodeIds, ['a']);
  assert.deepStrictEqual(flowRun.awaitingHandoff, ['b']);
});

test('awaiting node wakes from corrected forward handoff after backward handoff is consumed', () => {
  const wf = new WorkflowGraph({
    nodes: [
      { id: 'a', role: 'owner' },
      { id: 'b', role: 'reviewer' },
    ],
    edges: [
      { from: 'a', to: 'b' },
    ],
  });
  const flowRun = makeFlowRun({
    receivingHandoff: {
      'a=>b': ['corrected-forward.md'],
    },
    awaitingHandoff: ['b'],
  });

  const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
  const runnableNodeIds = (orchestrator as any).deriveRunnableNodeIds(flowRun, wf);

  assert.deepStrictEqual(runnableNodeIds, ['b']);
  assert.deepStrictEqual(flowRun.awaitingHandoff, []);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);

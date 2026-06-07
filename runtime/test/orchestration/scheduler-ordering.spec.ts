import { describe, expect, it } from 'vitest';
import { CURRENT_FLOW_STATE_VERSION, type FlowRun } from '../../src/common/types.js';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { WorkflowGraph } from '../../src/orchestration/workflow-graph.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';

function makeFlowRun(overrides: Partial<FlowRun> = {}): FlowRun {
  return {
    flowId: 'test-flow',
    workspaceRoot: '/tmp/a-society-test',
    projectNamespace: 'test-project',
    recordFolderPath: '/tmp/a-society-test/.a-society/state/test-project/test-flow/record',
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
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

function deriveRunnableNodeIds(flowRun: FlowRun, workflow: WorkflowGraph): string[] {
  const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
  return (orchestrator as unknown as {
    deriveRunnableNodeIds(flowRun: FlowRun, workflow: WorkflowGraph): string[];
  }).deriveRunnableNodeIds(flowRun, workflow);
}

describe('scheduler-ordering', () => {
  it('orders received handoff runnable nodes by graph order, not receivingHandoff insertion order', () => {
    const workflow = new WorkflowGraph({
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

    expect(deriveRunnableNodeIds(flowRun, workflow)).toEqual(['owner-intake', 'owner-gate']);
  });

  it('does not wake an awaiting node from stale forward handoff while its backward handoff is active', () => {
    const workflow = new WorkflowGraph({
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

    expect(deriveRunnableNodeIds(flowRun, workflow)).toEqual(['a']);
    expect(flowRun.awaitingHandoff).toEqual(['b']);
  });

  it('wakes an awaiting node from corrected forward handoff after backward handoff is consumed', () => {
    const workflow = new WorkflowGraph({
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

    expect(deriveRunnableNodeIds(flowRun, workflow)).toEqual(['b']);
    expect(flowRun.awaitingHandoff).toEqual([]);
  });
});

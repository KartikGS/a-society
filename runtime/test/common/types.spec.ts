import { describe, expect, it } from 'vitest';
import { CURRENT_FLOW_STATE_VERSION, type FlowRun } from '../../src/common/types.js';

describe('types', () => {
  it('FlowRun conforms to the multi-node structure', () => {
    const flowRun: FlowRun = {
      flowId: 'f1',
      workspaceRoot: '.',
      projectNamespace: 'test-project',
      recordFolderPath: './.a-society/state/test-project/f1/record',
      runningNodes: [],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      completedHandoffs: [],
      visitedNodeIds: [],
      receivingHandoff: {},
      historyHandoff: {},
      awaitingHandoff: [],
      status: 'running',
      stateVersion: CURRENT_FLOW_STATE_VERSION,
    };

    expect(flowRun.runningNodes).toHaveLength(0);
    expect(flowRun.receivingHandoff).toEqual({});
  });
});

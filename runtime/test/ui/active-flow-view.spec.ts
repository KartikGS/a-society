import { describe, expect, it } from 'vitest';
import { createActiveFlowView } from '../../ui/src/app/active-flow-view.js';
import { createFlowUiState, getAwaitingNodeIdForRole } from '../../ui/src/app/flow-ui.js';
import { AWAITING_HUMAN_REASON } from '../../shared/protocol-constants.js';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
import type { FlowRun } from '../../shared/types.js';
import { isBackwardHandoffSource } from '../../ui/src/app/handoff-source.js';
import type { OperatorEvent } from '../../shared/types.js';
import type { WorkflowDefinition as WorkflowGraph } from '../../shared/workflow-graph.js';

describe('active flow graph source styling', () => {
  it('does not mark a partially fanned-out forward source as a backward source', () => {
    const workflow: WorkflowGraph = {
      name: 'Partial fan-out',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'curator-a', role: 'curator_1' },
        { id: 'curator-b', role: 'curator_2' },
      ],
      edges: [
        { from: 'owner-intake', to: 'curator-a' },
        { from: 'owner-intake', to: 'curator-b' },
      ],
    };

    const lastHandoff: Extract<OperatorEvent, { kind: 'handoff.applied' }> = {
      kind: 'handoff.applied',
      fromNodeId: 'owner-intake',
      fromRole: 'owner',
      targets: [{ nodeId: 'curator-a', role: 'curator_1' }],
    };

    expect(isBackwardHandoffSource(workflow, lastHandoff)).toBe(false);
  });

  it('keeps the source marker for active sources whose handoff targeted a predecessor', () => {
    const workflow: WorkflowGraph = {
      name: 'Backward correction',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'review', role: 'reviewer' },
      ],
      edges: [{ from: 'owner-intake', to: 'review' }],
    };

    const lastHandoff: Extract<OperatorEvent, { kind: 'handoff.applied' }> = {
      kind: 'handoff.applied',
      fromNodeId: 'review',
      fromRole: 'reviewer',
      targets: [{ nodeId: 'owner-intake', role: 'owner' }],
    };

    expect(isBackwardHandoffSource(workflow, lastHandoff)).toBe(true);
  });
});

function closureFlow(overrides: Partial<FlowRun> = {}): FlowRun {
  return {
    flowId: 'f1',
    workspaceRoot: '.',
    projectNamespace: 'test-project',
    recordFolderPath: './.a-society/state/test-project/f1/record',
    runningNodes: [],
    awaitingHumanNodes: {
      'owner-closure': { role: 'owner', reason: AWAITING_HUMAN_REASON.CLOSURE_APPROVAL },
    },
    pendingHumanInputs: {},
    pendingHandoffApprovals: {},
    pendingClosureApproval: {
      nodeId: 'owner-closure',
      artifactPath: '.a-society/state/test-project/f1/record/closure.md',
      stagedAt: '2026-11-02T00:00:00.000Z',
    },
    completedHandoffs: [],
    visitedNodeIds: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    ...overrides,
  };
}

function viewFor(flowRun: FlowRun) {
  const ref = { projectNamespace: 'test-project', flowId: 'f1' };
  const ui = { ...createFlowUiState(flowRun), selectedRole: 'owner', hasActiveSession: true };
  return createActiveFlowView({
    tabs: [{ key: 'k', ref, title: 'f1' }],
    activeTabKey: 'k',
    flowUiByKey: { k: ui },
    selectedProject: 'test-project',
    projectFlowsByProject: {},
    socketOpen: true,
  });
}

describe('active flow closure approval', () => {
  it('derives the staged closure and its artifact for the viewed role', () => {
    const view = viewFor(closureFlow());
    expect(view.closureApprovalNodeId).toBe('owner-closure');
    expect(view.closureApproval).toEqual({
      nodeId: 'owner-closure',
      artifactPath: '.a-society/state/test-project/f1/record/closure.md',
    });
    expect(view.inputPlaceholder).toBe('Approve or decline closing the forward pass to continue.');
  });

  it('disables input while awaiting closure approval, as for handoff approval', () => {
    const view = viewFor(closureFlow());
    expect(view.inputDisabled).toBe(true);
    expect(getAwaitingNodeIdForRole(view.flowRun, 'owner')).toBeNull();
  });

  it('shows no artifact when the staged closure belongs to another node or none is named', () => {
    expect(viewFor(closureFlow({ pendingClosureApproval: undefined })).closureApproval)
      .toEqual({ nodeId: 'owner-closure', artifactPath: null });
    expect(viewFor(closureFlow({
      pendingClosureApproval: { nodeId: 'other', artifactPath: 'x.md', stagedAt: '2026-11-02T00:00:00.000Z' },
    })).closureApproval).toEqual({ nodeId: 'owner-closure', artifactPath: null });
  });

  it('has no closure approval for a plain human prompt', () => {
    const view = viewFor(closureFlow({
      awaitingHumanNodes: { 'owner-closure': { role: 'owner', reason: AWAITING_HUMAN_REASON.PROMPT_HUMAN } },
      pendingClosureApproval: undefined,
    }));
    expect(view.closureApproval).toBeNull();
    expect(view.inputDisabled).toBe(false);
  });
});

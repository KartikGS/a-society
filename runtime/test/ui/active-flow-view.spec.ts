import { describe, expect, it } from 'vitest';
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

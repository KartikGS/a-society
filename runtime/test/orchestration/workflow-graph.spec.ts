import { describe, expect, it } from 'vitest';
import { WorkflowGraph, allIncidentEdgesCovered } from '../../shared/workflow-graph.js';

describe('workflow-graph', () => {
  it('requires every incoming and outgoing handoff for the node to be covered', () => {
    const workflow = new WorkflowGraph({
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

    expect(allIncidentEdgesCovered(workflow, ['owner-intake=>curator-work'], 'curator-work')).toBe(false);
    expect(allIncidentEdgesCovered(
      workflow,
      ['owner-intake=>curator-work', 'curator-work=>owner-close'],
      'curator-work'
    )).toBe(true);
  });

  it('treats a single node as covered when no incident edges exist', () => {
    const workflow = new WorkflowGraph({
      nodes: [{ id: 'owner-intake', role: 'owner' }],
      edges: [],
    });

    expect(allIncidentEdgesCovered(workflow, [], 'owner-intake')).toBe(true);
  });
});

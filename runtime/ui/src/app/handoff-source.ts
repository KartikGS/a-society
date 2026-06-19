import type { OperatorEvent } from '../../../shared/types.js';
import type { WorkflowDefinition as WorkflowGraph } from '../../../shared/workflow-graph.js';

type HandoffAppliedEvent = Extract<OperatorEvent, { kind: 'handoff.applied' }>;

export function isBackwardHandoffSource(
  workflow: WorkflowGraph | null,
  lastHandoff: HandoffAppliedEvent | null
): boolean {
  if (!workflow || !lastHandoff) return false;

  return lastHandoff.targets.some((target) =>
    workflow.edges.some((edge) => edge.from === target.nodeId && edge.to === lastHandoff.fromNodeId)
  );
}

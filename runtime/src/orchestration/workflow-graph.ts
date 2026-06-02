export interface WfNode {
  id: string;
  role: string;
  step_type?: 'meta-analysis' | 'feedback';
  [key: string]: unknown;
}

export interface WfEdge {
  from: string;
  to: string;
}

export interface HandoffKeyParts {
  from: string;
  to: string;
  fromNodeId: string;
  targetId: string;
}

export class WorkflowGraph {
  readonly nodes: WfNode[];
  readonly edges: WfEdge[];

  constructor(doc: any) {
    this.nodes = Array.isArray(doc?.nodes) ? doc.nodes : [];
    this.edges = Array.isArray(doc?.edges) ? doc.edges : [];
  }

  findNodeById(nodeId: string): WfNode {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Node '${nodeId}' not found in workflow.`);
    return node;
  }

  findNodeByIdOrNull(nodeId: string): WfNode | null {
    return this.nodes.find(n => n.id === nodeId) ?? null;
  }

  getOutgoingEdges(nodeId: string): WfEdge[] {
    return this.edges.filter(e => e.from === nodeId);
  }

  getIncomingEdges(nodeId: string): WfEdge[] {
    return this.edges.filter(e => e.to === nodeId);
  }

  edgeKey(from: string, to: string): string {
    return `${from}=>${to}`;
  }
}

export function parseHandoffKey(key: string): HandoffKeyParts | null {
  const [from, to, extra] = key.split('=>');
  if (!from || !to || extra !== undefined) return null;
  return {
    from,
    to,
    fromNodeId: from,
    targetId: to,
  };
}

export function getOutstandingInboundSources(wf: WorkflowGraph, completedHandoffs: string[], nodeId: string): string[] {
  return wf.getIncomingEdges(nodeId)
    .filter(e => !completedHandoffs.includes(wf.edgeKey(e.from, nodeId)))
    .map(e => e.from);
}

export function getCompletedInboundSources(wf: WorkflowGraph, completedHandoffs: string[], nodeId: string): string[] {
  return wf.getIncomingEdges(nodeId)
    .filter(e => completedHandoffs.includes(wf.edgeKey(e.from, nodeId)))
    .map(e => e.from);
}

export function hasPendingOutgoing(wf: WorkflowGraph, completedHandoffs: string[], nodeId: string): boolean {
  return wf.getOutgoingEdges(nodeId).some(e => !completedHandoffs.includes(wf.edgeKey(nodeId, e.to)));
}

export function allIncidentEdgesCovered(wf: WorkflowGraph, completedHandoffs: string[], nodeId: string): boolean {
  const completed = new Set(completedHandoffs);
  return [...wf.getIncomingEdges(nodeId), ...wf.getOutgoingEdges(nodeId)]
    .every(e => completed.has(wf.edgeKey(e.from, e.to)));
}

export function allEdgesCovered(wf: WorkflowGraph, completedHandoffs: string[]): boolean {
  return wf.edges.every(e => completedHandoffs.includes(wf.edgeKey(e.from, e.to)));
}

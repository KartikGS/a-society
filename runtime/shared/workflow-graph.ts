export interface WorkflowNode {
  id: string;
  role: string;
  required_readings?: string[];
  work?: string[];
  /** Runtime-generated improvement-graph metadata; not valid in canonical workflow.yaml. */
  step_type?: 'meta-analysis' | 'feedback';
  /** When true, the runtime injects a human-collaboration directive and gates this node's forward handoff on operator approval. */
  'human-colab'?: boolean;
  /** When true, the node only becomes runnable once every inbound edge handoff is complete (AND-join). */
  'await-all-inputs'?: boolean;
}

type CanonicalWorkflowNodeKey = Exclude<keyof WorkflowNode, 'step_type'>;
type WorkflowNodeValueKind = 'required-string' | 'optional-string-array' | 'optional-boolean';

interface WorkflowNodeFieldDefinition {
  key: CanonicalWorkflowNodeKey;
  valueKind: WorkflowNodeValueKind;
}

export const WORKFLOW_NODE_FIELD_DEFINITIONS = [
  { key: 'id', valueKind: 'required-string' },
  { key: 'role', valueKind: 'required-string' },
  { key: 'required_readings', valueKind: 'optional-string-array' },
  { key: 'work', valueKind: 'optional-string-array' },
  { key: 'human-colab', valueKind: 'optional-boolean' },
  { key: 'await-all-inputs', valueKind: 'optional-boolean' },
] as const satisfies readonly WorkflowNodeFieldDefinition[];

type WorkflowNodeField = typeof WORKFLOW_NODE_FIELD_DEFINITIONS[number];
type WorkflowNodeBooleanField = Extract<WorkflowNodeField, { valueKind: 'optional-boolean' }>;
type WorkflowNodeStringArrayField = Extract<WorkflowNodeField, { valueKind: 'optional-string-array' }>;

export interface WorkflowEdge {
  from: string;
  to: string;
}

export type WorkflowNodeKey = WorkflowNodeField['key'];

export type WorkflowNodeBooleanKey = WorkflowNodeBooleanField['key'];
export type WorkflowNodeStringArrayKey = WorkflowNodeStringArrayField['key'];

export const WORKFLOW_NODE_KEYS = WORKFLOW_NODE_FIELD_DEFINITIONS.map((field) => field.key) as readonly WorkflowNodeKey[];
export const WORKFLOW_NODE_BOOLEAN_KEYS = WORKFLOW_NODE_FIELD_DEFINITIONS
  .filter((field): field is WorkflowNodeBooleanField => field.valueKind === 'optional-boolean')
  .map((field) => field.key) as readonly WorkflowNodeBooleanKey[];
export const WORKFLOW_NODE_STRING_ARRAY_KEYS = WORKFLOW_NODE_FIELD_DEFINITIONS
  .filter((field): field is WorkflowNodeStringArrayField => field.valueKind === 'optional-string-array')
  .map((field) => field.key) as readonly WorkflowNodeStringArrayKey[];

export const WORKFLOW_EDGE_KEYS = [
  'from',
  'to',
] as const satisfies readonly (keyof WorkflowEdge)[];

export type WorkflowEdgeKey = typeof WORKFLOW_EDGE_KEYS[number];

export interface WorkflowDefinition {
  name?: string;
  summary?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowDocument {
  workflow: WorkflowDefinition;
}

export type WfNode = WorkflowNode;
export type WfEdge = WorkflowEdge;

export interface HandoffKeyParts {
  from: string;
  to: string;
  fromNodeId: string;
  targetId: string;
}

export class WorkflowGraph {
  readonly nodes: WorkflowNode[];
  readonly edges: WorkflowEdge[];

  constructor(doc: Partial<WorkflowDefinition> | null | undefined) {
    this.nodes = Array.isArray(doc?.nodes) ? doc.nodes : [];
    this.edges = Array.isArray(doc?.edges) ? doc.edges : [];
  }

  findNodeById(nodeId: string): WorkflowNode {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Node '${nodeId}' not found in workflow.`);
    return node;
  }

  findNodeByIdOrNull(nodeId: string): WorkflowNode | null {
    return this.nodes.find(n => n.id === nodeId) ?? null;
  }

  getOutgoingEdges(nodeId: string): WorkflowEdge[] {
    return this.edges.filter(e => e.from === nodeId);
  }

  getIncomingEdges(nodeId: string): WorkflowEdge[] {
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

export interface ProjectSummary {
  displayName: string;
  folderName: string;
}

export interface ProjectDiscovery {
  withADocs: ProjectSummary[];
  withoutADocs: ProjectSummary[];
}

export interface FlowRun {
  flowId: string;
  workspaceRoot: string;
  projectNamespace: string;
  recordFolderPath: string;
  recordName?: string;
  recordSummary?: string;
  activeNodes: string[];
  completedNodes: string[];
  visitedNodeIds?: string[];
  completedEdgeArtifacts: Record<string, string>;
  pendingNodeArtifacts: Record<string, string[]>;
  status: 'initialized' | 'running' | 'awaiting_human' | 'awaiting_retry' | 'completed' | 'failed';
  stateVersion: string;
}

export type OperatorEvent =
  | { kind: 'flow.resumed'; flowId: string; activeNodeCount: number }
  | { kind: 'role.active'; nodeId: string; role: string; artifactCount: number; artifactBasename?: string }
  | { kind: 'activity.tool_call'; toolName: string; path?: string; command?: string }
  | { kind: 'handoff.applied'; fromNodeId: string; fromRole: string; targets: Array<{ nodeId: string; role: string; artifactBasename?: string }> }
  | { kind: 'repair.requested'; scope: 'node' | 'improvement'; code: string; summary: string }
  | { kind: 'human.awaiting_input'; reason: 'prompt-human' | 'autonomous-abort' }
  | { kind: 'human.resumed'; nodeId: string; role: string }
  | { kind: 'parallel.active_set'; activeNodes: Array<{ nodeId: string; role: string }> }
  | { kind: 'parallel.join_waiting'; nodeId: string; role: string; waitingFor: string[] }
  | { kind: 'usage.turn_summary'; availability: 'full' | 'input-unavailable' | 'output-unavailable' | 'both-unavailable'; inputTokens?: number; outputTokens?: number }
  | { kind: 'flow.forward_pass_closed'; recordFolderPath: string; artifactBasename: string }
  | { kind: 'flow.improvement_prompt' }
  | { kind: 'flow.completed' };

export type ClientMessage =
  | { type: 'start_initialized_flow'; projectNamespace: string }
  | { type: 'start_takeover_initialization'; projectNamespace: string }
  | { type: 'start_greenfield_initialization'; projectName: string }
  | { type: 'human_input'; text: string };

export type ServerMessage =
  | { type: 'init'; projects: ProjectDiscovery; flowRun: FlowRun | null }
  | { type: 'operator_event'; event: OperatorEvent }
  | { type: 'wait_start'; provider: string; model: string }
  | { type: 'wait_stop' }
  | { type: 'output_text'; text: string }
  | { type: 'flow_state'; flowRun: FlowRun; backwardActive: string[] }
  | { type: 'error'; message: string }
  | { type: 'flow_complete' };

export interface WorkflowGraph {
  nodes: Array<{ id: string; role: string }>;
  edges: Array<{ from: string; to: string }>;
}

export interface TranscriptPayload {
  nodeId: string;
  role: string;
  transcript: unknown[];
}

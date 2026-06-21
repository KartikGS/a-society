import {
  CONSENT_MODE,
  CONSENT_MODES,
} from './protocol-constants.js';
import type {
  ProtocolAwaitingHumanReason,
  ProtocolConsentMode,
  ProtocolConsentResponseDecision,
  FeedbackConsentStatus,
  ProtocolImprovementChoiceMode,
} from './protocol-constants.js';
import type {
  ProviderReasoningDisplay,
} from './model-reasoning.js';

export type FlowStatus =
  | 'running'
  | 'awaiting_improvement_choice'
  | 'awaiting_feedback_consent'
  | 'completed';

export const CURRENT_FLOW_STATE_VERSION = '11';

export type ConsentMode = ProtocolConsentMode;
export type ConsentRequestKind = 'file-write' | 'bash-command' | 'mcp-tool';
export type ConsentResponseDecision = ProtocolConsentResponseDecision;
export type AwaitingHumanReason = ProtocolAwaitingHumanReason;

export type ConsentRequest =
  | { kind: 'file-write'; toolName: string; path: string; nodeId: string; role: string }
  | { kind: 'bash-command'; toolName: 'run_command'; command: string; nodeId: string; role: string }
  | {
      kind: 'mcp-tool';
      toolName: string;
      serverName: string;
      toolDisplayName: string;
      argsPreview: string;
      nodeId: string;
      role: string;
    };

export interface ConsentCheckRequest {
  toolName: string;
  input?: Record<string, unknown>;
  nodeId: string;
  role: string;
}

export const CONSENT_CHECK_RESULT = {
  PROCEED: 'proceed',
  DENY: 'deny',
} as const;

export type ConsentCheckResult = typeof CONSENT_CHECK_RESULT[keyof typeof CONSENT_CHECK_RESULT];

export interface ConsentState {
  mode: ConsentMode;
  bash: {
    allowedCommands: Record<string, { command: string; grantedAt: string }>;
  };
  mcp: {
    allowedTools: Record<string, { toolName: string; grantedAt: string }>;
  };
}

export type FeedbackContextKind = 'standard' | 'initialization' | 'update';

export interface FeedbackContext {
  kind: FeedbackContextKind;
  initializationMode?: 'takeover' | 'greenfield';
  updateFromVersion?: string;
  updateToVersion?: string;
}

export function defaultConsentState(): ConsentState {
  return {
    mode: CONSENT_MODE.NO_ACCESS,
    bash: {
      allowedCommands: {},
    },
    mcp: {
      allowedTools: {},
    },
  };
}

function isConsentMode(value: unknown): value is ConsentMode {
  return typeof value === 'string' && (CONSENT_MODES as readonly string[]).includes(value);
}

export function normalizeConsentState(raw: unknown): ConsentState {
  const fallback = defaultConsentState();
  if (!raw || typeof raw !== 'object') return fallback;

  const source = raw as Record<string, any>;
  const mode: ConsentMode = isConsentMode(source.mode) ? source.mode : fallback.mode;

  const allowedCommandsSource = source.bash?.allowedCommands;
  const allowedCommands: Record<string, { command: string; grantedAt: string }> = {};
  if (allowedCommandsSource && typeof allowedCommandsSource === 'object') {
    for (const [key, value] of Object.entries(allowedCommandsSource as Record<string, any>)) {
      if (!value || typeof value !== 'object' || typeof value.command !== 'string') continue;
      allowedCommands[key] = {
        command: value.command,
        grantedAt: typeof value.grantedAt === 'string' ? value.grantedAt : new Date(0).toISOString(),
      };
    }
  }

  const allowedToolsSource = source.mcp?.allowedTools;
  const allowedTools: Record<string, { toolName: string; grantedAt: string }> = {};
  if (allowedToolsSource && typeof allowedToolsSource === 'object') {
    for (const [key, value] of Object.entries(allowedToolsSource as Record<string, any>)) {
      if (!value || typeof value !== 'object' || typeof value.toolName !== 'string') continue;
      allowedTools[key] = {
        toolName: value.toolName,
        grantedAt: typeof value.grantedAt === 'string' ? value.grantedAt : new Date(0).toISOString(),
      };
    }
  }

  return {
    mode,
    bash: { allowedCommands },
    mcp: { allowedTools },
  };
}

export interface HandoffTarget {
  target_node_id: string;
  artifact_path: string | null;
}

export type HandoffResult =
  | { kind: 'targets'; targets: HandoffTarget[] }
  | { kind: 'forward-pass-closed' }
  | { kind: 'meta-analysis-complete'; findingsPath: string }
  | { kind: 'backward-pass-complete'; artifactPath: string }
  | { kind: 'awaiting_human' }
  | { kind: 'await-handoff' };

export interface ImprovementPhaseState {
  status: 'awaiting_choice' | 'running' | 'awaiting_feedback_consent' | 'completed' | 'skipped';
  mode?: ProtocolImprovementChoiceMode;
  completedRoles: string[];
  runningRoles: string[];
  awaitingHumanRoles?: Record<string, { reason: AwaitingHumanReason }>;
  pendingHumanInputs?: Record<string, { text: string; receivedAt: string }>;
  findingsProduced: Record<string, string>;
  improvementWorkflowPath?: string;
  feedbackArtifactPath?: string;
  feedbackConsent?: FeedbackConsentStatus;
  singleRole?: boolean;
}

export interface FlowRun {
  flowId: string;
  workspaceRoot: string;
  projectNamespace: string;
  recordFolderPath: string;
  recordName?: string;
  recordSummary?: string;
  runningNodes: string[];
  awaitingHumanNodes: Record<string, { role: string; reason: AwaitingHumanReason }>;
  pendingHumanInputs: Record<string, { text: string; receivedAt: string }>;
  /**
   * Forward handoff(s) staged by a `human-colab` node, held until the operator
   * approves or declines. Keyed by the emitting node id. Unlike pendingHumanInputs
   * (which feeds text back into a re-run), this carries the already-decided routing
   * so an approval commits without re-running the role.
   */
  pendingHandoffApprovals: Record<string, HandoffTarget[]>;
  visitedNodeIds: string[];
  completedHandoffs: string[];
  receivingHandoff: Record<string, string[]>;
  historyHandoff: Record<string, string[]>;
  awaitingHandoff: string[];
  status: FlowStatus;
  stateVersion: string;
  improvementPhase?: ImprovementPhaseState;
  feedbackContext?: FeedbackContext;
  consentState?: ConsentState;
}

export interface FlowRef {
  projectNamespace: string;
  flowId: string;
}

export interface FlowSummary extends FlowRef {
  status: FlowStatus;
  recordFolderPath: string;
  openable: boolean;
  stateVersion: string;
  recordName?: string;
  recordSummary?: string;
  updatedAt?: string;
}

export type OperatorEvent =
  | { kind: 'role.active'; nodeId: string; role: string }
  | { kind: 'role.resumed'; nodeId: string; role: string; reason: 'interrupted-turn' }
  | { kind: 'activity.tool_call'; role: string; toolName: string; path?: string; command?: string }
  | { kind: 'activity.tool_result'; role: string; toolName: string; isError: boolean }
  | { kind: 'handoff.applied'; fromNodeId: string; fromRole: string; targets: Array<{ nodeId: string; role: string }> }
  | { kind: 'repair.requested'; scope: 'node' | 'improvement'; code: string; summary: string; role?: string; nodeId?: string }
  | { kind: 'human.awaiting_input'; nodeId: string; role: string; reason: AwaitingHumanReason }
  | { kind: 'role.configured'; nodeId: string; role: string; modelDisplayName?: string; skillNames?: string[]; mcpServerNames?: string[] }
  | { kind: 'role.auto_selection_started'; nodeId: string; role: string }
  | { kind: 'role.auto_configured'; nodeId: string; role: string }
  | { kind: 'role.auto_selection_fell_back'; nodeId: string; role: string; dimensions: Array<'model' | 'skills' | 'mcp'>; reason: string }
  | { kind: 'human.resumed'; nodeId: string; role: string }
  | { kind: 'usage.turn_summary'; role?: string; contextUsage?: number }
  | { kind: 'session.compaction_started'; role: string; trigger: 'manual' | 'auto' }
  | { kind: 'session.compaction_failed'; role: string; trigger: 'manual' | 'auto'; reason: string }
  | { kind: 'session.compacted'; role: string; nodeId: string; trigger: 'manual' | 'auto'; archiveId: string }
  | { kind: 'mcp.server_unavailable'; role: string; nodeId: string; serverName: string; reason: string }
  | { kind: 'mcp.tool_unavailable'; role: string; nodeId: string; serverName: string; toolName: string; reason: string }
  | { kind: 'provider.reasoning_trace'; role: string; label: string; text: string; display: Exclude<ProviderReasoningDisplay, 'hidden'> }
  | { kind: 'flow.forward_pass_closed' }
  | { kind: 'flow.completed' }
  | { kind: 'consent.requested'; request: ConsentRequest }
  | { kind: 'consent.resolved'; request: ConsentRequest; decision: ConsentResponseDecision }
  | { kind: 'consent.mode_changed'; mode: ConsentMode };

export type OperatorFeedMessage =
  | { type: 'operator_event'; event: OperatorEvent }
  | { type: 'output_text'; role: string; text: string }
  | { type: 'input_text'; role?: string; text: string }
  | { type: 'error'; message: string };

export type FeedItemType =
  | 'assistant'
  | 'user'
  | 'event'
  | 'error'
  | 'handoff'
  | 'resume'
  | 'repair'
  | 'reasoning'
  | 'tool'
  | 'tool-success'
  | 'tool-error'
  | 'activation';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  label: string;
  text: string;
  reasoningDisplay?: Exclude<ProviderReasoningDisplay, 'hidden'>;
}

export type { PromptCacheTtl } from './prompt-cache.js';
export { normalizePromptCacheTtl } from './prompt-cache.js';

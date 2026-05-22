import type {
  ConsentMode,
  ConsentResponseDecision,
  FeedItem,
  FlowRef,
  FlowRun,
  FlowSummary,
  OperatorFeedMessage,
} from '../common/types.js';
import type { ImprovementMode } from '../improvement/improvement.js';
import type { ProjectDiscovery } from '../projects/project-discovery.js';
import type { RuntimeServerMessage } from './ws-operator-sink.js';

export type ClientMessage =
  | { type: 'open_flow'; flowRef: FlowRef }
  | { type: 'resume_flow'; flowRef: FlowRef }
  | { type: 'start_initialized_flow'; projectNamespace: string }
  | { type: 'start_takeover_initialization'; projectNamespace: string }
  | { type: 'start_greenfield_initialization'; projectName: string }
  | { type: 'stop_active_turn'; flowRef: FlowRef; nodeId?: string; role?: string }
  | { type: 'compact_context'; flowRef: FlowRef; role: string }
  | { type: 'human_input'; flowRef: FlowRef; text: string; nodeId?: string; role?: string }
  | { type: 'improvement_choice'; flowRef: FlowRef; mode: ImprovementMode | 'none' }
  | { type: 'feedback_consent_choice'; flowRef: FlowRef; decision: 'granted' | 'denied' }
  | { type: 'consent_response'; flowRef: FlowRef; decision: ConsentResponseDecision; role: string }
  | { type: 'consent_mode'; flowRef: FlowRef; mode: ConsentMode };

export type FlowStateMessage = {
  type: 'flow_state';
  flowRef: FlowRef;
  flowRun: FlowRun;
  backwardActive: string[];
  hasActiveSession: boolean;
  contextUsageByRole: Record<string, number>;
};

export type HistoricalMessage = OperatorFeedMessage;

export type FlowScopedHistoricalMessage = HistoricalMessage & { flowRef: FlowRef };

export type FeedReplayMessage = { type: 'feed_replay'; flowRef: FlowRef; roleFeeds: Record<string, FeedItem[]> };

export type ServerMessage =
  | { type: 'init'; projects: ProjectDiscovery }
  | { type: 'flow_summaries'; projectNamespace: string; flows: FlowSummary[] }
  | FeedReplayMessage
  | FlowStateMessage
  | FlowScopedHistoricalMessage
  | (RuntimeServerMessage & { flowRef: FlowRef });

export function hasFlowRef(value: unknown): value is FlowRef {
  return (
    Boolean(value) &&
    typeof (value as FlowRef).projectNamespace === 'string' &&
    typeof (value as FlowRef).flowId === 'string'
  );
}

export function parseClientMessage(raw: string): ClientMessage | null {
  try {
    const parsed: any = JSON.parse(raw);
    if (parsed?.type === 'open_flow' && hasFlowRef(parsed.flowRef)) {
      return parsed;
    }
    if (parsed?.type === 'resume_flow' && hasFlowRef(parsed.flowRef)) {
      return parsed;
    }
    if (parsed?.type === 'start_initialized_flow' && typeof parsed.projectNamespace === 'string') {
      return parsed;
    }
    if (parsed?.type === 'start_takeover_initialization' && typeof parsed.projectNamespace === 'string') {
      return parsed;
    }
    if (parsed?.type === 'start_greenfield_initialization' && typeof parsed.projectName === 'string') {
      return parsed;
    }
    if (parsed?.type === 'stop_active_turn' && hasFlowRef(parsed.flowRef)) {
      return parsed;
    }
    if (parsed?.type === 'compact_context' && hasFlowRef(parsed.flowRef) && typeof parsed.role === 'string') {
      return parsed;
    }
    if (parsed?.type === 'human_input' && hasFlowRef(parsed.flowRef) && typeof parsed.text === 'string') {
      return parsed;
    }
    if (
      parsed?.type === 'improvement_choice' &&
      hasFlowRef(parsed.flowRef) &&
      (parsed.mode === 'graph-based' || parsed.mode === 'parallel' || parsed.mode === 'none')
    ) {
      return parsed;
    }
    if (
      parsed?.type === 'feedback_consent_choice' &&
      hasFlowRef(parsed.flowRef) &&
      (parsed.decision === 'granted' || parsed.decision === 'denied')
    ) {
      return parsed;
    }
    if (
      parsed?.type === 'consent_response' &&
      hasFlowRef(parsed.flowRef) &&
      (
        parsed.decision === 'allow_once' ||
        parsed.decision === 'allow_flow' ||
        parsed.decision === 'deny' ||
        parsed.decision === 'granted' ||
        parsed.decision === 'denied'
      ) &&
      typeof parsed.role === 'string'
    ) {
      if (parsed.decision === 'granted') parsed.decision = 'allow_once';
      if (parsed.decision === 'denied') parsed.decision = 'deny';
      return parsed;
    }
    if (
      parsed?.type === 'consent_mode' &&
      hasFlowRef(parsed.flowRef) &&
      (
        parsed.mode === 'no-access' ||
        parsed.mode === 'partial-access' ||
        parsed.mode === 'full-access' ||
        parsed.mode === 'ask'
      )
    ) {
      if (parsed.mode === 'ask') parsed.mode = 'no-access';
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

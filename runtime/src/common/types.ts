export {
  CONSENT_CHECK_RESULT,
  CURRENT_FLOW_STATE_VERSION,
  defaultConsentState,
  normalizeConsentState,
  normalizePromptCacheTtl,
} from '../../shared/types.js';
export type {
  AwaitingHumanReason,
  ConsentCheckRequest,
  ConsentCheckResult,
  ConsentMode,
  ConsentRequest,
  ConsentRequestKind,
  ConsentResponseDecision,
  ConsentState,
  FeedbackContext,
  FeedbackContextKind,
  FeedItem,
  FeedItemType,
  FlowRef,
  FlowRun,
  FlowStatus,
  FlowSummary,
  HandoffResult,
  HandoffTarget,
  ImprovementPhaseState,
  OperatorEvent,
  OperatorFeedMessage,
  PromptCacheTtl,
} from '../../shared/types.js';
import type {
  AwaitingHumanReason,
  ConsentCheckRequest,
  ConsentCheckResult,
  ConsentResponseDecision,
  ConsentMode,
  ConsentRequest,
  ConsentState,
  HandoffResult,
  OperatorEvent,
} from '../../shared/types.js';
import type {
  ProviderReasoningReplayPolicy,
} from '../../shared/model-reasoning.js';

export interface ConsentGate {
  check(request: ConsentCheckRequest, signal?: AbortSignal): Promise<ConsentCheckResult>;
  respond(decision: ConsentResponseDecision, role: string): void;
  setMode(mode: ConsentMode): void;
  getState(): ConsentState;
  getInFlightRequests(): ConsentRequest[];
}

export interface RoleSession {
  roleName: string;
  logicalSessionId: string;
  transcriptHistory: unknown[];
  currentNodeContext?: {
    nodeId: string;
    exchanges: RuntimeMessageParam[];
  };
  compactionArchives?: Array<{
    id: string;
    trigger: 'manual' | 'auto';
    nodeId: string;
    compactedAt: string;
    archivedTranscriptHistory: RuntimeMessageParam[];
    replacementMessage: RuntimeMessageParam;
  }>;
  isActive: boolean;
  currentNodeId?: string;
  systemPrompt?: string;
  latestContextUsage?: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  parseError?: string;
}

export type ProviderReasoningBlock =
  | { provider: 'anthropic'; type: 'thinking'; thinking: string; signature: string }
  | {
      provider: 'openai-compatible';
      type: 'message-field';
      field: string;
      content: string;
      replay: ProviderReasoningReplayPolicy;
    };

export type RuntimeMessageParam =
  | { role: 'user';                content: string }
  | { role: 'assistant';           content: string }
  | { role: 'assistant_tool_calls'; calls: ToolCall[]; text?: string; providerReasoning?: ProviderReasoningBlock[] }
  | { role: 'tool_result';         callId: string; toolName: string; content: string; isError: boolean };

export interface RoleTurnResult {
  handoff: HandoffResult;
  contextUsage?: number;
  awaitingHumanReason?: AwaitingHumanReason;
}

export interface OperatorRenderSink {
  emit(event: OperatorEvent): void;
  requestSent(role: string, provider: string, model: string): void;
  receivingResponse(role: string): void;
  responseEnd(role: string): void;
  sendError(message: string): void;
}

export interface TurnOptions {
  signal?: AbortSignal;
  outputStream?: NodeJS.WritableStream;
  operatorRenderer?: OperatorRenderSink;
  consentGate?: ConsentGate;
  roleInstanceId?: string;
  nodeId?: string;
  cacheTurn?: boolean;
  onConversationMessages?: (messages: RuntimeMessageParam[]) => void | Promise<void>;
  onAssistantTextDelta?: (text: string) => void;
}

export interface GatewayTurnResult {
  text: string;
  contextUsage?: number;
  finishReason?: string;
}

export type ProviderTurnResult =
  | { type: 'text';       text: string;                                                   contextUsage?: number; finishReason?: string }
  | { type: 'tool_calls'; calls: ToolCall[]; continuationMessages: RuntimeMessageParam[]; contextUsage?: number; finishReason?: string };

export interface LLMProvider {
  executeTurn(
    systemPrompt: string,
    messages: RuntimeMessageParam[],
    tools?: ToolDefinition[],
    options?: TurnOptions
  ): Promise<ProviderTurnResult>;
}

export class LLMGatewayError extends Error {
  constructor(
    public readonly type: 'AUTH_ERROR' | 'RATE_LIMIT' | 'PROVIDER_MALFORMED' | 'UNKNOWN' | 'ABORTED' | 'CONSENT_DENIED',
    message: string,
    public readonly partialText?: string
  ) {
    super(message);
    this.name = 'LLMGatewayError';
  }
}

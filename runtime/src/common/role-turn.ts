import crypto from 'node:crypto';
import type { FlowRef, FlowRun, RoleTurnResult, HandoffResult, OperatorRenderSink, RuntimeMessageParam, ConsentGate, RoleSession } from './types.js';
import { LLMGateway, LLMGatewayError } from '../providers/llm.js';
import { HandoffInterpreter, HandoffParseError } from '../orchestration/handoff.js';
import { autoCompactRoleSessionBeforeTurn } from '../orchestration/compaction.js';
import { TelemetryManager } from '../observability/observability.js';
import { logger } from '../observability/logger.js';
import { getActiveModelWithKey, type ModelConfigWithKey } from '../settings/settings-store.js';
import { AWAITING_HUMAN_REASON } from './protocol-constants.js';
import type { McpManager } from '../providers/mcp/manager.js';

function extractFileRefs(content: string): string[] {
  const refs: string[] = [];
  const pattern = /\[FILE: ([^\]]+)\]/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    refs.push(match[1]);
  }
  return refs;
}

function hitOutputLimit(finishReason: string | undefined): finishReason is 'length' | 'max_tokens' {
  return finishReason === 'length' || finishReason === 'max_tokens';
}

function applyOutputLimitRepair(error: HandoffParseError, finishReason: string): void {
  error.details.operatorSummary = 'Model output limit reached before valid handoff';
  error.details.modelRepairMessage = [
    `Error: Your previous response hit the model output limit (${finishReason}) before producing a valid tool call or handoff.`,
    'Continue from the interrupted point in smaller chunks.',
    'Use tools for concrete file writes instead of inlining large file contents in assistant text.',
    'Perform one concrete tool action at a time, wait for each tool result, and only end with a valid fenced `handoff` block when the task is actually complete.'
  ].join(' ');
  error.message = error.details.operatorSummary;
}

export function emitUsage(renderer: OperatorRenderSink | undefined, contextUsage: number | undefined, role?: string): void {
  if (!renderer) return;
  renderer.emit({ kind: 'usage.turn_summary', role, contextUsage });
}

export function recordRoleTurnUsage(
  session: RoleSession,
  renderer: OperatorRenderSink | undefined,
  role: string,
  contextUsage: number | undefined,
): void {
  if (contextUsage !== undefined) {
    session.latestContextUsage = contextUsage;
  }
  emitUsage(renderer, contextUsage, role);
}

type SessionTurnResult = {
  handoff?: HandoffResult;
  contextUsage?: number;
  abort?: true;
  consentDenied?: true;
  error?: true;
  errorMessage?: string;
};

async function executeSessionTurn(
  llm: LLMGateway,
  systemPrompt: string,
  history: RuntimeMessageParam[],
  projectNamespace: string,
  roleInstanceId: string,
  sessionId: string,
  turnIndex: number,
  roleOutputStream: NodeJS.WritableStream | undefined,
  externalSignal: AbortSignal | undefined,
  operatorRenderer: OperatorRenderSink | undefined,
  consentGate: ConsentGate | undefined,
  nodeId: string | undefined,
  onConversationMessages: ((messages: RuntimeMessageParam[]) => void | Promise<void>) | undefined,
  onAssistantTextDelta: ((text: string) => void) | undefined
): Promise<SessionTurnResult> {
  const meter = TelemetryManager.getMeter();
  const startTime = Date.now();

  meter.createCounter('a_society.session.turn.started').add(1, {
    project_namespace: projectNamespace,
    role_name: roleInstanceId
  });

  logger.info('session.turn.started', {
    project_namespace: projectNamespace,
    role_name: roleInstanceId,
    session_id: sessionId,
    turn_index: turnIndex,
  });

  try {
    if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
      const latestUserMessage = history[history.length - 1];
      if (latestUserMessage?.role === 'user') {
        logger.debug('session.user_turn', {
          project_namespace: projectNamespace,
          role_name: roleInstanceId,
          session_id: sessionId,
          content: latestUserMessage.content.slice(0, 2000),
        });
      }
    }

    const result = await llm.executeTurn(systemPrompt, history, {
      signal: externalSignal,
      outputStream: roleOutputStream,
      operatorRenderer,
      consentGate,
      roleInstanceId,
      nodeId,
      onConversationMessages,
      onAssistantTextDelta,
    });

    if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
      logger.debug('session.assistant_turn', {
        project_namespace: projectNamespace,
        role_name: roleInstanceId,
        session_id: sessionId,
        content: result.text.slice(0, 2000),
      });
    }

    let parseResult: HandoffResult;
    try {
      parseResult = HandoffInterpreter.parse(result.text);
    } catch (error: any) {
      if (error instanceof HandoffParseError) {
        error.contextUsage = result.contextUsage;
        if (hitOutputLimit(result.finishReason)) {
          applyOutputLimitRepair(error, result.finishReason);
        }
      }
      throw error;
    }

    logger.info('session.turn.completed', {
      project_namespace: projectNamespace,
      role_name: roleInstanceId,
      session_id: sessionId,
      turn_index: turnIndex,
      outcome: 'handoff',
      handoff_kind: parseResult.kind,
      duration_ms: Date.now() - startTime,
    });

    return { handoff: parseResult, contextUsage: result.contextUsage };

  } catch (error: any) {
    const duration = Date.now() - startTime;

    if (error instanceof HandoffParseError) {
      meter.createCounter('a_society.handoff.parse_failure').add(1, {
        project_namespace: projectNamespace,
        role_name: roleInstanceId
      });
      logger.warn('session.turn.parse_failed', {
        project_namespace: projectNamespace,
        role_name: roleInstanceId,
        session_id: sessionId,
        turn_index: turnIndex,
        error_message: error.message.slice(0, 500),
        duration_ms: duration,
      });
      throw error;
    }

    if (error instanceof LLMGatewayError && error.type === 'ABORTED') {
      logger.info('session.turn.aborted', {
        project_namespace: projectNamespace,
        role_name: roleInstanceId,
        session_id: sessionId,
        turn_index: turnIndex,
        partial_text_available: !!error.partialText,
        duration_ms: duration,
      });
      return { abort: true as const };
    }

    if (error instanceof LLMGatewayError && error.type === 'CONSENT_DENIED') {
      logger.info('session.turn.consent_denied', {
        project_namespace: projectNamespace,
        role_name: roleInstanceId,
        session_id: sessionId,
        turn_index: turnIndex,
        duration_ms: duration,
      });
      return { consentDenied: true as const };
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('session.turn.error', {
      project_namespace: projectNamespace,
      role_name: roleInstanceId,
      session_id: sessionId,
      turn_index: turnIndex,
      error_message: errorMessage.slice(0, 500),
      duration_ms: duration,
    });
    return { error: true as const, errorMessage };

  } finally {
    operatorRenderer?.responseEnd(roleInstanceId);
    meter.createHistogram('a_society.session.turn.duration').record(Date.now() - startTime, {
      project_namespace: projectNamespace,
      role_name: roleInstanceId
    });
  }
}

interface RunRoleTurnBaseInput {
  workspaceRoot: string;
  roleInstanceId: string;
  providedSystemPrompt: string;
  flowRef: FlowRef;
  providedHistory: RuntimeMessageParam[];
  roleOutputStream?: NodeJS.WritableStream;
  consentGate?: ConsentGate;
  model?: ModelConfigWithKey | null;
  mcpManager?: McpManager;
  onConversationMessages?: (messages: RuntimeMessageParam[]) => void | Promise<void>;
  onAssistantTextDelta?: (text: string) => void;
}

type RunRoleTurnWithoutCompactionInput = {
  externalSignal?: AbortSignal;
  operatorRenderer?: OperatorRenderSink;
  nodeId?: string;
  compaction?: undefined;
};

type RunRoleTurnWithCompactionInput = {
  externalSignal: AbortSignal;
  operatorRenderer: OperatorRenderSink;
  nodeId: string;
  compaction: {
    session: RoleSession;
    flowRun: FlowRun;
    saveSession: () => void | Promise<void>;
    nodeId: string;
  };
};

export type RunRoleTurnInput = RunRoleTurnBaseInput & (
  RunRoleTurnWithoutCompactionInput | RunRoleTurnWithCompactionInput
);

export async function runRoleTurn({
  workspaceRoot,
  roleInstanceId,
  providedSystemPrompt,
  flowRef,
  providedHistory,
  roleOutputStream,
  externalSignal,
  operatorRenderer,
  consentGate,
  model,
  mcpManager,
  onConversationMessages,
  onAssistantTextDelta,
  nodeId,
  compaction,
}: RunRoleTurnInput): Promise<RoleTurnResult | null> {

  let turnIndex = 0;

  const projectNamespace = flowRef.projectNamespace;
  const sessionId = crypto.randomUUID();
  const systemPrompt = providedSystemPrompt;
  const llm = new LLMGateway({
    mode: 'project',
    workspaceRoot,
    flowRef,
    model,
    mcpManager,
  });
  const history: RuntimeMessageParam[] = providedHistory;

  if (compaction) {
    if (!operatorRenderer) {
      throw new Error('Role-turn compaction requires an operator renderer.');
    }
    if (!externalSignal) {
      throw new Error('Role-turn compaction requires an abort signal.');
    }

    const compactionResult = await autoCompactRoleSessionBeforeTurn({
      session: compaction.session,
      flowRun: compaction.flowRun,
      roleName: roleInstanceId,
      nodeId: compaction.nodeId,
      contextWindow: (model ?? getActiveModelWithKey())?.contextWindow ?? null,
      signal: externalSignal,
      operatorRenderer,
      activeHistory: history,
      model,
    });

    if (compactionResult.aborted) {
      return null;
    }

    if (compactionResult.compacted) {
      history.splice(
        0,
        history.length,
        ...(compaction.session.transcriptHistory as RuntimeMessageParam[])
      );
      compaction.session.transcriptHistory = history;
      await compaction.saveSession();
    }
  }

  if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
    logger.debug('session.system_prompt', {
      project_namespace: projectNamespace,
      role_name: roleInstanceId,
      session_id: sessionId,
      context_files: extractFileRefs(systemPrompt).join('\n'),
    });
  }

  if (history[history.length - 1]?.role !== 'user') {
    logger.warn('session.invalid_history', {
      project_namespace: projectNamespace,
      role_name: roleInstanceId,
      session_id: sessionId,
    });
    return null;
  }

  const turnResult = await executeSessionTurn(
    llm,
    systemPrompt,
    history,
    projectNamespace,
    roleInstanceId,
    sessionId,
    turnIndex++,
    roleOutputStream,
    externalSignal,
    operatorRenderer,
    consentGate,
    nodeId,
    onConversationMessages,
    onAssistantTextDelta
  );

  if (turnResult.abort || turnResult.error) {
    if (turnResult.errorMessage) {
      operatorRenderer?.sendError(turnResult.errorMessage);
    }
    return null;
  }

  if (turnResult.consentDenied) {
    return {
      handoff: { kind: 'awaiting_human' },
      awaitingHumanReason: AWAITING_HUMAN_REASON.CONSENT_DENIED
    };
  }

  if (turnResult.handoff) {
    return {
      handoff: turnResult.handoff,
      contextUsage: turnResult.contextUsage
    };
  }

  return null;
}

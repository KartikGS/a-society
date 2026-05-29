import crypto from 'node:crypto';
import type { RoleTurnResult, HandoffResult, OperatorRenderSink, RuntimeMessageParam, ConsentGate } from '../common/types.js';
import { LLMGateway, LLMGatewayError } from '../providers/llm.js';
import { buildRoleContext } from '../context/registry.js';
import { HandoffInterpreter, HandoffParseError } from './handoff.js';
import { TelemetryManager } from '../observability/observability.js';
import { logger } from '../observability/logger.js';

function extractFileRefs(content: string): string[] {
  const refs: string[] = [];
  const pattern = /\[FILE: ([^\]]+)\]/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    refs.push(match[1]);
  }
  return refs;
}

export function emitUsage(renderer: OperatorRenderSink | undefined, contextUsage: number | undefined, role?: string): void {
  if (!renderer) return;
  renderer.emit({ kind: 'usage.turn_summary', role, contextUsage });
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
  recordFolderPath: string | undefined,
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
      recordFolderPath,
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

export async function runRoleTurn(
  workspaceRoot: string,
  projectNamespace: string,
  roleInstanceId: string,
  providedSystemPrompt?: string,
  providedHistory?: RuntimeMessageParam[],
  roleOutputStream?: NodeJS.WritableStream,
  externalSignal?: AbortSignal,
  operatorRenderer?: OperatorRenderSink,
  consentGate?: ConsentGate,
  onConversationMessages?: (messages: RuntimeMessageParam[]) => void | Promise<void>,
  onAssistantTextDelta?: (text: string) => void,
  nodeId?: string,
  recordFolderPath?: string
): Promise<RoleTurnResult | null> {

  let turnIndex = 0;

  if (providedSystemPrompt === undefined) {
    const orientRoleEntry = buildRoleContext(projectNamespace, roleInstanceId, workspaceRoot);
    if (!orientRoleEntry) {
      if (roleOutputStream === process.stdout) {
        console.error(`Could not load role context for '${projectNamespace}/${roleInstanceId}'. Check that the role file exists and contains valid frontmatter.`);
      }
      return null;
    }
  }

  const sessionId = crypto.randomUUID();
  const systemPrompt = providedSystemPrompt ?? '';
  const llm = new LLMGateway(workspaceRoot, undefined, projectNamespace);
  const history: RuntimeMessageParam[] = providedHistory ?? [];

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
    recordFolderPath,
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
      awaitingHumanReason: 'consent-denied'
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

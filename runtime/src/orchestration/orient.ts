import crypto from 'node:crypto';
import type { RoleTurnResult, HandoffResult, OperatorRenderSink, RuntimeMessageParam, TurnUsage, ConsentGate } from '../common/types.js';
import { LLMGateway, LLMGatewayError } from '../providers/llm.js';
import { buildRoleContext } from '../context/registry.js';
import { HandoffInterpreter, HandoffParseError } from './handoff.js';
import { TelemetryManager } from '../observability/observability.js';
import { logger } from '../observability/logger.js';

function writeAssistantOutputIfNeeded(
  text: string,
  displayedText: boolean | undefined,
  outputStream: NodeJS.WritableStream
): void {
  if (!text || displayedText) return;
  outputStream.write(text);
}

function ensureAssistantOutputEndsWithNewline(
  text: string,
  outputStream: NodeJS.WritableStream
): void {
  if (!text || text.endsWith('\n')) return;
  outputStream.write('\n');
}

export function emitUsage(renderer: OperatorRenderSink | undefined, usage: TurnUsage | undefined, role?: string): void {
  if (!renderer) return;
  if (!usage) {
    renderer.emit({ kind: 'usage.turn_summary', role, availability: 'both-unavailable' });
    return;
  }
  const hasIn = usage.inputTokens !== undefined;
  const hasOut = usage.outputTokens !== undefined;
  if (hasIn && hasOut) {
    renderer.emit({ kind: 'usage.turn_summary', role, availability: 'full', inputTokens: usage.inputTokens, outputTokens: usage.outputTokens });
  } else if (hasIn) {
    renderer.emit({ kind: 'usage.turn_summary', role, availability: 'output-unavailable', inputTokens: usage.inputTokens });
  } else if (hasOut) {
    renderer.emit({ kind: 'usage.turn_summary', role, availability: 'input-unavailable', outputTokens: usage.outputTokens });
  } else {
    renderer.emit({ kind: 'usage.turn_summary', role, availability: 'both-unavailable' });
  }
}

type SessionTurnResult = {
  handoff?: HandoffResult;
  usage?: TurnUsage;
  abort?: true;
  error?: true;
};

async function executeSessionTurn(
  llm: LLMGateway,
  systemPrompt: string,
  history: RuntimeMessageParam[],
  projectNamespace: string,
  roleName: string,
  sessionId: string,
  turnIndex: number,
  outputStream: NodeJS.WritableStream,
  externalSignal: AbortSignal | undefined,
  operatorRenderer: OperatorRenderSink | undefined,
  consentGate: ConsentGate | undefined,
  onConversationMessages: ((messages: RuntimeMessageParam[]) => void | Promise<void>) | undefined
): Promise<SessionTurnResult> {
  const meter = TelemetryManager.getMeter();
  const startTime = Date.now();

  meter.createCounter('a_society.session.turn.started').add(1, {
    project_namespace: projectNamespace,
    role_name: roleName
  });

  logger.info('session.turn.started', {
    project_namespace: projectNamespace,
    role_name: roleName,
    session_id: sessionId,
    turn_index: turnIndex,
  });

  try {
    if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
      const latestUserMessage = history[history.length - 1];
      if (latestUserMessage?.role === 'user') {
        logger.debug('session.user_turn', {
          project_namespace: projectNamespace,
          role_name: roleName,
          session_id: sessionId,
          content: latestUserMessage.content.slice(0, 2000),
        });
      }
    }

    const result = await llm.executeTurn(systemPrompt, history, {
      signal: externalSignal,
      outputStream,
      operatorRenderer,
      consentGate,
      role: roleName,
      onConversationMessages,
    });

    if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
      logger.debug('session.assistant_turn', {
        project_namespace: projectNamespace,
        role_name: roleName,
        session_id: sessionId,
        content: result.text.slice(0, 2000),
      });
    }

    writeAssistantOutputIfNeeded(result.text, result.displayedText, outputStream);
    ensureAssistantOutputEndsWithNewline(result.text, outputStream);

    history.push({ role: 'assistant', content: result.text });

    const parseResult = HandoffInterpreter.parse(result.text);

    logger.info('session.turn.completed', {
      project_namespace: projectNamespace,
      role_name: roleName,
      session_id: sessionId,
      turn_index: turnIndex,
      outcome: 'handoff',
      handoff_kind: parseResult.kind,
      duration_ms: Date.now() - startTime,
    });

    return { handoff: parseResult, usage: result.usage };

  } catch (error: any) {
    const duration = Date.now() - startTime;

    if (error instanceof HandoffParseError) {
      meter.createCounter('a_society.handoff.parse_failure').add(1, {
        project_namespace: projectNamespace,
        role_name: roleName
      });
      logger.warn('session.turn.parse_failed', {
        project_namespace: projectNamespace,
        role_name: roleName,
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
        role_name: roleName,
        session_id: sessionId,
        turn_index: turnIndex,
        partial_text_available: !!error.partialText,
        duration_ms: duration,
      });
      if (error.partialText) {
        history.push({ role: 'assistant', content: error.partialText });
      }
      return { abort: true as const };
    }

    logger.error('session.turn.error', {
      project_namespace: projectNamespace,
      role_name: roleName,
      session_id: sessionId,
      turn_index: turnIndex,
      error_message: error instanceof Error ? error.message.slice(0, 500) : String(error),
      duration_ms: duration,
    });
    return { error: true as const };

  } finally {
    meter.createHistogram('a_society.session.turn.duration').record(Date.now() - startTime, {
      project_namespace: projectNamespace,
      role_name: roleName
    });
  }
}

export async function runRoleTurn(
  workspaceRoot: string,
  projectNamespace: string,
  roleName: string,
  providedSystemPrompt?: string,
  providedHistory?: RuntimeMessageParam[],
  outputStream: NodeJS.WritableStream = process.stdout,
  externalSignal?: AbortSignal,
  operatorRenderer?: OperatorRenderSink,
  consentGate?: ConsentGate,
  onConversationMessages?: (messages: RuntimeMessageParam[]) => void | Promise<void>
): Promise<RoleTurnResult | null> {

  let turnIndex = 0;

  if (providedSystemPrompt === undefined) {
    const orientRoleEntry = buildRoleContext(projectNamespace, roleName, workspaceRoot);
    if (!orientRoleEntry) {
      if (outputStream === process.stdout) {
        console.error(`Could not load role context for '${projectNamespace}/${roleName}'. Check that the role file exists and contains valid frontmatter.`);
      }
      return null;
    }
  }

  const sessionId = crypto.randomUUID();
  const systemPrompt = providedSystemPrompt ?? '';
  const llm = new LLMGateway(workspaceRoot);
  const history: RuntimeMessageParam[] = providedHistory ?? [];

  if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
    logger.debug('session.system_prompt', {
      project_namespace: projectNamespace,
      role_name: roleName,
      session_id: sessionId,
      content: systemPrompt.slice(0, 2000),
    });
  }

  if (history[history.length - 1]?.role !== 'user') {
    logger.warn('session.invalid_history', {
      project_namespace: projectNamespace,
      role_name: roleName,
      session_id: sessionId,
    });
    return null;
  }

  const turnResult = await executeSessionTurn(
    llm,
    systemPrompt,
    history,
    projectNamespace,
    roleName,
    sessionId,
    turnIndex++,
    outputStream,
    externalSignal,
    operatorRenderer,
    consentGate,
    onConversationMessages
  );

  if (turnResult.abort || turnResult.error) {
    return null;
  }

  if (turnResult.handoff) {
    return {
      handoff: turnResult.handoff,
      usage: turnResult.usage
    };
  }

  return null;
}

import crypto from 'node:crypto';
import type { RoleTurnResult, HandoffResult, OperatorRenderSink, RuntimeMessageParam, TurnUsage, ConsentGate } from './types.js';
import { LLMGateway, LLMGatewayError } from './llm.js';
import { buildRoleContext } from './registry.js';
import { HandoffInterpreter, HandoffParseError } from './handoff.js';
import { TelemetryManager } from './observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';

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

export function emitUsage(renderer: OperatorRenderSink | undefined, usage: TurnUsage | undefined): void {
  if (!renderer) return;
  if (!usage) {
    renderer.emit({ kind: 'usage.turn_summary', availability: 'both-unavailable' });
    return;
  }
  const hasIn = usage.inputTokens !== undefined;
  const hasOut = usage.outputTokens !== undefined;
  if (hasIn && hasOut) {
    renderer.emit({ kind: 'usage.turn_summary', availability: 'full', inputTokens: usage.inputTokens, outputTokens: usage.outputTokens });
  } else if (hasIn) {
    renderer.emit({ kind: 'usage.turn_summary', availability: 'output-unavailable', inputTokens: usage.inputTokens });
  } else if (hasOut) {
    renderer.emit({ kind: 'usage.turn_summary', availability: 'input-unavailable', outputTokens: usage.outputTokens });
  } else {
    renderer.emit({ kind: 'usage.turn_summary', availability: 'both-unavailable' });
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
  turnIndex: number,
  outputStream: NodeJS.WritableStream,
  externalSignal: AbortSignal | undefined,
  operatorRenderer: OperatorRenderSink | undefined,
  consentGate: ConsentGate | undefined
): Promise<SessionTurnResult> {
  const tracer = TelemetryManager.getTracer();
  const meter = TelemetryManager.getMeter();

  return tracer.startActiveSpan('session.turn', {
    kind: SpanKind.INTERNAL,
    attributes: { 'turn.index': turnIndex, 'project_namespace': projectNamespace, 'role_name': roleName }
  }, async (turnSpan): Promise<SessionTurnResult> => {
    const startTime = Date.now();
    meter.createCounter('a_society.session.turn.started').add(1, {
      project_namespace: projectNamespace,
      role_name: roleName
    });
    try {
      const latestUserMessage = history[history.length - 1];
      if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true' && latestUserMessage?.role === 'user') {
        turnSpan.addEvent('session.user_turn', { content: latestUserMessage.content });
      }

      const result = await llm.executeTurn(systemPrompt, history, {
        signal: externalSignal,
        outputStream,
        operatorRenderer,
        consentGate,
      });
      if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
        turnSpan.addEvent('session.assistant_turn', { content: result.text });
      }
      writeAssistantOutputIfNeeded(result.text, result.displayedText, outputStream);
      ensureAssistantOutputEndsWithNewline(result.text, outputStream);

      if (result.intermediateMessages) history.push(...result.intermediateMessages);
      history.push({ role: 'assistant', content: result.text });

      const parseResult = HandoffInterpreter.parse(result.text);
      turnSpan.setAttribute('session.turn.outcome', 'handoff');
      turnSpan.addEvent('session.turn.handoff_detected', { handoff_kind: parseResult.kind });
      return { handoff: parseResult, usage: result.usage };
    } catch (error: any) {
      if (error instanceof HandoffParseError) {
        meter.createCounter('a_society.handoff.parse_failure').add(1, {
          project_namespace: projectNamespace,
          role_name: roleName
        });
        turnSpan.addEvent('session.turn.parse_failed', { error_message: error.message.slice(0, 500) });
        turnSpan.setAttribute('session.turn.outcome', 'repair_requested');
        turnSpan.recordException(error);
        turnSpan.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      }
      if (error instanceof LLMGatewayError && error.type === 'ABORTED') {
        turnSpan.setAttribute('session.turn.outcome', 'aborted');
        turnSpan.addEvent('session.turn.aborted', { partial_text_available: !!error.partialText });
        if (error.partialText) {
          history.push({ role: 'assistant', content: error.partialText });
        }
        return { abort: true as const };
      }
      turnSpan.recordException(error);
      turnSpan.setStatus({ code: SpanStatusCode.ERROR });
      return { error: true as const };
    } finally {
      const duration = Date.now() - startTime;
      meter.createHistogram('a_society.session.turn.duration').record(duration, {
        project_namespace: projectNamespace,
        role_name: roleName
      });
      turnSpan.end();
    }
  });
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
  consentGate?: ConsentGate
): Promise<RoleTurnResult | null> {

  const tracer = TelemetryManager.getTracer();
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

  return tracer.startActiveSpan('session.interaction', {
    kind: SpanKind.INTERNAL,
    attributes: {
      'session.id': sessionId,
      'project_namespace': projectNamespace,
      'role_name': roleName
    }
  }, async (interactionSpan) => {

    const systemPrompt = providedSystemPrompt ?? '';
    if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
      interactionSpan.addEvent('session.system_prompt', { content: systemPrompt.slice(0, 2000) });
    }

    const llm = new LLMGateway(workspaceRoot);
    const history: RuntimeMessageParam[] = providedHistory ?? [];

    try {
      if (history[history.length - 1]?.role !== 'user') {
        interactionSpan.setAttribute('session.interaction.outcome', 'invalid_history');
        return null;
      }

      const turnResult = await executeSessionTurn(
        llm,
        systemPrompt,
        history,
        projectNamespace,
        roleName,
        turnIndex++,
        outputStream,
        externalSignal,
        operatorRenderer,
        consentGate
      );

      if (turnResult.abort || turnResult.error) {
        interactionSpan.setAttribute('session.interaction.outcome', turnResult.abort ? 'aborted' : 'error');
        return null;
      }

      if (turnResult.handoff) {
        const outcome = turnResult.handoff.kind === 'awaiting_human' ? 'awaiting_human' : 'handoff';
        interactionSpan.setAttribute('session.interaction.outcome', outcome);
        return {
          handoff: turnResult.handoff,
          usage: turnResult.usage
        };
      }

      interactionSpan.setAttribute('session.interaction.outcome', 'null_return');
      return null;

    } catch (e: any) {
      interactionSpan.recordException(e);
      interactionSpan.setStatus({ code: SpanStatusCode.ERROR });
      throw e;
    } finally {
      interactionSpan.setAttribute('session.interaction.turn_count', turnIndex);
      interactionSpan.end();
    }
  });
}

import readline from 'node:readline';
import crypto from 'node:crypto';
import type { OrientSession, FlowRun, HandoffResult } from './types.js';
import { ContextInjectionService } from './injection.js';
import { LLMGateway, type RuntimeMessageParam, LLMGatewayError } from './llm.js';
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

export async function runInteractiveSession(
  workspaceRoot: string,
  roleKey: string,
  providedSystemPrompt?: string,
  providedHistory?: RuntimeMessageParam[],
  inputStream: NodeJS.ReadableStream = process.stdin,
  outputStream: NodeJS.WritableStream = process.stdout,
  autonomous: boolean = false,
  externalSignal?: AbortSignal
): Promise<HandoffResult | null> {

  const tracer = TelemetryManager.getTracer();
  const meter = TelemetryManager.getMeter();
  let turnIndex = 0;

  const orientRoleEntry = buildRoleContext(roleKey, workspaceRoot);
  if (!orientRoleEntry) {
    if (outputStream === process.stdout) {
      console.error(`Could not load role context for '${roleKey}'. Check that the role file exists and contains valid frontmatter.`);
    }
    return null;
  }

  const session: OrientSession = {
    sessionId: crypto.randomUUID(),
    workspaceRoot,
    roleKey,
    startedAt: new Date().toISOString()
  };

  return tracer.startActiveSpan('session.interaction', {
    kind: SpanKind.INTERNAL,
    attributes: {
      'session.id': session.sessionId,
      'role_key': roleKey,
      'autonomous': autonomous
    }
  }, async (interactionSpan) => {

    const systemPrompt = providedSystemPrompt ?? '';
    if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
      interactionSpan.addEvent('session.system_prompt', { content: systemPrompt.slice(0, 2000) });
    }

    const llm = new LLMGateway(workspaceRoot);
    const history: RuntimeMessageParam[] = providedHistory ?? [];

    try {
      if (history.length === 0) {
        const initialUserMsg: RuntimeMessageParam = { 
          role: 'user', 
          content: "A new session has started. Read the project log in your context and give a brief status of where the project is at, then ask what the user wants to work on." 
        };

        const turnResult = await tracer.startActiveSpan('session.turn', { 
          kind: SpanKind.INTERNAL, 
          attributes: { 'turn.index': turnIndex++, 'autonomous': autonomous } 
        }, async (turnSpan) => {
          const startTime = Date.now();
          meter.createCounter('a_society.session.turn.started').add(1, { role_key: roleKey, autonomous: String(autonomous) });
          try {
            if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
              turnSpan.addEvent('session.user_turn', { content: initialUserMsg.content });
            }

            const result = await llm.executeTurn(systemPrompt, [initialUserMsg], {
              signal: externalSignal,
              outputStream
            });
            if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
              turnSpan.addEvent('session.assistant_turn', { content: result.text });
            }
            writeAssistantOutputIfNeeded(result.text, result.displayedText, outputStream);

            history.push(initialUserMsg);
            if (result.intermediateMessages) history.push(...result.intermediateMessages);
            history.push({ role: 'assistant', content: result.text });

            if (result.usage && process.stderr.isTTY) {
              const inStr = result.usage.inputTokens !== undefined ? String(result.usage.inputTokens) : '?';
              const outStr = result.usage.outputTokens !== undefined ? String(result.usage.outputTokens) : '?';
              process.stderr.write(`[tokens: ${inStr} in, ${outStr} out]\n`);
            }

            try {
              const parseResult = HandoffInterpreter.parse(result.text);
              turnSpan.setAttribute('session.turn.outcome', 'handoff');
              turnSpan.addEvent('session.turn.handoff_detected', { handoff_kind: parseResult.kind });
              if (outputStream === process.stdout) console.log("Handoff detected. Transitioning node...");
              return { handoff: parseResult };
            } catch (e: any) {
              if (e instanceof HandoffParseError) {
                meter.createCounter('a_society.handoff.parse_failure').add(1, { role_key: roleKey });
                turnSpan.addEvent('session.turn.parse_failed', { error_message: e.message.slice(0, 500) });
                if (autonomous) throw e;
                turnSpan.setAttribute('session.turn.outcome', 'no_handoff');
                return { handoff: null };
              }
              throw e;
            }
          } catch (error: any) {
            if (error instanceof HandoffParseError && autonomous) {
              turnSpan.recordException(error);
              turnSpan.setStatus({ code: SpanStatusCode.ERROR });
              throw error;
            }
            if (error instanceof LLMGatewayError && error.type === 'ABORTED') {
              turnSpan.setAttribute('session.turn.outcome', 'aborted');
              turnSpan.addEvent('session.turn.aborted', { partial_text_available: !!error.partialText });
              if (error.partialText && providedHistory) {
                providedHistory.push({ role: 'assistant', content: error.partialText });
              }
              process.stderr.write('\n[Aborted]\n');
              return { abort: true };
            }
            if (error instanceof LLMGatewayError && error.type === 'AUTH_ERROR') {
              interactionSpan.addEvent('session.auth_error');
              if (outputStream === process.stdout) console.error(error.message);
            } else {
              if (outputStream === process.stdout) console.error(`Error during initial turn: ${error.message}`);
            }
            turnSpan.recordException(error);
            turnSpan.setStatus({ code: SpanStatusCode.ERROR });
            return { error: true };
          } finally {
            const duration = Date.now() - startTime;
            meter.createHistogram('a_society.session.turn.duration').record(duration, { role_key: roleKey, autonomous: String(autonomous) });
            turnSpan.end();
          }
        });

        if (turnResult.abort || turnResult.error) {
          interactionSpan.setAttribute('session.interaction.outcome', turnResult.abort ? 'aborted' : 'error');
          return null;
        }
        if (turnResult.handoff) {
          const outcome = turnResult.handoff.kind === 'awaiting_human' ? 'awaiting_human' : 'handoff';
          interactionSpan.setAttribute('session.interaction.outcome', outcome);
          return turnResult.handoff;
        }
      } else {

        if (history[history.length - 1].role === 'user') {
          const turnResult = await tracer.startActiveSpan('session.turn', { 
            kind: SpanKind.INTERNAL, 
            attributes: { 'turn.index': turnIndex++, 'autonomous': autonomous } 
          }, async (turnSpan) => {
            const startTime = Date.now();
            meter.createCounter('a_society.session.turn.started').add(1, { role_key: roleKey, autonomous: String(autonomous) });
            try {
              if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
                turnSpan.addEvent('session.user_turn', { content: (history[history.length - 1] as any).content });
              }

              const result = await llm.executeTurn(systemPrompt, history, {
                signal: externalSignal,
                outputStream
              });
              if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
                turnSpan.addEvent('session.assistant_turn', { content: result.text });
              }
              writeAssistantOutputIfNeeded(result.text, result.displayedText, outputStream);

              if (result.intermediateMessages) history.push(...result.intermediateMessages);
              history.push({ role: 'assistant', content: result.text });

              if (result.usage && process.stderr.isTTY) {
                const inStr = result.usage.inputTokens !== undefined ? String(result.usage.inputTokens) : '?';
                const outStr = result.usage.outputTokens !== undefined ? String(result.usage.outputTokens) : '?';
                process.stderr.write(`[tokens: ${inStr} in, ${outStr} out]\n`);
              }

              try {
                const parseResult = HandoffInterpreter.parse(result.text);
                turnSpan.setAttribute('session.turn.outcome', 'handoff');
                turnSpan.addEvent('session.turn.handoff_detected', { handoff_kind: parseResult.kind });
                if (outputStream === process.stdout) console.log("Handoff detected. Transitioning node...");
                return { handoff: parseResult };
              } catch (e: any) {
                if (e instanceof HandoffParseError) {
                  meter.createCounter('a_society.handoff.parse_failure').add(1, { role_key: roleKey });
                  turnSpan.addEvent('session.turn.parse_failed', { error_message: e.message.slice(0, 500) });
                  if (autonomous) throw e;
                  turnSpan.setAttribute('session.turn.outcome', 'no_handoff');
                  return { handoff: null };
                }
                throw e;
              }
            } catch (error: any) {
              if (error instanceof HandoffParseError && autonomous) {
                turnSpan.recordException(error);
                turnSpan.setStatus({ code: SpanStatusCode.ERROR });
                throw error;
              }
              if (error instanceof LLMGatewayError && error.type === 'ABORTED') {
                turnSpan.setAttribute('session.turn.outcome', 'aborted');
                turnSpan.addEvent('session.turn.aborted', { partial_text_available: !!error.partialText });
                if (error.partialText && providedHistory) {
                  providedHistory.push({ role: 'assistant', content: error.partialText });
                }
                process.stderr.write('\n[Aborted]\n');
                return { abort: true };
              }
              if (outputStream === process.stdout) console.error(`\nError during turn: ${error.message}`);
              turnSpan.recordException(error);
              turnSpan.setStatus({ code: SpanStatusCode.ERROR });
              return { error: true };
            } finally {
              const duration = Date.now() - startTime;
              meter.createHistogram('a_society.session.turn.duration').record(duration, { role_key: roleKey, autonomous: String(autonomous) });
              turnSpan.end();
            }
          });

          if (turnResult.abort || turnResult.error) {
            interactionSpan.setAttribute('session.interaction.outcome', turnResult.abort ? 'aborted' : 'error');
            return null;
          }
          if (turnResult.handoff) {
            const outcome = turnResult.handoff.kind === 'awaiting_human' ? 'awaiting_human' : 'handoff';
            interactionSpan.setAttribute('session.interaction.outcome', outcome);
            return turnResult.handoff;
          }
        }
      }

      if (autonomous) {
        interactionSpan.setAttribute('session.interaction.outcome', 'null_return');
        return null; // Should not reach here for autonomous turn
      }

      const interactiveResult = await new Promise<HandoffResult | null>((resolve) => {
        const rl = readline.createInterface({
          input: inputStream,
          output: outputStream,
          terminal: true
        });

        let currentController: AbortController | undefined;
        rl.on('SIGINT', () => {
          currentController?.abort();
        });

        const promptUser = () => {
          rl.question('\n> ', async (input) => {
            const line = input.trim();
            if (line === 'exit' || line === 'quit') {
              interactionSpan.setAttribute('session.interaction.outcome', 'null_return');
              finish(null);
              rl.close();
              return;
            }
            if (!line) {
              promptUser();
              return;
            }

            history.push({ role: 'user', content: line });

            const turnResult = await tracer.startActiveSpan('session.turn', { 
              kind: SpanKind.INTERNAL, 
              attributes: { 'turn.index': turnIndex++, 'autonomous': autonomous } 
            }, async (turnSpan) => {
              const startTime = Date.now();
              meter.createCounter('a_society.session.turn.started').add(1, { role_key: roleKey, autonomous: String(autonomous) });
              try {
                if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
                  turnSpan.addEvent('session.user_turn', { content: line });
                }

                currentController = new AbortController();
                const signal = currentController.signal;

                const result = await llm.executeTurn(systemPrompt as string, history, {
                  signal,
                  outputStream
                });
                if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
                  turnSpan.addEvent('session.assistant_turn', { content: result.text });
                }
                writeAssistantOutputIfNeeded(result.text, result.displayedText, outputStream);

                if (result.intermediateMessages) history.push(...result.intermediateMessages);
                history.push({ role: 'assistant', content: result.text });

                if (result.usage && process.stderr.isTTY) {
                  const inStr = result.usage.inputTokens !== undefined ? String(result.usage.inputTokens) : '?';
                  const outStr = result.usage.outputTokens !== undefined ? String(result.usage.outputTokens) : '?';
                  process.stderr.write(`[tokens: ${inStr} in, ${outStr} out]\n`);
                }

                try {
                  const parseResult = HandoffInterpreter.parse(result.text);
                  turnSpan.setAttribute('session.turn.outcome', 'handoff');
                  turnSpan.addEvent('session.turn.handoff_detected', { handoff_kind: parseResult.kind });
                  if (outputStream === process.stdout) console.log("Handoff detected. Transitioning node...");
                  return { handoff: parseResult };
                } catch (e: any) {
                  if (e instanceof HandoffParseError) {
                    meter.createCounter('a_society.handoff.parse_failure').add(1, { role_key: roleKey });
                    turnSpan.addEvent('session.turn.parse_failed', { error_message: e.message.slice(0, 500) });
                    turnSpan.setAttribute('session.turn.outcome', 'no_handoff');
                    return { handoff: null };
                  }
                  throw e;
                }
              } catch (error: any) {
                if (error instanceof LLMGatewayError && error.type === 'ABORTED') {
                  turnSpan.setAttribute('session.turn.outcome', 'aborted');
                  turnSpan.addEvent('session.turn.aborted', { partial_text_available: !!error.partialText });
                  if (error.partialText) history.push({ role: 'assistant', content: error.partialText });
                  process.stderr.write('\n[Aborted]\n');
                  return { abort: true };
                }
                if (outputStream === process.stdout) console.error(`\nError during turn: ${error.message}`);
                turnSpan.recordException(error);
                turnSpan.setStatus({ code: SpanStatusCode.ERROR });
                return { error: true };
              } finally {
                const duration = Date.now() - startTime;
                meter.createHistogram('a_society.session.turn.duration').record(duration, { role_key: roleKey, autonomous: String(autonomous) });
                turnSpan.end();
              }
            });

            if (turnResult.handoff) {
              const outcome = turnResult.handoff.kind === 'awaiting_human' ? 'awaiting_human' : 'handoff';
              interactionSpan.setAttribute('session.interaction.outcome', outcome);
              finish(turnResult.handoff);
              rl.close();
              return;
            }
            if (turnResult.abort) {
              // Readline loop continues after abort
            }
            if (turnResult.error) {
              // Readline loop continues after non-critical turn error? 
              // Actually, the original code recursed on error too.
            }
            promptUser();
          });
        };

        let resolved = false;

        rl.on('close', () => {
          if (!resolved && inputStream === process.stdin && outputStream === process.stdout) {
            console.log('\nSession closed.');
          }
          if (!resolved) {
            resolved = true;
            interactionSpan.setAttribute('session.interaction.outcome', 'null_return');
            resolve(null);
          }
        });

        const finish = (result: HandoffResult | null) => {
          if (!resolved) {
            resolved = true;
            resolve(result);
          }
        };

        promptUser();
      });

      return interactiveResult;

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

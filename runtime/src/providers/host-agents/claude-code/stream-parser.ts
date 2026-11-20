import type { HostLiveEvent, HostPermissionDenial, HostTurnResult } from '../types.js';

/** Everything a Claude Code turn can end in. The adapter turns the error kinds into thrown errors. */
export type ClaudeTurnOutcome =
  | HostTurnResult
  | { kind: 'auth-error'; message: string }
  | { kind: 'rate-limited'; message: string; resetsAt?: number }
  | { kind: 'host-error'; message: string };

const MISSING_CONVERSATION = /No conversation found with session ID/i;
const NOT_LOGGED_IN = /Not logged in|Please run \/login|Invalid API key|OAuth token (has )?expired/i;
const RATE_LIMITED = /rate limit|usage limit|\b429\b/i;
const FILE_TOOLS = new Set(['Read', 'Write', 'Edit', 'MultiEdit', 'NotebookEdit']);

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberOr0(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/** Context in use = input + cache-read + cache-creation tokens, the quantity the API path reports. */
function contextTokens(usage: unknown): number | undefined {
  if (!isObject(usage)) return undefined;
  const total = numberOr0(usage.input_tokens) + numberOr0(usage.cache_read_input_tokens) + numberOr0(usage.cache_creation_input_tokens);
  return total > 0 ? total : undefined;
}

function toolTarget(name: string, input: unknown): { path?: string; command?: string } {
  if (!isObject(input)) return {};
  if (name === 'Bash' && typeof input.command === 'string') return { command: input.command };
  if (FILE_TOOLS.has(name)) {
    const target = input.file_path ?? input.notebook_path;
    if (typeof target === 'string') return { path: target };
  }
  return {};
}

function utilization(windows: unknown, key: string): number | undefined {
  if (!isObject(windows)) return undefined;
  const window = windows[key];
  return isObject(window) && typeof window.utilization === 'number' ? window.utilization : undefined;
}

/**
 * Folds Claude Code `stream-json` events into one turn outcome and emits live events
 * as they arrive. Pure apart from the `onEvent` callback; never throws on bad input.
 */
export class ClaudeStreamParser {
  private result: Json | null = null;
  private lastAssistantUsage: unknown;
  private readonly toolNames = new Map<string, string>();
  private unparsedLines = 0;
  private rateLimitRejection: { resetsAt?: number } | null = null;
  private text = '';
  /** Text emitted from deltas for the open main-session text block. */
  private currentBlockStreamed = '';
  private pendingNewBlock = false;

  constructor(private readonly onEvent: (event: HostLiveEvent) => void) {}

  /** Assistant text seen so far, kept for an aborted turn's partial reply. */
  get partialText(): string {
    return this.text;
  }

  pushLine(line: string): void {
    let event: unknown;
    try {
      event = JSON.parse(line);
    } catch {
      this.unparsedLines += 1;
      return;
    }
    if (!isObject(event)) {
      this.unparsedLines += 1;
      return;
    }
    switch (event.type) {
      case 'stream_event':
        this.onStreamEvent(event);
        break;
      case 'assistant':
        this.onAssistant(event);
        break;
      case 'user':
        this.onUser(event);
        break;
      case 'rate_limit_event':
        this.onRateLimit(event);
        break;
      case 'result':
        this.result = event;
        break;
      default:
        break;
    }
  }

  finish(stderrTail: string): ClaudeTurnOutcome {
    const result = this.result;
    if (!result) {
      if (MISSING_CONVERSATION.test(stderrTail)) return { kind: 'conversation-missing' };
      const detail = this.unparsedLines > 0
        ? `Host output had no result event (${this.unparsedLines} non-JSON line(s)).`
        : 'Host output had no result event.';
      return { kind: 'malformed', detail, stderrTail };
    }

    const resultText = typeof result.result === 'string' ? result.result : '';
    const errors = Array.isArray(result.errors) ? result.errors.filter((e): e is string => typeof e === 'string') : [];

    if (result.is_error === true) {
      const message = resultText || errors.join('; ') || `Host turn failed (${String(result.subtype ?? 'unknown')}).`;
      if (MISSING_CONVERSATION.test(message) || MISSING_CONVERSATION.test(stderrTail)) return { kind: 'conversation-missing' };
      if (NOT_LOGGED_IN.test(message)) return { kind: 'auth-error', message };
      if (this.rateLimitRejection || RATE_LIMITED.test(message)) {
        return { kind: 'rate-limited', message, ...this.rateLimitRejection };
      }
      if (result.subtype === 'error_max_turns') return this.completed(result, resultText, 'max_tokens');
      return { kind: 'host-error', message };
    }

    if (typeof result.result !== 'string') {
      return { kind: 'malformed', detail: 'Host result event had no result text.', stderrTail };
    }
    return this.completed(result, resultText, typeof result.stop_reason === 'string' ? result.stop_reason : undefined);
  }

  private completed(result: Json, text: string, finishReason: string | undefined): HostTurnResult {
    const usage = isObject(result.usage) ? result.usage : {};
    const iterations = Array.isArray(usage.iterations) ? usage.iterations : [];
    // The aggregate usage sums every API call in the turn; the last call is the context size.
    const contextUsage = contextTokens(iterations.at(-1)) ?? contextTokens(this.lastAssistantUsage);
    const denials: HostPermissionDenial[] = (Array.isArray(result.permission_denials) ? result.permission_denials : [])
      .filter(isObject)
      .filter((denial) => typeof denial.tool_name === 'string')
      .map((denial) => ({
        toolName: denial.tool_name as string,
        input: isObject(denial.tool_input) ? denial.tool_input : {},
      }));
    return {
      kind: 'completed',
      text,
      conversationId: typeof result.session_id === 'string' ? result.session_id : '',
      ...(contextUsage !== undefined ? { contextUsage } : {}),
      ...(finishReason ? { finishReason } : {}),
      permissionDenials: denials,
    };
  }

  /** The one place text leaves the parser, so `partialText` always equals what was shown. */
  private emitText(text: string, newBlock: boolean): void {
    if (!text) return;
    this.text = newBlock && this.text ? `${this.text}\n\n${text}` : this.text + text;
    this.onEvent({ kind: 'text', text, newBlock });
  }

  /** `--include-partial-messages` deltas for the main session; everything else is ignored. */
  private onStreamEvent(event: Json): void {
    if (typeof event.parent_tool_use_id === 'string') return;
    const inner = isObject(event.event) ? event.event : null;
    if (!inner) return;
    if (inner.type === 'content_block_start') {
      if (isObject(inner.content_block) && inner.content_block.type === 'text') {
        this.currentBlockStreamed = '';
        this.pendingNewBlock = true;
      }
      return;
    }
    if (inner.type !== 'content_block_delta' || !isObject(inner.delta)) return;
    const delta = inner.delta;
    if (delta.type !== 'text_delta' || typeof delta.text !== 'string' || !delta.text) return;
    // A delta with no streamed text yet opens a block even if its start event was missed.
    this.emitText(delta.text, this.pendingNewBlock || this.currentBlockStreamed === '');
    this.pendingNewBlock = false;
    this.currentBlockStreamed += delta.text;
  }

  /** Emits whatever of a completed main-session text block the deltas did not already show. */
  private reconcileTextBlock(blockText: string): void {
    const streamed = this.currentBlockStreamed;
    if (streamed === '') {
      this.emitText(blockText, true);
    } else if (blockText.startsWith(streamed) && blockText.length > streamed.length) {
      this.emitText(blockText.slice(streamed.length), false);
    }
    this.currentBlockStreamed = '';
    this.pendingNewBlock = false;
  }

  private onAssistant(event: Json): void {
    const message = isObject(event.message) ? event.message : null;
    if (!message) return;
    if (message.usage !== undefined) this.lastAssistantUsage = message.usage;
    const fromSubagent = typeof event.parent_tool_use_id === 'string';
    for (const block of Array.isArray(message.content) ? message.content : []) {
      if (!isObject(block)) continue;
      if (block.type === 'text' && typeof block.text === 'string' && block.text) {
        if (fromSubagent) this.emitText(block.text, true);
        else this.reconcileTextBlock(block.text);
      } else if (block.type === 'tool_use' && typeof block.name === 'string') {
        if (typeof block.id === 'string') this.toolNames.set(block.id, block.name);
        this.onEvent({ kind: 'tool_call', toolName: block.name, ...toolTarget(block.name, block.input) });
      }
    }
  }

  private onUser(event: Json): void {
    const message = isObject(event.message) ? event.message : null;
    for (const block of Array.isArray(message?.content) ? message.content : []) {
      if (!isObject(block) || block.type !== 'tool_result') continue;
      const toolName = typeof block.tool_use_id === 'string' ? this.toolNames.get(block.tool_use_id) : undefined;
      this.onEvent({ kind: 'tool_result', toolName: toolName ?? 'unknown', isError: block.is_error === true });
    }
  }

  private onRateLimit(event: Json): void {
    const info = isObject(event.rate_limit_info) ? event.rate_limit_info : null;
    if (!info) return;
    if (info.status === 'rejected') {
      this.rateLimitRejection = typeof info.resetsAt === 'number' ? { resetsAt: info.resetsAt } : {};
    }
    const fiveHour = utilization(info.unifiedWindows, 'five_hour');
    const sevenDay = utilization(info.unifiedWindows, 'seven_day');
    if (fiveHour === undefined && sevenDay === undefined) return;
    this.onEvent({
      kind: 'rate_limit',
      ...(fiveHour !== undefined ? { fiveHour } : {}),
      ...(sevenDay !== undefined ? { sevenDay } : {}),
    });
  }
}

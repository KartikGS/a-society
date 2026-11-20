import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ClaudeStreamParser } from '../../../src/providers/host-agents/claude-code/stream-parser.js';
import type { HostLiveEvent } from '../../../src/providers/host-agents/types.js';

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'claude-code', '2.1.309');

function fixture(name: string): string[] {
  return fs.readFileSync(path.join(FIXTURES, `${name}.jsonl`), 'utf8').split('\n').filter(Boolean);
}

function parse(lines: string[], stderrTail = ''): { outcome: ReturnType<ClaudeStreamParser['finish']>; events: HostLiveEvent[] } {
  const events: HostLiveEvent[] = [];
  const parser = new ClaudeStreamParser((event) => events.push(event));
  for (const line of lines) parser.pushLine(line);
  return { outcome: parser.finish(stderrTail), events };
}

describe('ClaudeStreamParser on recorded Claude Code 2.1.309 output', () => {
  it('folds a first turn into a completed result with context usage from the last API call', () => {
    const { outcome, events } = parse(fixture('first'));
    expect(outcome).toMatchObject({
      kind: 'completed',
      text: 'hello\n\nDONE',
      finishReason: 'end_turn',
      permissionDenials: [],
    });
    if (outcome.kind !== 'completed') throw new Error('expected completed');
    expect(outcome.conversationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(outcome.contextUsage).toBeGreaterThan(0);
    expect(events).toContainEqual({ kind: 'text', text: 'hello\n\nDONE', newBlock: true });
    expect(events).toContainEqual({ kind: 'rate_limit', fiveHour: 0.02, sevenDay: 0.01 });
  });

  it('keeps the conversation id on resume', () => {
    const first = parse(fixture('first')).outcome;
    const resumed = parse(fixture('resume')).outcome;
    if (first.kind !== 'completed' || resumed.kind !== 'completed') throw new Error('expected completed');
    expect(resumed.conversationId).toBe(first.conversationId);
  });

  it('reports permission denials with their tool input', () => {
    const { outcome, events } = parse(fixture('denied'));
    if (outcome.kind !== 'completed') throw new Error('expected completed');
    expect(outcome.permissionDenials).toEqual([
      { toolName: 'Write', input: { file_path: '/WORKSPACE/project/probe.txt', content: 'hi\n' } },
      { toolName: 'Bash', input: { command: 'curl -s https://example.com', description: 'Fetch example.com HTML silently' } },
    ]);
    expect(events).toContainEqual({ kind: 'tool_call', toolName: 'Write', path: '/WORKSPACE/project/probe.txt' });
    expect(events).toContainEqual({ kind: 'tool_call', toolName: 'Bash', command: 'curl -s https://example.com' });
    expect(events.filter((event) => event.kind === 'tool_result')).toEqual([
      { kind: 'tool_result', toolName: 'Write', isError: true },
      { kind: 'tool_result', toolName: 'Bash', isError: true },
    ]);
  });

  it('uses the last API call, not the turn aggregate, as context usage', () => {
    const { outcome } = parse(fixture('denied'));
    if (outcome.kind !== 'completed') throw new Error('expected completed');
    // The aggregate cache-read count sums three calls; the last call alone is the context in use.
    const result = JSON.parse(fixture('denied').at(-1)!) as { usage: { cache_read_input_tokens: number } };
    expect(outcome.contextUsage).toBeLessThan(result.usage.cache_read_input_tokens);
  });

  it('maps a successful tool call to tool events', () => {
    const { outcome, events } = parse(fixture('tooluse'));
    expect(outcome).toMatchObject({ kind: 'completed', text: 'ok', permissionDenials: [] });
    expect(events).toContainEqual({ kind: 'tool_result', toolName: 'Write', isError: false });
  });

  it('recognizes a missing conversation', () => {
    const stderr = fs.readFileSync(path.join(FIXTURES, 'missing.stderr.txt'), 'utf8');
    expect(parse(fixture('missing'), stderr).outcome).toEqual({ kind: 'conversation-missing' });
    expect(parse([], stderr).outcome).toEqual({ kind: 'conversation-missing' });
  });

  it('recognizes a logged-out host as an auth error', () => {
    expect(parse(fixture('notlogged')).outcome).toEqual({ kind: 'auth-error', message: 'Not logged in · Please run /login' });
  });

  it('returns malformed with the stderr tail when no result event arrives', () => {
    const truncated = fixture('first').slice(0, -1);
    expect(parse([...truncated, 'not json'], 'boom').outcome).toEqual({
      kind: 'malformed',
      detail: 'Host output had no result event (1 non-JSON line(s)).',
      stderrTail: 'boom',
    });
  });

  it('treats a rejected rate-limit window as rate-limited, with the reset time', () => {
    const { outcome } = parse([
      JSON.stringify({ type: 'rate_limit_event', rate_limit_info: { status: 'rejected', resetsAt: 1800000000 } }),
      JSON.stringify({ type: 'result', is_error: true, result: 'Request failed', session_id: 'x' }),
    ]);
    expect(outcome).toEqual({ kind: 'rate-limited', message: 'Request failed', resetsAt: 1800000000 });
  });

  it('passes an output-limit stop reason through for the output-limit repair', () => {
    const { outcome } = parse([
      JSON.stringify({ type: 'result', is_error: false, result: 'partial', stop_reason: 'max_tokens', session_id: 'x' }),
    ]);
    expect(outcome).toMatchObject({ kind: 'completed', finishReason: 'max_tokens' });
  });

  it('reports other host errors with their message', () => {
    const { outcome } = parse([JSON.stringify({ type: 'result', is_error: true, subtype: 'error_during_execution', errors: ['tool crashed'] })]);
    expect(outcome).toEqual({ kind: 'host-error', message: 'tool crashed' });
  });
});

/*
 * Partial-message fixtures are built from the documented `--include-partial-messages`
 * shape (a `stream_event` envelope around a raw Messages API stream event); they are
 * not a recorded transcript.
 */
const blockStart = (parent: string | null = null): string =>
  JSON.stringify({ type: 'stream_event', parent_tool_use_id: parent, session_id: 's', event: { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } } });
const delta = (text: string, parent: string | null = null): string =>
  JSON.stringify({ type: 'stream_event', parent_tool_use_id: parent, session_id: 's', event: { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } } });
const assistantText = (text: string, parent: string | null = null): string =>
  JSON.stringify({ type: 'assistant', parent_tool_use_id: parent, session_id: 's', message: { role: 'assistant', content: [{ type: 'text', text }] } });
const assistantToolUse = (name: string): string =>
  JSON.stringify({ type: 'assistant', parent_tool_use_id: null, session_id: 's', message: { role: 'assistant', content: [{ type: 'tool_use', id: 'toolu_1', name, input: { command: 'ls' } }] } });

function textEvents(lines: string[]): { events: HostLiveEvent[]; parser: ClaudeStreamParser } {
  const events: HostLiveEvent[] = [];
  const parser = new ClaudeStreamParser((event) => events.push(event));
  for (const line of lines) parser.pushLine(line);
  return { events: events.filter((event) => event.kind === 'text'), parser };
}

describe('ClaudeStreamParser text deltas', () => {
  it('does not repeat streamed text when the whole block arrives', () => {
    const { events } = textEvents([blockStart(), delta('Hel'), delta('lo'), assistantText('Hello')]);
    expect(events).toEqual([
      { kind: 'text', text: 'Hel', newBlock: true },
      { kind: 'text', text: 'lo', newBlock: false },
    ]);
  });

  it('emits the missing suffix when deltas were lost', () => {
    const { events } = textEvents([blockStart(), delta('Hel'), assistantText('Hello')]);
    expect(events).toEqual([
      { kind: 'text', text: 'Hel', newBlock: true },
      { kind: 'text', text: 'lo', newBlock: false },
    ]);
  });

  it('emits a whole block when no deltas preceded it', () => {
    const { events } = textEvents([assistantText('Whole block')]);
    expect(events).toEqual([{ kind: 'text', text: 'Whole block', newBlock: true }]);
  });

  it('opens a new block after a tool call and still reports the tool call', () => {
    const all: HostLiveEvent[] = [];
    const parser = new ClaudeStreamParser((event) => all.push(event));
    for (const line of [
      blockStart(), delta('A'), assistantText('A'),
      assistantToolUse('Bash'),
      blockStart(), delta('B'), assistantText('B'),
    ]) parser.pushLine(line);
    expect(all).toEqual([
      { kind: 'text', text: 'A', newBlock: true },
      { kind: 'tool_call', toolName: 'Bash', command: 'ls' },
      { kind: 'text', text: 'B', newBlock: true },
    ]);
    expect(parser.partialText).toBe('A\n\nB');
  });

  it('keeps exactly the shown text as the partial reply', () => {
    const { parser } = textEvents([blockStart(), delta('Par'), delta('tial')]);
    expect(parser.partialText).toBe('Partial');
  });

  it('ignores subagent stream events', () => {
    const { events } = textEvents([blockStart('toolu_parent'), delta('sub', 'toolu_parent')]);
    expect(events).toEqual([]);
  });

  it('ignores malformed stream events without counting them as unparsed', () => {
    const { parser, events } = textEvents([
      JSON.stringify({ type: 'stream_event' }),
      JSON.stringify({ type: 'stream_event', event: { type: 'content_block_delta', delta: { type: 'input_json_delta', partial_json: '{' } } }),
      JSON.stringify({ type: 'stream_event', event: { type: 'content_block_delta', delta: { type: 'text_delta', text: 42 } } }),
    ]);
    expect(events).toEqual([]);
    expect(parser.finish('')).toEqual({ kind: 'malformed', detail: 'Host output had no result event.', stderrTail: '' });
  });
});

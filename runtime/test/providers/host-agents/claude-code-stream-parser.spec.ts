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
    expect(events).toContainEqual({ kind: 'text', text: 'hello\n\nDONE' });
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

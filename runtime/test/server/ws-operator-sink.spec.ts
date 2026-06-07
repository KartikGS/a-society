import { describe, expect, it } from 'vitest';
import { WebSocketOperatorSink } from '../../src/server/ws-operator-sink.js';

describe('ws-operator-sink', () => {
  it('forwards operator events verbatim', () => {
    const messages: unknown[] = [];
    const sink = new WebSocketOperatorSink((message) => messages.push(message));

    sink.emit({ kind: 'flow.completed' });

    expect(messages).toEqual([
      { type: 'operator_event', event: { kind: 'flow.completed' } },
    ]);
  });

  it('maps request lifecycle methods to protocol messages', () => {
    const messages: unknown[] = [];
    const sink = new WebSocketOperatorSink((message) => messages.push(message));

    sink.requestSent('owner', 'anthropic', 'claude-3-7-sonnet');
    sink.receivingResponse('owner');
    sink.responseEnd('owner');

    expect(messages).toEqual([
      { type: 'request_sent', role: 'owner', provider: 'anthropic', model: 'claude-3-7-sonnet' },
      { type: 'receiving_response', role: 'owner' },
      { type: 'response_end', role: 'owner' },
    ]);
  });
});

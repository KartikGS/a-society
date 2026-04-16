import assert from 'node:assert';
import { WebSocketOperatorSink } from '../src/ws-operator-sink.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

console.log('\nws-operator-sink');

test('emit forwards operator events verbatim', () => {
  const messages: unknown[] = [];
  const sink = new WebSocketOperatorSink((message) => messages.push(message));

  sink.emit({ kind: 'flow.completed' });

  assert.deepStrictEqual(messages, [
    { type: 'operator_event', event: { kind: 'flow.completed' } }
  ]);
});

test('startWait and stopWait map to protocol wait messages', () => {
  const messages: unknown[] = [];
  const sink = new WebSocketOperatorSink((message) => messages.push(message));

  sink.startWait('anthropic', 'claude-3-7-sonnet');
  sink.stopWait();

  assert.deepStrictEqual(messages, [
    { type: 'wait_start', provider: 'anthropic', model: 'claude-3-7-sonnet' },
    { type: 'wait_stop' }
  ]);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);

import assert from 'node:assert';
import { WebSocket } from 'ws';
import { SocketHub } from '../../src/server/socket-hub.js';

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

function fakeSocket(): WebSocket & { sent: unknown[] } {
  const socket = {
    readyState: WebSocket.OPEN,
    sent: [] as unknown[],
    send(payload: string) {
      this.sent.push(JSON.parse(payload));
    }
  };
  return socket as unknown as WebSocket & { sent: unknown[] };
}

console.log('\nsocket-hub');

test('send serializes messages to open sockets', () => {
  const hub = new SocketHub();
  const socket = fakeSocket();

  hub.send(socket, {
    type: 'flow_summaries',
    projectNamespace: 'demo',
    flows: []
  });

  assert.deepStrictEqual(socket.sent, [{
    type: 'flow_summaries',
    projectNamespace: 'demo',
    flows: []
  }]);
});

test('broadcastToFlow only sends to sockets subscribed to that flow', () => {
  const hub = new SocketHub();
  const matching = fakeSocket();
  const other = fakeSocket();
  const ref = { projectNamespace: 'demo', flowId: 'flow-1' };

  hub.add(matching);
  hub.add(other);
  hub.subscribe(matching, ref);
  hub.subscribe(other, { projectNamespace: 'demo', flowId: 'flow-2' });

  hub.broadcastToFlow(ref, {
    type: 'flow_state',
    flowRef: ref,
    flowRun: {} as any,
    backwardActive: [],
    hasActiveSession: false,
    contextUsageByRole: {}
  });

  assert.strictEqual(matching.sent.length, 1);
  assert.strictEqual(other.sent.length, 0);
});

test('remove drops subscriptions', () => {
  const hub = new SocketHub();
  const socket = fakeSocket();
  const ref = { projectNamespace: 'demo', flowId: 'flow-1' };

  hub.add(socket);
  hub.subscribe(socket, ref);
  hub.remove(socket);
  hub.broadcastToFlow(ref, {
    type: 'flow_summaries',
    projectNamespace: 'demo',
    flows: []
  });

  assert.deepStrictEqual(socket.sent, []);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);

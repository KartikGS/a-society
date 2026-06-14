import { describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import { SocketHub } from '../../src/server/socket-hub.js';
import type { FlowRun } from '../../src/common/types.js';

function fakeSocket(): WebSocket & { sent: unknown[] } {
  const sent: unknown[] = [];
  const socket = {
    readyState: WebSocket.OPEN,
    sent,
    send(payload: string) {
      sent.push(JSON.parse(payload) as unknown);
    },
  };
  return socket as unknown as WebSocket & { sent: unknown[] };
}

describe('socket-hub', () => {
  it('serializes messages to open sockets', () => {
    const hub = new SocketHub();
    const socket = fakeSocket();

    hub.send(socket, {
      type: 'flow_summaries',
      projectNamespace: 'demo',
      flows: [],
    });

    expect(socket.sent).toEqual([{
      type: 'flow_summaries',
      projectNamespace: 'demo',
      flows: [],
    }]);
  });

  it('only broadcasts to sockets subscribed to that flow', () => {
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
      flowRun: {} as FlowRun,
      backwardActive: [],
      hasActiveSession: false,
      contextUsageByRole: {},
      contextWindowByRole: {},
      roleConfigurations: {},
    });

    expect(matching.sent).toHaveLength(1);
    expect(other.sent).toHaveLength(0);
  });

  it('drops subscriptions when a socket is removed', () => {
    const hub = new SocketHub();
    const socket = fakeSocket();
    const ref = { projectNamespace: 'demo', flowId: 'flow-1' };

    hub.add(socket);
    hub.subscribe(socket, ref);
    hub.remove(socket);
    hub.broadcastToFlow(ref, {
      type: 'flow_summaries',
      projectNamespace: 'demo',
      flows: [],
    });

    expect(socket.sent).toEqual([]);
  });
});

import { WebSocket } from 'ws';
import { flowKey } from '../common/flow-ref.js';
import type { FlowRef } from '../common/types.js';
import type { ServerMessage } from './protocol.js';

export class SocketHub {
  private readonly clients = new Set<WebSocket>();
  private readonly subscriptions = new Map<WebSocket, string>();

  add(socket: WebSocket): void {
    this.clients.add(socket);
  }

  remove(socket: WebSocket): void {
    this.clients.delete(socket);
    this.subscriptions.delete(socket);
  }

  subscribe(socket: WebSocket, ref: FlowRef): void {
    this.subscriptions.set(socket, flowKey(ref));
  }

  send(socket: WebSocket, message: ServerMessage): void {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(message));
  }

  broadcastToFlow(ref: FlowRef, message: ServerMessage): void {
    const key = flowKey(ref);
    for (const socket of this.clients) {
      if (this.subscriptions.get(socket) === key) {
        this.send(socket, message);
      }
    }
  }

  forEachClient(callback: (socket: WebSocket) => void): void {
    for (const socket of this.clients) {
      callback(socket);
    }
  }
}

import { useEffect, useRef, useState } from 'react';
import type { ClientMessage, ServerMessage } from '../types';

interface UseWebSocketOptions {
  onMessage: (message: ServerMessage) => void;
}

export function useWebSocket(url: string, options: UseWebSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlerRef = useRef(options.onMessage);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const [connectionId, setConnectionId] = useState(0);

  useEffect(() => {
    messageHandlerRef.current = options.onMessage;
  }, [options.onMessage]);

  useEffect(() => {
    let disposed = false;
    let reconnectTimer: number | null = null;

    const connect = () => {
      if (disposed) return;

      setStatus('connecting');
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus('open');
        setConnectionId((current) => current + 1);
      };

      socket.onmessage = (event) => {
        try {
          messageHandlerRef.current(JSON.parse(event.data) as ServerMessage);
        } catch {
          // Ignore malformed payloads.
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      socket.onclose = () => {
        if (disposed) return;
        setStatus('closed');
        reconnectTimer = window.setTimeout(connect, 1000);
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }
      socketRef.current?.close();
    };
  }, [url]);

  function send(message: ClientMessage): void {
    if (socketRef.current?.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify(message));
  }

  return { send, status, connectionId };
}

import { useCallback, useEffect, useRef } from 'react';
import { buildWsUrl } from '../../../../shared/api/config';
import type { NotificationWsEvent } from '../types';

function wsUrl(path: string): string {
  const token = localStorage.getItem('access_token') ?? '';
  const base = buildWsUrl(path);
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}token=${encodeURIComponent(token)}`;
}

interface UseNotificationWebSocketOptions {
  enabled?: boolean;
  onEvent?: (event: NotificationWsEvent) => void;
}

export function useNotificationWebSocket({ enabled = true, onEvent }: UseNotificationWebSocketOptions = {}) {
  const socketRef = useRef<WebSocket | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled || !localStorage.getItem('access_token')) return undefined;

    const socket = new WebSocket(wsUrl('/ws/notifications/'));
    socketRef.current = socket;

    socket.onmessage = (raw) => {
      try {
        onEventRef.current?.(JSON.parse(raw.data as string) as NotificationWsEvent);
      } catch {
        /* ignore malformed payloads */
      }
    };

    const ping = window.setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    return () => {
      window.clearInterval(ping);
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener('open', () => socket.close(), { once: true });
      } else if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      socketRef.current = null;
    };
  }, [enabled]);

  const reconnect = useCallback(() => {
    socketRef.current?.close();
  }, []);

  return { reconnect };
}

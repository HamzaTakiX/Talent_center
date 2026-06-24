import { useEffect, useRef } from 'react';
import { buildWsUrl } from '../../../../shared/api/config';
import type { ChatWsEvent } from './useChatWebSocket';

function wsUrl(path: string): string {
  const token = localStorage.getItem('access_token') ?? '';
  const base = buildWsUrl(path);
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}token=${encodeURIComponent(token)}`;
}

interface UseChatPresenceWebSocketOptions {
  enabled?: boolean;
  onEvent?: (event: ChatWsEvent) => void;
}

/** User-wide chat presence socket for inbox unread counter updates. */
export function useChatPresenceWebSocket({ enabled = true, onEvent }: UseChatPresenceWebSocketOptions = {}) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled || !localStorage.getItem('access_token')) return undefined;

    const socket = new WebSocket(wsUrl('/ws/chat/presence/'));

    socket.onmessage = (raw) => {
      try {
        onEventRef.current?.(JSON.parse(raw.data as string) as ChatWsEvent);
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
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [enabled]);
}

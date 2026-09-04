import { useEffect, useRef } from 'react';

import { buildWsUrl } from '../../../../../shared/api/config';
import type { AgendaRealtimeEvent } from '../types';

function wsUrl(path: string): string {
  const token = localStorage.getItem('access_token') ?? '';
  const base = buildWsUrl(path);
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}token=${encodeURIComponent(token)}`;
}

interface UseAgendaRealtimeOptions {
  enabled?: boolean;
  onEvent?: (event: AgendaRealtimeEvent) => void;
}

/**
 * Subscribes to `/ws/agenda/`, the per-user group the backend broadcasts to.
 *
 * Frames carry an event id and an action, never event data — the caller
 * refetches through the REST API so visibility rules still decide what the
 * viewer actually gets.
 */
export function useAgendaRealtime({ enabled = true, onEvent }: UseAgendaRealtimeOptions = {}) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled || !localStorage.getItem('access_token')) return undefined;

    const socket = new WebSocket(wsUrl('/ws/agenda/'));

    socket.onmessage = (raw) => {
      try {
        const frame = JSON.parse(raw.data as string) as AgendaRealtimeEvent & {
          event_type?: string;
        };
        if (frame.event_type === 'agenda.event') {
          onEventRef.current?.(frame);
        }
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
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener('open', () => socket.close(), { once: true });
      } else if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [enabled]);
}

export default useAgendaRealtime;

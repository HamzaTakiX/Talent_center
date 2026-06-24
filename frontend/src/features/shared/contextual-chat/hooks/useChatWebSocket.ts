import { useCallback, useEffect, useRef, useState } from 'react';
import { buildWsUrl } from '../../../../shared/api/config';

export type ChatWsEventType =
  | 'connected'
  | 'message.created'
  | 'typing'
  | 'read_receipt'
  | 'presence'
  | 'conversation.updated'
  | 'inbox.updated'
  | 'pong';

export interface ChatWsEvent {
  event_type: ChatWsEventType | string;
  conversation_id?: number;
  user_id?: number;
  is_typing?: boolean;
  message_id?: number;
  sender_id?: number;
  body?: string;
  last_read_message_id?: number;
  online?: boolean;
  last_seen?: string | null;
  [key: string]: unknown;
}

interface UseChatWebSocketOptions {
  conversationId: number | null;
  enabled?: boolean;
  onEvent?: (event: ChatWsEvent) => void;
}

function wsUrl(path: string): string {
  const token = localStorage.getItem('access_token') ?? '';
  const base = buildWsUrl(path);
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}token=${encodeURIComponent(token)}`;
}

export function useChatWebSocket({
  conversationId,
  enabled = true,
  onEvent,
}: UseChatWebSocketOptions) {
  const [connected, setConnected] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [peerOnline, setPeerOnline] = useState<boolean | null>(null);
  const convSocketRef = useRef<WebSocket | null>(null);
  const presenceSocketRef = useRef<WebSocket | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const handleEvent = useCallback((event: ChatWsEvent) => {
    if (event.event_type === 'typing') {
      setPeerTyping(Boolean(event.is_typing));
      if (event.is_typing && typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
      if (event.is_typing) {
        typingTimerRef.current = window.setTimeout(() => setPeerTyping(false), 4000);
      }
    }
    if (event.event_type === 'presence') {
      setPeerOnline(Boolean(event.online));
    }
    onEventRef.current?.(event);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const presence = new WebSocket(wsUrl('/ws/chat/presence/'));
    presenceSocketRef.current = presence;
    presence.onopen = () => setConnected(true);
    presence.onclose = () => setConnected(false);
    presence.onmessage = (raw) => {
      try {
        handleEvent(JSON.parse(raw.data as string) as ChatWsEvent);
      } catch {
        /* ignore */
      }
    };

    const ping = window.setInterval(() => {
      if (presence.readyState === WebSocket.OPEN) {
        presence.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    return () => {
      window.clearInterval(ping);
      presence.close();
      presenceSocketRef.current = null;
    };
  }, [enabled, handleEvent]);

  useEffect(() => {
    if (!enabled || !conversationId) return undefined;

    const socket = new WebSocket(wsUrl(`/ws/chat/conversations/${conversationId}/`));
    convSocketRef.current = socket;

    socket.onmessage = (raw) => {
      try {
        handleEvent(JSON.parse(raw.data as string) as ChatWsEvent);
      } catch {
        /* ignore */
      }
    };

    const ping = window.setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    return () => {
      window.clearInterval(ping);
      socket.close();
      convSocketRef.current = null;
      setPeerTyping(false);
    };
  }, [conversationId, enabled, handleEvent]);

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      const socket = convSocketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      socket.send(JSON.stringify({ type: 'typing', is_typing: isTyping }));
    },
    []
  );

  return { connected, peerTyping, peerOnline, sendTyping };
}

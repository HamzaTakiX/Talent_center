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
  const typingTimerRef = useRef<number | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const subscribedConvIdRef = useRef<number | null>(null);
  subscribedConvIdRef.current = conversationId ?? null;

  const handleEvent = useCallback((event: ChatWsEvent) => {
    const subscribedId = subscribedConvIdRef.current;
    if (
      subscribedId != null &&
      event.conversation_id != null &&
      Number(event.conversation_id) !== Number(subscribedId) &&
      (event.event_type === 'message.created' ||
        event.event_type === 'inbox.updated' ||
        event.event_type === 'conversation.updated')
    ) {
      return;
    }

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
    if (!enabled || !conversationId) {
      setConnected(false);
      return undefined;
    }

    const socket = new WebSocket(wsUrl(`/ws/chat/conversations/${conversationId}/`));
    convSocketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
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
      setConnected(false);
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

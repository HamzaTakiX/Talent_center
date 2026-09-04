import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchMessages, sendChatMessage } from '../../../../shared/contextual-chat/api/chatApi';
import { useChatWebSocket } from '../../../../shared/contextual-chat/hooks/useChatWebSocket';
import type { StandardChatMessage } from '../../../../shared/chat-design-system';
import {
  buildTaskEntityRef,
  mapSupervisionMessage,
  messageRefsTask,
} from '../../../../shared/contextual-chat/utils/supervisionEntityChat';
import { studentEncadrantChatApi } from '../../chat/services/studentEncadrantChatApi';

export function useTaskChat(taskId: string, taskTitle: string, taskSubtitle?: string) {
  const taskRef = useMemo(
    () => buildTaskEntityRef(taskId, taskTitle, taskSubtitle),
    [taskId, taskTitle, taskSubtitle],
  );
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<StandardChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!taskId) return;
    if (!options?.silent) setLoading(true);
    setError(null);
    try {
      const opened = await studentEncadrantChatApi.openChat();
      setConversationId(opened.conversation_id);
      const items = await fetchMessages(opened.conversation_id);
      setMessages(
        items.filter((item) => messageRefsTask(item, taskId)).map(mapSupervisionMessage),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'chat_unavailable');
      setMessages([]);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void load();
  }, [load]);

  useChatWebSocket({
    conversationId,
    enabled: Boolean(conversationId),
    onEvent: (event) => {
      if (event.event_type === 'message.created') {
        void load({ silent: true });
      }
    },
  });

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || conversationId == null) return;
      const sent = await sendChatMessage(conversationId, trimmed, ['task'], undefined, [taskRef]);
      if (sent && messageRefsTask(sent, taskId)) {
        setMessages((current) => [...current.filter((item) => item.id !== String(sent.id)), mapSupervisionMessage(sent)]);
        return;
      }
      await load();
    },
    [conversationId, load, taskId, taskRef],
  );

  return { messages, sendMessage, loading, error, conversationId };
}

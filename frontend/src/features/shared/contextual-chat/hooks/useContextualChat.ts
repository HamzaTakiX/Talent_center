import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  AdminChatMessage,
  AdminChatParticipant,
} from '../../../admin/shared/admin-module-chat/adminChatTypes';
import {
  applySmartAction,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  sendChatMessage,
  sendTypingIndicator,
} from '../api/chatApi';
import type { ChatModule, ContextualChatFilters, ConversationDto, SmartActionCode } from '../types';
import {
  buildMessagesByConv,
  mapConversationToParticipant,
  mapConversationsToParticipants,
  mapMessagesToAdmin,
} from '../utils/mapToAdminChat';

export type ChatDataSource = 'loading' | 'live' | 'mock' | 'live_empty';

export interface UseContextualChatOptions {
  module: ChatModule;
  mockParticipants: AdminChatParticipant[];
  mockMessages: Record<string, AdminChatMessage[]>;
  /** Fallback to mocks only when the API request fails (network, 401, 500). */
  useMockOnError?: boolean;
  enableApi?: boolean;
}

export function useContextualChat({
  module,
  mockParticipants,
  mockMessages,
  useMockOnError = false,
  enableApi = true,
}: UseContextualChatOptions) {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(Boolean(enableApi));
  const [dataSource, setDataSource] = useState<ChatDataSource>(enableApi ? 'loading' : 'mock');
  const [apiError, setApiError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [participants, setParticipants] = useState<AdminChatParticipant[]>(mockParticipants);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, AdminChatMessage[]>>(mockMessages);
  const [filters, setFilters] = useState<ContextualChatFilters>({});

  const applyMockData = useCallback(() => {
    setDataSource('mock');
    setParticipants(mockParticipants);
    setMessagesByConv(mockMessages);
    setConversations([]);
    setApiError(null);
  }, [mockMessages, mockParticipants]);

  const loadConversations = useCallback(async () => {
    if (!enableApi) {
      applyMockData();
      setLoading(false);
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      const items = await fetchConversations(module, filters);
      if (items.length === 0) {
        setDataSource('live_empty');
        setConversations([]);
        setParticipants([]);
        setMessagesByConv({});
      } else {
        setDataSource('live');
        setConversations(items);
        setParticipants(mapConversationsToParticipants(items, i18n.language));
        setMessagesByConv(buildMessagesByConv(items, {}));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'chat_api_error';
      setApiError(message);
      if (useMockOnError) {
        applyMockData();
      } else {
        setDataSource('live_empty');
        setParticipants([]);
        setMessagesByConv({});
      }
    } finally {
      setLoading(false);
    }
  }, [applyMockData, enableApi, filters, i18n.language, mockMessages, mockParticipants, module, useMockOnError]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const usingMock = dataSource === 'mock';

  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (usingMock || !enableApi) return;
      const id = Number(conversationId);
      if (!Number.isFinite(id)) return;
      try {
        const msgs = await fetchMessages(id);
        const mapped = mapMessagesToAdmin(msgs, i18n.language);
        setMessagesByConv((prev) => ({ ...prev, [conversationId]: mapped }));
        const last = msgs[msgs.length - 1];
        if (last) await markConversationRead(id, last.id);
      } catch {
        /* keep existing */
      }
    },
    [enableApi, i18n.language, usingMock]
  );

  const sendMessage = useCallback(
    async (conversationId: string, text: string, tagCodes?: string[]) => {
      if (usingMock || !enableApi) return false;
      const id = Number(conversationId);
      if (!Number.isFinite(id)) return false;
      const sent = await sendChatMessage(id, text, tagCodes);
      if (!sent) return false;
      const mapped = mapMessagesToAdmin([sent], i18n.language);
      setMessagesByConv((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), ...mapped],
      }));
      await markConversationRead(id, sent.id);
      return true;
    },
    [enableApi, i18n.language, usingMock]
  );

  const runSmartAction = useCallback(
    async (conversationId: string, action: SmartActionCode) => {
      if (usingMock) return false;
      return applySmartAction(Number(conversationId), action);
    },
    [usingMock]
  );

  const selectedConversation = useCallback(
    (id: string): ConversationDto | undefined => conversations.find((c) => String(c.id) === id),
    [conversations]
  );

  const selectedParticipant = useCallback(
    (id: string): AdminChatParticipant | undefined => participants.find((p) => p.id === id),
    [participants]
  );

  const notifyTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (usingMock || !enableApi) return;
      void sendTypingIndicator(Number(conversationId), isTyping);
    },
    [enableApi, usingMock]
  );

  const conversationMeta = useMemo(() => {
    const map: Record<string, ConversationDto> = {};
    for (const c of conversations) map[String(c.id)] = c;
    return map;
  }, [conversations]);

  return {
    loading,
    dataSource,
    usingMock,
    apiError,
    participants,
    messagesByConv,
    filters,
    setFilters,
    loadConversations,
    loadMessages,
    sendMessage,
    runSmartAction,
    selectedConversation,
    selectedParticipant,
    notifyTyping,
    conversationMeta,
    mapConversationToParticipant: (c: ConversationDto) =>
      mapConversationToParticipant(c, i18n.language),
  };
}

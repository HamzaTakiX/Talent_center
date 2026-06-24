import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applySmartAction,
  fetchConversation,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  sendChatMessage,
} from '../../../../shared/contextual-chat/api/chatApi';
import { useChatWebSocket } from '../../../../shared/contextual-chat/hooks/useChatWebSocket';
import type { ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
import {
  patchConversationPreviewInList,
  sortConversationsByRecent,
} from '../../../../admin/offres-stage/chat/utils/internshipChatConversationUtils';
import { applyReadReceiptToMessages } from '../../../../admin/offres-stage/chat/utils/internshipChatReadUtils';
import {
  isPendingLocalMessage,
  mergeServerMessages,
  withClientNonce,
} from '../../../../admin/offres-stage/chat/utils/internshipChatMessageUtils';
import { studentAnnouncementsApi } from '../../api/studentAnnouncementsApi';
import {
  EMPTY_STUDENT_ANNOUNCEMENT_FILTERS,
  type StudentAnnouncementInboxFilters,
  type StudentAnnouncementPrimaryFilter,
  type StudentAnnouncementPriority,
} from '../types/studentAnnouncementChatTypes';
import {
  applyStudentAnnouncementModuleFilters,
  collectStudentAnnouncementTypeOptions,
  computeStudentAnnouncementPrimaryFilterCounts,
  patchStudentConversationArchiveState,
} from '../utils/studentAnnouncementChatUtils';
import {
  mapAnnouncementConversation,
  type StudentAnnouncementConversation,
  type StudentAnnouncementMessage,
} from '../utils/studentAnnouncementChatMappers';

function mapStudentMessage(m: MessageDto): StudentAnnouncementMessage {
  const otherReads = (m.read_by ?? []).filter(
    (receipt) => m.sender_id == null || receipt.user_id !== m.sender_id,
  );
  const isRead = m.is_own && (m.delivery_status === 'read' || otherReads.length > 0);
  const latestRead = [...otherReads].sort(
    (a, b) => new Date(b.read_at).getTime() - new Date(a.read_at).getTime(),
  )[0];
  return {
    id: String(m.id),
    direction: m.is_own ? 'out' : 'in',
    text: m.body,
    time: new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(m.created_at)),
    deliveryStatus: m.is_own
      ? isRead
        ? 'read'
        : m.delivery_status === 'sent'
          ? 'sent'
          : 'delivered'
      : undefined,
    seenTime: latestRead?.read_at
      ? new Intl.DateTimeFormat('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date(latestRead.read_at))
      : undefined,
  };
}

export function useStudentAnnouncementChat() {
  const [rawConversations, setRawConversations] = useState<ConversationDto[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<number, MessageDto[]>>({});
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<StudentAnnouncementInboxFilters>({
    ...EMPTY_STUDENT_ANNOUNCEMENT_FILTERS,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [messagesLoadingId, setMessagesLoadingId] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [archiveOverrideVersion, setArchiveOverrideVersion] = useState(0);
  const typingDebounceRef = useRef<number | null>(null);
  const messagesByConvRef = useRef(messagesByConv);
  messagesByConvRef.current = messagesByConv;
  const rawConversationsRef = useRef(rawConversations);
  rawConversationsRef.current = rawConversations;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const loadConversationsDebounceRef = useRef<number | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const archiveOverridesRef = useRef<Map<number, boolean>>(new Map());

  const syncArchiveOverride = useCallback((conversationId: number, archived: boolean | null) => {
    if (archived === null) {
      archiveOverridesRef.current.delete(conversationId);
    } else {
      archiveOverridesRef.current.set(conversationId, archived);
    }
    setArchiveOverrideVersion((version) => version + 1);
  }, []);

  const selectedConversationId = selectedId ? Number(selectedId) : null;

  const loadConversations = useCallback(async (options?: { silent?: boolean }) => {
    const isInitialLoad = rawConversationsRef.current.length === 0;
    if (!options?.silent && isInitialLoad) setLoading(true);
    setLoadError(null);
    try {
      const { unread, urgent } = filtersRef.current;
      const items = await fetchConversations('announcements', {
        unreadOnly: unread ? true : undefined,
        includeArchived: true,
        urgency: urgent ? 'HIGH' : undefined,
      });
      const merged = sortConversationsByRecent(
        items.map((conversation) => {
          const override = archiveOverridesRef.current.get(Number(conversation.id));
          if (override === undefined) return conversation;
          return { ...conversation, is_archived: override };
        }),
      );
      setRawConversations(merged);
    } catch (err) {
      if (!options?.silent) {
        setLoadError(err instanceof Error ? err.message : 'Erreur de chargement');
        if (isInitialLoad) setRawConversations([]);
      }
    } finally {
      if (!options?.silent && isInitialLoad) setLoading(false);
    }
  }, []);

  const loadConversationsRef = useRef(loadConversations);
  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  const scheduleSilentReload = useCallback((delayMs = 400) => {
    if (archiveOverridesRef.current.size > 0) return;
    if (loadConversationsDebounceRef.current) {
      window.clearTimeout(loadConversationsDebounceRef.current);
    }
    loadConversationsDebounceRef.current = window.setTimeout(() => {
      loadConversationsDebounceRef.current = null;
      void loadConversationsRef.current({ silent: true });
    }, delayMs);
  }, []);

  const refreshMessagesRef = useRef<
    (id: number, options?: { silent?: boolean }) => Promise<void>
  >(async () => undefined);

  const { peerTyping, sendTyping: sendWsTyping } = useChatWebSocket({
    conversationId:
      selectedConversationId != null && Number.isFinite(selectedConversationId)
        ? selectedConversationId
        : null,
    enabled: true,
    onEvent: (event) => {
      if (event.event_type === 'message.created' && event.conversation_id) {
        const convId = event.conversation_id;
        const isActiveConv = convId === Number(selectedIdRef.current);
        const cached = messagesByConvRef.current[convId] ?? [];
        const messageId = event.message_id;
        const hasMessage = messageId != null && cached.some((m) => m.id === messageId);
        const hasPendingOwn = cached.some(
          (message) => message.is_own && isPendingLocalMessage(message),
        );
        if (hasPendingOwn) return;

        if (typeof event.body === 'string' && event.body.trim()) {
          const existing = rawConversationsRef.current.find((c) => c.id === convId);
          setRawConversations((prev) =>
            patchConversationPreviewInList(prev, convId, event.body!, {
              isOwn: false,
              unreadCount: isActiveConv ? 0 : (existing?.unread_count ?? 0) + 1,
            }),
          );
        }

        if (!hasMessage) {
          void refreshMessagesRef.current(convId, { silent: true });
        }
        if (isActiveConv && messageId != null && Number.isFinite(Number(messageId))) {
          void markConversationRead(convId, Number(messageId));
        }
        return;
      }
      if (
        event.event_type === 'inbox.updated' ||
        event.event_type === 'conversation.updated'
      ) {
        if (
          event.conversation_id &&
          event.conversation_id === Number(selectedIdRef.current) &&
          event.event_type === 'conversation.updated'
        ) {
          void refreshMessagesRef.current(event.conversation_id, { silent: true });
        }
        scheduleSilentReload();
      }
      if (
        event.event_type === 'read_receipt' &&
        event.conversation_id &&
        event.user_id != null &&
        event.last_read_message_id != null
      ) {
        const convId = event.conversation_id;
        const readerUserId = Number(event.user_id);
        const lastReadMessageId = Number(event.last_read_message_id);
        const readAt =
          typeof event.read_at === 'string' ? event.read_at : new Date().toISOString();
        if (!Number.isFinite(readerUserId) || !Number.isFinite(lastReadMessageId)) return;

        setMessagesByConv((prev) => {
          const existing = prev[convId] ?? [];
          const next = {
            ...prev,
            [convId]: applyReadReceiptToMessages(
              existing,
              readerUserId,
              lastReadMessageId,
              readAt,
            ),
          };
          messagesByConvRef.current = next;
          return next;
        });
      }
    },
  });

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const { unread, urgent } = filters;
    if (unread || urgent) {
      void loadConversations({ silent: true });
    }
  }, [filters.unread, filters.urgent, loadConversations]);

  useEffect(
    () => () => {
      if (loadConversationsDebounceRef.current) {
        window.clearTimeout(loadConversationsDebounceRef.current);
      }
    },
    [],
  );

  const loadMessagesFor = useCallback(async (conversationId: number, options?: { silent?: boolean }) => {
    const hasCached = (messagesByConvRef.current[conversationId]?.length ?? 0) > 0;
    if (!options?.silent && !hasCached) {
      setMessagesLoadingId(conversationId);
    }
    try {
      const msgs = await fetchMessages(conversationId);
      setMessagesByConv((prev) => {
        const merged = mergeServerMessages(prev[conversationId] ?? [], msgs);
        const next = { ...prev, [conversationId]: merged };
        messagesByConvRef.current = next;
        return next;
      });
      const last = msgs[msgs.length - 1];
      if (last) {
        await markConversationRead(conversationId, last.id);
        setRawConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c)),
        );
      }
    } finally {
      if (!options?.silent && !hasCached) {
        setMessagesLoadingId(null);
      }
    }
  }, []);

  useEffect(() => {
    refreshMessagesRef.current = loadMessagesFor;
  }, [loadMessagesFor]);

  const openConversationById = useCallback(
    async (id: string) => {
      setSelectedId(id);
      setMobileView('chat');
      const numId = Number(id);
      if (!Number.isFinite(numId)) return;
      setConversationLoading(true);
      try {
        if (!messagesByConvRef.current[numId]?.length) {
          await loadMessagesFor(numId);
        }
        const dto = await fetchConversation(numId);
        if (dto) {
          setRawConversations((prev) => {
            const exists = prev.some((c) => Number(c.id) === numId);
            if (exists) {
              return prev.map((c) => (Number(c.id) === numId ? dto : c));
            }
            return [dto, ...prev];
          });
        }
      } finally {
        setConversationLoading(false);
      }
    },
    [loadMessagesFor],
  );

  const openConversationForAnnouncement = useCallback(
    async (announcementUuid: string) => {
      setConversationLoading(true);
      setMobileView('chat');
      try {
        const result = await studentAnnouncementsApi.createChat(announcementUuid);
        await openConversationById(String(result.conversation_id));
        await loadConversations({ silent: true });
      } finally {
        setConversationLoading(false);
      }
    },
    [openConversationById, loadConversations],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const numId = Number(selectedId);
      if (!Number.isFinite(numId) || !text.trim()) return;

      const optimisticId = `local-${Date.now()}`;
      const optimistic: MessageDto = withClientNonce(
        {
          id: optimisticId as unknown as number,
          conversation_id: numId,
          sender_id: null,
          sender_name: '',
          body: text.trim(),
          message_type: 'TEXT',
          created_at: new Date().toISOString(),
          tags: [],
          is_own: true,
          metadata_json: {},
        },
        optimisticId,
      );

      setMessagesByConv((prev) => {
        const next = { ...prev, [numId]: [...(prev[numId] ?? []), optimistic] };
        messagesByConvRef.current = next;
        return next;
      });

      sendWsTyping(false);

      try {
        const saved = await sendChatMessage(numId, text.trim());
        if (!saved) return;
        setMessagesByConv((prev) => {
          const existing = prev[numId] ?? [];
          const pendingIndex = existing.findIndex(
            (message) =>
              isPendingLocalMessage(message) &&
              (message.metadata_json?.client_nonce === optimisticId ||
                String(message.id) === optimisticId),
          );
          const savedWithNonce = withClientNonce(saved, optimisticId);
          let nextList: MessageDto[];
          if (pendingIndex >= 0) {
            nextList = [...existing];
            nextList[pendingIndex] = savedWithNonce;
          } else if (existing.some((message) => message.id === saved.id)) {
            nextList = existing.map((message) =>
              message.id === saved.id ? withClientNonce(message, optimisticId) : message,
            );
          } else {
            nextList = [...existing, savedWithNonce];
          }
          const next = { ...prev, [numId]: nextList };
          messagesByConvRef.current = next;
          return next;
        });
        setRawConversations((prev) =>
          patchConversationPreviewInList(prev, numId, saved.body, {
            isOwn: true,
            unreadCount: 0,
            at: saved.created_at,
          }),
        );
        void markConversationRead(numId, saved.id);
      } catch {
        setMessagesByConv((prev) => {
          const next = {
            ...prev,
            [numId]: (prev[numId] ?? []).filter(
              (message) =>
                !(
                  isPendingLocalMessage(message) &&
                  message.metadata_json?.client_nonce === optimisticId
                ),
            ),
          };
          messagesByConvRef.current = next;
          return next;
        });
      }
    },
    [selectedId, sendWsTyping],
  );

  const notifyTyping = useCallback(
    (isTyping: boolean) => {
      if (typingDebounceRef.current) {
        window.clearTimeout(typingDebounceRef.current);
        typingDebounceRef.current = null;
      }
      sendWsTyping(isTyping);
      if (isTyping) {
        typingDebounceRef.current = window.setTimeout(() => sendWsTyping(false), 2500);
      }
    },
    [sendWsTyping],
  );

  const conversations: StudentAnnouncementConversation[] = useMemo(() => {
    return rawConversations
      .map((dto) => {
        const msgs = (messagesByConv[Number(dto.id)] ?? [])
          .filter((m) => m.message_type !== 'EVENT' && m.message_type !== 'SYSTEM')
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map(mapStudentMessage);
        const conv = mapAnnouncementConversation(dto, msgs);
        const override = archiveOverridesRef.current.get(Number(dto.id));
        if (override === undefined) return conv;
        return { ...conv, archived: override };
      })
      .sort((a, b) => {
        const aMs = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bMs = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bMs - aMs;
      });
  }, [archiveOverrideVersion, messagesByConv, rawConversations]);

  const primaryFilterCounts = useMemo(
    () => computeStudentAnnouncementPrimaryFilterCounts(conversations),
    [conversations],
  );

  const announcementTypeOptions = useMemo(
    () => collectStudentAnnouncementTypeOptions(conversations),
    [conversations],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((conversation) => {
      if (!applyStudentAnnouncementModuleFilters(conversation, filters)) return false;
      if (!q) return true;
      return (
        conversation.announcementTitle.toLowerCase().includes(q) ||
        conversation.announcementType.toLowerCase().includes(q) ||
        conversation.companyName.toLowerCase().includes(q) ||
        conversation.lastMessage.toLowerCase().includes(q)
      );
    });
  }, [conversations, filters, search]);

  const hasActiveFilters =
    filters.primary !== 'all' ||
    filters.unread ||
    filters.urgent ||
    filters.announcementTypes.length > 0 ||
    filters.priorities.length > 0;

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  );

  const messagesLoading = useMemo(() => {
    if (messagesLoadingId == null || !selectedId) return false;
    return Number(selectedId) === messagesLoadingId;
  }, [messagesLoadingId, selectedId]);

  const setPrimaryFilter = useCallback((primary: StudentAnnouncementPrimaryFilter) => {
    setFilters((prev) => ({ ...prev, primary }));
  }, []);

  const toggleAnnouncementTypeFilter = useCallback((value: string) => {
    setFilters((prev) => {
      const next = prev.announcementTypes.includes(value)
        ? prev.announcementTypes.filter((item) => item !== value)
        : [...prev.announcementTypes, value];
      return { ...prev, announcementTypes: next };
    });
  }, []);

  const togglePriorityFilter = useCallback((value: StudentAnnouncementPriority) => {
    setFilters((prev) => {
      const next = prev.priorities.includes(value)
        ? prev.priorities.filter((item) => item !== value)
        : [...prev.priorities, value];
      return { ...prev, priorities: next };
    });
  }, []);

  const toggleQuickFilter = useCallback((key: 'unread' | 'urgent') => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...EMPTY_STUDENT_ANNOUNCEMENT_FILTERS });
  }, []);

  const archiveConversation = useCallback(
    async (id: string) => {
      const conversationId = Number(id);
      if (!Number.isFinite(conversationId)) return;

      syncArchiveOverride(conversationId, true);
      setRawConversations((prev) => {
        const next = patchStudentConversationArchiveState(prev, conversationId, true);
        rawConversationsRef.current = next;
        return next;
      });
      setSelectedId((prev) => (prev === id ? '' : prev));
      setMobileView('list');

      try {
        await applySmartAction(conversationId, 'archive_conversation');
        syncArchiveOverride(conversationId, null);
        scheduleSilentReload(500);
      } catch {
        syncArchiveOverride(conversationId, null);
        setRawConversations((prev) => {
          const next = patchStudentConversationArchiveState(prev, conversationId, false);
          rawConversationsRef.current = next;
          return next;
        });
      }
    },
    [scheduleSilentReload, syncArchiveOverride],
  );

  const unarchiveConversation = useCallback(
    async (id: string) => {
      const conversationId = Number(id);
      if (!Number.isFinite(conversationId)) return;

      syncArchiveOverride(conversationId, false);
      setRawConversations((prev) => {
        const next = patchStudentConversationArchiveState(prev, conversationId, false);
        rawConversationsRef.current = next;
        return next;
      });

      if (filtersRef.current.primary === 'archived') {
        setFilters((prev) => ({ ...prev, primary: 'all' }));
      }

      try {
        await applySmartAction(conversationId, 'unarchive_conversation');
        syncArchiveOverride(conversationId, null);
        scheduleSilentReload(500);
      } catch {
        syncArchiveOverride(conversationId, null);
        setRawConversations((prev) => {
          const next = patchStudentConversationArchiveState(prev, conversationId, true);
          rawConversationsRef.current = next;
          return next;
        });
      }
    },
    [scheduleSilentReload, syncArchiveOverride],
  );

  return {
    conversations: filtered,
    allConversations: conversations,
    selected,
    selectedId,
    filters,
    search,
    loading,
    loadError,
    conversationLoading,
    messagesLoading,
    mobileView,
    unreadTotal,
    primaryFilterCounts,
    announcementTypeOptions,
    hasActiveFilters,
    peerTyping,
    setSearch,
    setMobileView,
    setPrimaryFilter,
    toggleAnnouncementTypeFilter,
    togglePriorityFilter,
    toggleQuickFilter,
    clearFilters,
    openConversationById,
    openConversationForAnnouncement,
    sendMessage,
    notifyTyping,
    archiveConversation,
    unarchiveConversation,
    refresh: loadConversations,
  };
}

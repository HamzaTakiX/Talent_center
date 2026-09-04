import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applySmartAction,
  fetchConversation,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  sendChatMessage,
} from '../../../../shared/contextual-chat/api/chatApi';
import { useChatUnread } from '../../../../shared/contextual-chat/context/ChatUnreadContext';
import { useChatWebSocket } from '../../../../shared/contextual-chat/hooks/useChatWebSocket';
import type { ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
import {
  applyIncomingMessageUnreadPreview,
  patchConversationPreviewInList,
  sortConversationsByRecent,
  zeroConversationUnreadInList,
} from '../../../../admin/offres-stage/chat/utils/internshipChatConversationUtils';
import { applyReadReceiptToMessages } from '../../../../admin/offres-stage/chat/utils/internshipChatReadUtils';
import {
  isPendingLocalMessage,
  mergeServerMessages,
  withClientNonce,
} from '../../../../admin/offres-stage/chat/utils/internshipChatMessageUtils';
import { mapAnnouncementMessages } from '../../../../admin/announcements-stage/chat/utils/announcementChatMappers';
import { useAuth } from '../../../../auth/hooks/useAuth';
import { studentDocumentsApi } from '../../api/studentDocumentsApi';
import {
  EMPTY_STUDENT_DOCUMENT_FILTERS,
  type StudentDocumentInboxFilters,
  type StudentDocumentPrimaryFilter,
} from '../types/studentDocumentChatTypes';
import {
  applyStudentDocumentModuleFilters,
  computeStudentDocumentPrimaryFilterCounts,
  patchStudentDocumentConversationArchiveState,
} from '../utils/studentDocumentChatUtils';
import {
  mapDocumentConversation,
  type StudentDocumentConversation,
  type StudentDocumentMessage,
} from '../utils/studentDocumentChatMappers';
import {
  buildOptimisticMessageAttachments,
  resolveOptimisticMessageType,
  revokeMessageAttachmentUrls,
} from '../../../../shared/contextual-chat/utils/mapMessageAttachments';

export function useStudentDocumentChat() {
  const { user } = useAuth();
  const { refresh: refreshChatUnread } = useChatUnread();
  const currentUserId = user?.id ?? null;
  const [rawConversations, setRawConversations] = useState<ConversationDto[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<number, MessageDto[]>>({});
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<StudentDocumentInboxFilters>({
    ...EMPTY_STUDENT_DOCUMENT_FILTERS,
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
  const seenWsMessageIdsRef = useRef<Set<number>>(new Set());

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
      const { unread } = filtersRef.current;
      const items = await fetchConversations('documents', {
        unreadOnly: unread ? true : undefined,
        includeArchived: true,
      });
      const merged = sortConversationsByRecent(
        items.map((conversation) => {
          const override = archiveOverridesRef.current.get(Number(conversation.id));
          if (override === undefined) return conversation;
          return { ...conversation, is_archived: override };
        }),
      );
      setRawConversations(merged);
      seenWsMessageIdsRef.current.clear();
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
          setRawConversations((prev) =>
            applyIncomingMessageUnreadPreview(prev, convId, event.body!, {
              isActiveConv,
              isOwn: false,
              messageId: messageId != null ? Number(messageId) : null,
              seenMessageIds: seenWsMessageIdsRef.current,
            }),
          );
        }

        if (!hasMessage) {
          void refreshMessagesRef.current(convId, { silent: true });
        }
        if (isActiveConv && messageId != null && Number.isFinite(Number(messageId))) {
          void markConversationRead(convId, Number(messageId)).then(() => {
            void refreshChatUnread();
          });
        }
        scheduleSilentReload();
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

        if (currentUserId != null && readerUserId === currentUserId) {
          setRawConversations((prev) => zeroConversationUnreadInList(prev, convId));
        }

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
    if (filters.unread) {
      void loadConversations({ silent: true });
    }
  }, [filters.unread, loadConversations]);

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
        setRawConversations((prev) => zeroConversationUnreadInList(prev, conversationId));
        void refreshChatUnread();
      }
    } finally {
      if (!options?.silent && !hasCached) {
        setMessagesLoadingId(null);
      }
    }
  }, [refreshChatUnread]);

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

  const openConversationForService = useCallback(
    async (serviceId: string) => {
      setConversationLoading(true);
      setMobileView('chat');
      try {
        const result = await studentDocumentsApi.createChat(serviceId);
        await openConversationById(String(result.conversation_id));
        await loadConversations({ silent: true });
      } finally {
        setConversationLoading(false);
      }
    },
    [openConversationById, loadConversations],
  );

  const sendMessage = useCallback(
    async (text: string, files?: File[], tagCodes?: string[], entityRefs?: import('../../../../shared/contextual-chat/types/chatEntityTypes').ChatEntityReference[]) => {
      const numId = Number(selectedId);
      if (!Number.isFinite(numId) || (!text.trim() && !files?.length)) return;

      const trimmed = text.trim();
      const optimisticId = `local-${Date.now()}`;
      const optimistic: MessageDto = withClientNonce(
        {
          id: optimisticId as unknown as number,
          conversation_id: numId,
          sender_id: null,
          sender_name: '',
          body: trimmed || (files?.[0] ? `📎 ${files[0].name}` : ''),
          message_type: resolveOptimisticMessageType(files ?? [], trimmed),
          created_at: new Date().toISOString(),
          tags: [],
          is_own: true,
          metadata_json: {},
          attachments: files?.length ? buildOptimisticMessageAttachments(files) : undefined,
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
        const saved = await sendChatMessage(numId, trimmed, tagCodes, files, entityRefs);
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
            revokeMessageAttachmentUrls(existing[pendingIndex]);
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
        void markConversationRead(numId, saved.id).then(() => {
          void refreshChatUnread();
        });
      } catch {
        setMessagesByConv((prev) => {
          const next = {
            ...prev,
            [numId]: (prev[numId] ?? []).filter((message) => {
              const isTarget =
                isPendingLocalMessage(message) &&
                message.metadata_json?.client_nonce === optimisticId;
              if (isTarget) revokeMessageAttachmentUrls(message);
              return !isTarget;
            }),
          };
          messagesByConvRef.current = next;
          return next;
        });
      }
    },
    [selectedId, sendWsTyping, refreshChatUnread],
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

  const conversations: StudentDocumentConversation[] = useMemo(() => {
    return rawConversations
      .map((dto) => {
        const studentUserId = dto.context?.student_user_id ?? currentUserId;
        const msgs = (messagesByConv[Number(dto.id)] ?? []).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        const mappedMsgs = mapAnnouncementMessages(
          msgs,
          studentUserId,
          'student',
        ) as StudentDocumentMessage[];
        const conv = mapDocumentConversation(dto, mappedMsgs);
        const override = archiveOverridesRef.current.get(Number(dto.id));
        if (override === undefined) return conv;
        return { ...conv, archived: override };
      })
      .sort((a, b) => {
        const aMs = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bMs = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bMs - aMs;
      });
  }, [archiveOverrideVersion, currentUserId, messagesByConv, rawConversations]);

  const primaryFilterCounts = useMemo(
    () => computeStudentDocumentPrimaryFilterCounts(conversations),
    [conversations],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((conversation) => {
      if (!applyStudentDocumentModuleFilters(conversation, filters)) return false;
      if (!q) return true;
      return (
        conversation.serviceName.toLowerCase().includes(q) ||
        conversation.serviceCode.toLowerCase().includes(q) ||
        conversation.category.toLowerCase().includes(q) ||
        conversation.lastMessage.toLowerCase().includes(q)
      );
    });
  }, [conversations, filters, search]);

  const hasActiveFilters = filters.primary !== 'all' || filters.unread;

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const unreadTotal = useMemo(
    () =>
      conversations
        .filter((c) => !c.archived)
        .reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  );

  const messagesLoading = useMemo(() => {
    if (messagesLoadingId == null || !selectedId) return false;
    return Number(selectedId) === messagesLoadingId;
  }, [messagesLoadingId, selectedId]);

  const setPrimaryFilter = useCallback((primary: StudentDocumentPrimaryFilter) => {
    setFilters((prev) => ({ ...prev, primary }));
  }, []);

  const toggleQuickFilter = useCallback((key: 'unread') => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...EMPTY_STUDENT_DOCUMENT_FILTERS });
  }, []);

  const archiveConversation = useCallback(
    async (id: string) => {
      const conversationId = Number(id);
      if (!Number.isFinite(conversationId)) return;

      syncArchiveOverride(conversationId, true);
      setRawConversations((prev) => {
        const next = patchStudentDocumentConversationArchiveState(prev, conversationId, true);
        rawConversationsRef.current = next;
        return next;
      });
      if (filtersRef.current.primary !== 'archived') {
        setFilters((prev) => ({ ...prev, primary: 'archived' }));
      }

      try {
        await applySmartAction(conversationId, 'archive_conversation');
        syncArchiveOverride(conversationId, null);
        scheduleSilentReload(500);
      } catch {
        syncArchiveOverride(conversationId, null);
        setRawConversations((prev) => {
          const next = patchStudentDocumentConversationArchiveState(prev, conversationId, false);
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
        const next = patchStudentDocumentConversationArchiveState(prev, conversationId, false);
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
          const next = patchStudentDocumentConversationArchiveState(prev, conversationId, true);
          rawConversationsRef.current = next;
          return next;
        });
      }
    },
    [scheduleSilentReload, syncArchiveOverride],
  );

  return {
    conversations: filtered,
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
    hasActiveFilters,
    peerTyping,
    setSearch,
    setMobileView,
    setPrimaryFilter,
    toggleQuickFilter,
    clearFilters,
    openConversationById,
    openConversationForService,
    sendMessage,
    notifyTyping,
    archiveConversation,
    unarchiveConversation,
  };
}

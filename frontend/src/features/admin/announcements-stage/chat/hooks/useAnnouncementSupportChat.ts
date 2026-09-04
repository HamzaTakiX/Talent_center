import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applySmartAction,
  fetchConversations,
  fetchMessages,
  fetchModuleChatMetrics,
  markConversationRead,
  sendChatMessage,
} from '../../../../shared/contextual-chat/api/chatApi';
import type { ChatMetricsDto } from '../../../../shared/contextual-chat/api/chatApi';
import { useChatUnread } from '../../../../shared/contextual-chat/context/ChatUnreadContext';
import { useChatWebSocket } from '../../../../shared/contextual-chat/hooks/useChatWebSocket';
import type { ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
import { useAuth } from '../../../../auth/hooks/useAuth';
import { useStudentAcademicChatFilterState } from '../../../shared/chat-filters/useStudentAcademicChatFilterState';
import {
  applyIncomingMessageUnreadPreview,
  mergeFetchedConversations,
  patchConversationArchiveState,
  patchConversationPreviewInList,
  zeroConversationUnreadInList,
} from '../../../offres-stage/chat/utils/internshipChatConversationUtils';
import { applyReadReceiptToMessages } from '../../../offres-stage/chat/utils/internshipChatReadUtils';
import {
  isPendingLocalMessage,
  mergeServerMessages,
  withClientNonce,
} from '../../../offres-stage/chat/utils/internshipChatMessageUtils';
import type {
  AnnouncementConversation,
  AnnouncementInboxFilters,
  AnnouncementMessage,
  InboxStats,
  PrimaryAnnouncementFilter,
  PrimaryFilterCounts,
} from '../types/announcementChatTypes';
import { EMPTY_ANNOUNCEMENT_FILTERS } from '../types/announcementChatTypes';
import {
  mapAnnouncementConversationDto,
  mapAnnouncementMessages,
} from '../utils/announcementChatMappers';

function matchesInArray<T>(selected: T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

type ModuleFilters = Pick<
  AnnouncementInboxFilters,
  'primary' | 'categories' | 'statuses' | 'priorities' | 'unread' | 'urgent'
>;

function applyPrimaryFilter(conv: AnnouncementConversation, primary: PrimaryAnnouncementFilter): boolean {
  if (primary === 'archived') return conv.archived;
  return !conv.archived;
}

function applyModuleFilters(conv: AnnouncementConversation, filters: ModuleFilters): boolean {
  if (!applyPrimaryFilter(conv, filters.primary)) return false;
  if (filters.unread && conv.unreadCount === 0) return false;
  if (filters.urgent && !conv.urgent) return false;
  if (!matchesInArray(filters.categories, conv.category)) return false;
  if (!matchesInArray(filters.statuses, conv.publishStatus)) return false;
  if (!matchesInArray(filters.priorities, conv.priority)) return false;
  return true;
}

function computePrimaryFilterCounts(conversations: AnnouncementConversation[]): PrimaryFilterCounts {
  return {
    all: conversations.filter((c) => !c.archived).length,
    archived: conversations.filter((c) => c.archived).length,
  };
}

function computeStats(conversations: AnnouncementConversation[]): InboxStats {
  const active = conversations.filter((c) => !c.archived);
  return {
    unread: active.reduce((sum, c) => sum + c.unreadCount, 0),
    pending: active.filter((c) => {
      const last = c.messages[c.messages.length - 1];
      return !c.resolved && last?.direction === 'in';
    }).length,
    resolved: active.filter((c) => c.resolved).length,
  };
}

export function useAnnouncementSupportChat() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { refresh: refreshChatUnread } = useChatUnread();
  const currentUserId = user?.id ?? null;
  const [rawConversations, setRawConversations] = useState<ConversationDto[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<number, MessageDto[]>>({});
  const [inboxMetrics, setInboxMetrics] = useState<ChatMetricsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [messagesLoadingId, setMessagesLoadingId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [moduleFilters, setModuleFilters] = useState<ModuleFilters>({
    primary: 'all',
    categories: [],
    statuses: [],
    priorities: [],
    unread: false,
    urgent: false,
  });
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [archiveOverrideVersion, setArchiveOverrideVersion] = useState(0);
  const typingDebounceRef = useRef<number | null>(null);
  const messagesByConvRef = useRef(messagesByConv);
  messagesByConvRef.current = messagesByConv;
  const rawConversationsRef = useRef(rawConversations);
  rawConversationsRef.current = rawConversations;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const archiveOverridesRef = useRef<Map<number, boolean>>(new Map());
  const loadConversationsDebounceRef = useRef<number | null>(null);
  const moduleFiltersRef = useRef(moduleFilters);
  moduleFiltersRef.current = moduleFilters;
  const seenWsMessageIdsRef = useRef<Set<number>>(new Set());

  const selectedConversationId = selectedId ? Number(selectedId) : null;

  const syncArchiveOverride = useCallback((conversationId: number, archived: boolean | null) => {
    if (archived === null) {
      archiveOverridesRef.current.delete(conversationId);
    } else {
      archiveOverridesRef.current.set(conversationId, archived);
    }
    setArchiveOverrideVersion((version) => version + 1);
  }, []);

  const loadConversationsRef = useRef<(options?: { silent?: boolean }) => Promise<void>>(
    async () => undefined,
  );

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

  const loadConversations = useCallback(async (options?: { silent?: boolean }) => {
    const isInitialLoad = rawConversationsRef.current.length === 0;
    if (!options?.silent && isInitialLoad) {
      setLoading(true);
    }
    setLoadError(null);
    try {
      const { unread, urgent } = moduleFiltersRef.current;
      const [items, metrics] = await Promise.all([
        fetchConversations('announcements', {
          unreadOnly: unread ? true : undefined,
          includeArchived: true,
          urgency: urgent ? 'HIGH' : undefined,
        }),
        fetchModuleChatMetrics('announcements'),
      ]);
      setRawConversations((prev) =>
        mergeFetchedConversations(items, prev, {
          activeListOnly: false,
          archiveOverrides: archiveOverridesRef.current,
        }),
      );
      setInboxMetrics(metrics);
      seenWsMessageIdsRef.current.clear();
    } catch (err) {
      if (!options?.silent) {
        setLoadError(err instanceof Error ? err.message : t('admin.modules.announcements.inbox.loadError', 'Erreur de chargement'));
        if (isInitialLoad) {
          setRawConversations([]);
        }
      }
    } finally {
      if (!options?.silent && isInitialLoad) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  const refreshMessagesRef = useRef<
    (id: number, studentUserId: number | null, options?: { silent?: boolean }) => Promise<unknown>
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
          const conv = rawConversationsRef.current.find((c) => c.id === convId);
          void refreshMessagesRef.current(
            convId,
            conv?.context?.student_user_id ?? null,
            { silent: true },
          );
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
        const convId = event.conversation_id;
        if (
          convId &&
          convId === Number(selectedIdRef.current) &&
          event.event_type === 'conversation.updated'
        ) {
          const conv = rawConversationsRef.current.find((c) => c.id === convId);
          void refreshMessagesRef.current(
            convId,
            conv?.context?.student_user_id ?? null,
            { silent: true },
          );
        }
        scheduleSilentReload();
        return;
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

  useEffect(
    () => () => {
      if (loadConversationsDebounceRef.current) {
        window.clearTimeout(loadConversationsDebounceRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const { unread, urgent } = moduleFilters;
    if (unread || urgent) {
      void loadConversations({ silent: true });
    }
  }, [moduleFilters.unread, moduleFilters.urgent, loadConversations]);

  const conversations = useMemo(() => {
    const mapped = rawConversations.map((dto) => {
      const msgs = messagesByConv[dto.id] ?? [];
      const studentUserId = dto.context?.student_user_id ?? null;
      const conv = mapAnnouncementConversationDto(
        dto,
        mapAnnouncementMessages(msgs, studentUserId),
      );
      const override = archiveOverridesRef.current.get(Number(dto.id));
      if (override === undefined) return conv;
      return { ...conv, archived: override };
    });
    return mapped.sort((a, b) => {
      const aMs = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bMs = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bMs - aMs;
    });
  }, [archiveOverrideVersion, messagesByConv, rawConversations]);

  const {
    studentAcademicFilters,
    studentAcademicFilterCounts,
    programOptions,
    classOptions,
    academicLevelOptions,
    toggleStudentAcademicFilter,
    clearStudentAcademicFilters,
    hasActiveStudentAcademicFilters,
    matchesStudentAcademic,
  } = useStudentAcademicChatFilterState(conversations, {
    isArchived: (c) => c.archived,
  });

  const primaryFilterCounts = useMemo(
    () => computePrimaryFilterCounts(conversations),
    [conversations],
  );

  const stats = useMemo(() => {
    const client = computeStats(conversations);
    return {
      unread: inboxMetrics?.unread_messages ?? client.unread,
      pending: inboxMetrics?.waiting_admin ?? client.pending,
      resolved: client.resolved,
    };
  }, [conversations, inboxMetrics]);

  const filters = useMemo(
    (): AnnouncementInboxFilters => ({
      ...studentAcademicFilters,
      ...moduleFilters,
    }),
    [studentAcademicFilters, moduleFilters],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (!applyModuleFilters(c, moduleFilters)) return false;
      if (!matchesStudentAcademic(c)) return false;
      if (!q) return true;
      const hay = [
        c.studentName,
        c.announcementTitle,
        c.category,
        c.program,
        c.className,
        c.academicLevel,
        c.lastMessage,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [conversations, moduleFilters, matchesStudentAcademic, search]);

  const selected = useMemo(
    () => (selectedId ? conversations.find((c) => c.id === selectedId) ?? null : null),
    [conversations, selectedId],
  );

  const messagesLoading = useMemo(() => {
    if (messagesLoadingId == null || !selectedId) return false;
    return Number(selectedId) === messagesLoadingId;
  }, [messagesLoadingId, selectedId]);

  const loadMessagesFor = useCallback(
    async (
      conversationId: number,
      studentUserId: number | null,
      options?: { silent?: boolean },
    ) => {
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
    },
    [refreshChatUnread],
  );

  useEffect(() => {
    refreshMessagesRef.current = loadMessagesFor;
  }, [loadMessagesFor]);

  const selectConversation = useCallback(
    async (id: string) => {
      setSelectedId(id);
      setMobileView('chat');
      const conversationId = Number(id);
      if (!Number.isFinite(conversationId)) return;
      setConversationLoading(true);
      try {
        await loadMessagesFor(
          conversationId,
          rawConversationsRef.current.find((c) => c.id === conversationId)?.context
            ?.student_user_id ?? null,
        );
      } finally {
        setConversationLoading(false);
      }
    },
    [loadMessagesFor],
  );

  const setPrimaryFilter = useCallback((primary: PrimaryAnnouncementFilter) => {
    setModuleFilters((prev) => ({ ...prev, primary }));
  }, []);

  const toggleFilter = useCallback(
    (key: 'categories' | 'statuses' | 'priorities', value: string) => {
      setModuleFilters((prev) => {
        const current = prev[key] as string[];
        const next = current.includes(value)
          ? current.filter((i) => i !== value)
          : [...current, value];
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  const toggleQuickFilter = useCallback((key: 'unread' | 'urgent') => {
    setModuleFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearFilters = useCallback(() => {
    setModuleFilters({
      primary: 'all',
      categories: [],
      statuses: [],
      priorities: [],
      unread: false,
      urgent: false,
    });
    clearStudentAcademicFilters();
  }, [clearStudentAcademicFilters]);

  const sendMessage = useCallback(
    async (text: string, tagCodes?: string[], entityRefs?: import('../../../../shared/contextual-chat/types/chatEntityTypes').ChatEntityReference[]) => {
      const conversationId = Number(selectedId);
      if (!Number.isFinite(conversationId) || !text.trim()) return;

      const optimisticId = `local-${Date.now()}`;
      const optimistic: MessageDto = withClientNonce(
        {
          id: optimisticId as unknown as number,
          conversation_id: conversationId,
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
        const next = {
          ...prev,
          [conversationId]: [...(prev[conversationId] ?? []), optimistic],
        };
        messagesByConvRef.current = next;
        return next;
      });

      sendWsTyping(false);

      try {
        const saved = await sendChatMessage(conversationId, text.trim(), tagCodes, undefined, entityRefs);
        if (!saved) return;
        setMessagesByConv((prev) => {
          const existing = prev[conversationId] ?? [];
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
          const next = { ...prev, [conversationId]: nextList };
          messagesByConvRef.current = next;
          return next;
        });
        setRawConversations((prev) =>
          patchConversationPreviewInList(prev, conversationId, saved.body, {
            isOwn: true,
            unreadCount: 0,
            at: saved.created_at,
          }),
        );
        void markConversationRead(conversationId, saved.id).then(() => {
          void refreshChatUnread();
        });
        scheduleSilentReload();
      } catch {
        setMessagesByConv((prev) => {
          const next = {
            ...prev,
            [conversationId]: (prev[conversationId] ?? []).filter(
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
    [selectedId, sendWsTyping, scheduleSilentReload],
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

  const markResolved = useCallback(
    async (id: string) => {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) return;
      await applySmartAction(conv.conversationId ?? Number(conv.id), 'mark_resolved');
      void loadConversations({ silent: true });
    },
    [conversations, loadConversations],
  );

  const archiveConversation = useCallback(
    async (id: string) => {
      const conversationId = Number(id);
      if (!Number.isFinite(conversationId)) return;

      syncArchiveOverride(conversationId, true);
      setRawConversations((prev) => {
        const next = patchConversationArchiveState(prev, conversationId, true);
        rawConversationsRef.current = next;
        return next;
      });
      if (moduleFiltersRef.current.primary !== 'archived') {
        setModuleFilters((prev) => ({ ...prev, primary: 'archived' }));
      }

      try {
        await applySmartAction(conversationId, 'archive_conversation');
        syncArchiveOverride(conversationId, null);
        scheduleSilentReload(500);
      } catch {
        syncArchiveOverride(conversationId, null);
        setRawConversations((prev) => {
          const next = patchConversationArchiveState(prev, conversationId, false);
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
        const next = patchConversationArchiveState(prev, conversationId, false);
        rawConversationsRef.current = next;
        return next;
      });

      if (moduleFiltersRef.current.primary === 'archived') {
        setModuleFilters((prev) => ({ ...prev, primary: 'all' }));
      }

      try {
        await applySmartAction(conversationId, 'unarchive_conversation');
        syncArchiveOverride(conversationId, null);
        scheduleSilentReload(500);
      } catch {
        syncArchiveOverride(conversationId, null);
        setRawConversations((prev) => {
          const next = patchConversationArchiveState(prev, conversationId, true);
          rawConversationsRef.current = next;
          return next;
        });
      }
    },
    [scheduleSilentReload, syncArchiveOverride],
  );

  const hasActiveFilters =
    hasActiveStudentAcademicFilters ||
    moduleFilters.primary !== 'all' ||
    moduleFilters.unread ||
    moduleFilters.urgent ||
    moduleFilters.categories.length > 0 ||
    moduleFilters.statuses.length > 0 ||
    moduleFilters.priorities.length > 0;

  return {
    filtered,
    selected,
    selectedId,
    filters,
    search,
    stats,
    mobileView,
    loading,
    conversationLoading,
    messagesLoading,
    loadError,
    primaryFilterCounts,
    hasActiveFilters,
    studentAcademicFilterCounts,
    programOptions,
    classOptions,
    academicLevelOptions,
    peerTyping,
    setSearch,
    setMobileView,
    setPrimaryFilter,
    selectConversation,
    toggleFilter,
    toggleQuickFilter,
    toggleStudentAcademicFilter,
    clearFilters,
    sendMessage,
    markResolved,
    archiveConversation,
    unarchiveConversation,
    notifyTyping,
    refresh: loadConversations,
  };
}

export { EMPTY_ANNOUNCEMENT_FILTERS };

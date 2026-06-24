import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applySmartAction,
  fetchConversation,
  fetchConversations,
  fetchMessages,
  fetchModuleChatMetrics,
  markConversationRead,
  sendChatMessage,
} from '../../../../shared/contextual-chat/api/chatApi';
import { useChatWebSocket } from '../../../../shared/contextual-chat/hooks/useChatWebSocket';
import type { ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
import type { ChatMetricsDto } from '../../../../shared/contextual-chat/api/chatApi';
import { stageApi } from '../../../../shared/api/stageApi';
import { useAcademicStructureCatalog } from '../../../shared/academic-structure/hooks/useAcademicStructureCatalog';
import { restrictFilterCountsToCatalog } from '../../../shared/chat-filters/studentAcademicChatFilterUtils';
import type {
  FilterCounts,
  InboxFilters,
  InboxStats,
  InternshipConversation,
  InternshipMessage,
  PrimaryInboxFilter,
  PrimaryFilterCounts,
} from '../types/internshipChatTypes';
import { EMPTY_INBOX_FILTERS } from '../types/internshipChatTypes';
import { mapConversationDto, mapMessages } from '../utils/internshipChatMappers';
import { applyReadReceiptToMessages } from '../utils/internshipChatReadUtils';
import {
  isPendingLocalMessage,
  mergeServerMessages,
  withClientNonce,
} from '../utils/internshipChatMessageUtils';
import {
  mergeFetchedConversations,
  patchConversationArchiveState,
  patchConversationPreviewInList,
  sortConversationsByRecent,
} from '../utils/internshipChatConversationUtils';

function nowTime(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

function matchesInArray<T>(selected: T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

function applyPrimaryFilter(conv: InternshipConversation, primary: PrimaryInboxFilter): boolean {
  switch (primary) {
    case 'all':
      return !conv.archived;
    case 'unread':
      return !conv.archived && conv.unreadCount > 0;
    case 'waiting_admin':
      return !conv.archived && !conv.resolved && conv.waitingForAdmin;
    case 'waiting_student':
      return !conv.archived && !conv.resolved && conv.waitingForStudent;
    case 'urgent':
      return !conv.archived && (conv.priority === 'Urgent' || conv.priority === 'Critical');
    case 'resolved':
      return conv.resolved && !conv.archived;
    case 'archived':
      return conv.archived;
    default:
      return true;
  }
}

function applyFilters(conv: InternshipConversation, filters: InboxFilters): boolean {
  if (!applyPrimaryFilter(conv, filters.primary)) return false;
  if (!matchesInArray(filters.applicationStatuses, conv.applicationStatus)) return false;
  if (!matchesInArray(filters.internshipTypes, conv.internshipType)) return false;
  if (!matchesInArray(filters.programs, conv.program)) return false;
  if (!matchesInArray(filters.academicLevels, conv.academicLevel)) return false;
  if (!matchesInArray(filters.classes, conv.className)) return false;
  if (!matchesInArray(filters.priorities, conv.priority)) return false;
  if (filters.tags.length > 0 && !filters.tags.some((t) => conv.tags.includes(t))) return false;
  return true;
}

function computeStats(conversations: InternshipConversation[]): InboxStats {
  const active = conversations.filter((c) => !c.archived);
  return {
    unread: active.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
    waitingAdmin: active.filter((c) => !c.resolved && c.waitingForAdmin).length,
    waitingStudent: active.filter((c) => !c.resolved && c.waitingForStudent).length,
    resolved: active.filter((c) => c.resolved).length,
  };
}

function computePrimaryFilterCounts(conversations: InternshipConversation[]): PrimaryFilterCounts {
  return {
    all: conversations.filter((c) => !c.archived).length,
    unread: conversations.filter((c) => !c.archived && c.unreadCount > 0).length,
    waiting_admin: conversations.filter(
      (c) => !c.archived && !c.resolved && c.waitingForAdmin
    ).length,
    waiting_student: conversations.filter(
      (c) => !c.archived && !c.resolved && c.waitingForStudent
    ).length,
    urgent: conversations.filter(
      (c) => !c.archived && (c.priority === 'Urgent' || c.priority === 'Critical')
    ).length,
    resolved: conversations.filter((c) => c.resolved && !c.archived).length,
    archived: conversations.filter((c) => c.archived).length,
  };
}

function computeFilterCounts(conversations: InternshipConversation[]): FilterCounts {
  const active = conversations.filter((c) => !c.archived);
  const countField = (items: InternshipConversation[], key: keyof InternshipConversation) => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      const val = String(item[key]);
      if (val && val !== '—') counts[val] = (counts[val] ?? 0) + 1;
    }
    return counts;
  };
  return {
    programs: countField(active, 'program'),
    academicLevels: countField(active, 'academicLevel'),
    classes: countField(active, 'className'),
    applicationStatuses: countField(active, 'applicationStatus'),
    internshipTypes: countField(active, 'internshipType'),
  };
}

function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function useInternshipSupportChat(inboxMode: 'admin' | 'student' = 'admin') {
  const { t, i18n } = useTranslation();
  const [rawConversations, setRawConversations] = useState<ConversationDto[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<number, MessageDto[]>>({});
  const [inboxMetrics, setInboxMetrics] = useState<ChatMetricsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [messagesLoadingId, setMessagesLoadingId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [filters, setFilters] = useState<InboxFilters>({ ...EMPTY_INBOX_FILTERS });
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [archiveOverrideVersion, setArchiveOverrideVersion] = useState(0);
  const typingDebounceRef = useRef<number | null>(null);
  const selectedConversationId = selectedId ? Number(selectedId) : null;
  const messagesByConvRef = useRef(messagesByConv);
  messagesByConvRef.current = messagesByConv;
  const rawConversationsRef = useRef(rawConversations);
  rawConversationsRef.current = rawConversations;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  const refreshMessagesRef = useRef<
    (id: number, studentUserId: number | null, options?: { silent?: boolean }) => Promise<unknown>
  >(async () => undefined);

  const loadConversationsRef = useRef<(options?: { silent?: boolean }) => Promise<void>>(
    async () => undefined
  );
  const refreshInboxMetricsRef = useRef<() => Promise<void>>(async () => undefined);
  const skipNextFilterReloadRef = useRef(false);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const archiveOverridesRef = useRef<Map<number, boolean>>(new Map());
  const loadConversationsDebounceRef = useRef<number | null>(null);

  const syncArchiveOverride = useCallback((conversationId: number, archived: boolean | null) => {
    if (archived === null) {
      archiveOverridesRef.current.delete(conversationId);
    } else {
      archiveOverridesRef.current.set(conversationId, archived);
    }
    setArchiveOverrideVersion((version) => version + 1);
  }, []);

  const clearArchiveOverrideIfSynced = useCallback((conversationId: number, archived: boolean) => {
    const dto = rawConversationsRef.current.find((item) => Number(item.id) === conversationId);
    if (!dto) return;
    const meta = (dto.metadata_json ?? {}) as Record<string, unknown>;
    if (meta.admin_inbox_archived === archived) {
      archiveOverridesRef.current.delete(conversationId);
      setArchiveOverrideVersion((version) => version + 1);
    }
  }, []);

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

  const refreshInboxMetrics = useCallback(async () => {
    try {
      const metrics = await fetchModuleChatMetrics('offers');
      setInboxMetrics(metrics);
    } catch {
      /* keep previous metrics */
    }
  }, []);

  const loadConversations = useCallback(async (options?: { silent?: boolean }) => {
    const isInitialLoad = rawConversationsRef.current.length === 0;
    if (!options?.silent && isInitialLoad) {
      setLoading(true);
    }
    setLoadError(null);
    try {
      const { primary, priorities } = filtersRef.current;
      const includeArchived = inboxMode === 'admin';
      const [items, metrics] = await Promise.all([
        fetchConversations('offers', {
          unreadOnly: primary === 'unread' ? true : undefined,
          includeArchived,
          urgency:
            primary === 'urgent'
              ? 'HIGH'
              : priorities.includes('Critical')
                ? 'CRITICAL'
                : undefined,
        }),
        fetchModuleChatMetrics('offers'),
      ]);
      setRawConversations((prev) =>
        mergeFetchedConversations(items, prev, {
          activeListOnly: inboxMode === 'student',
          archiveOverrides: archiveOverridesRef.current,
        }),
      );
      setInboxMetrics(metrics);
      for (const [conversationId, archived] of archiveOverridesRef.current.entries()) {
        clearArchiveOverrideIfSynced(conversationId, archived);
      }
    } catch (err) {
      if (!options?.silent) {
        setLoadError(err instanceof Error ? err.message : t('admin.modules.offers.inbox.loadError'));
        if (isInitialLoad) {
          setRawConversations([]);
        }
      }
    } finally {
      if (!options?.silent && isInitialLoad) {
        setLoading(false);
      }
    }
  }, [clearArchiveOverrideIfSynced, inboxMode, t]);

  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  useEffect(() => {
    refreshInboxMetricsRef.current = refreshInboxMetrics;
  }, [refreshInboxMetrics]);

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
        const hasMessage =
          messageId != null && cached.some((m) => m.id === messageId);
        const hasPendingOwn = cached.some(
          (message) => message.is_own && isPendingLocalMessage(message),
        );

        if (hasPendingOwn) {
          void refreshInboxMetricsRef.current();
          return;
        }

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
          const conv = rawConversationsRef.current.find((c) => c.id === convId);
          void refreshMessagesRef.current(
            convId,
            conv?.context?.student_user_id ?? null,
            { silent: true },
          );
        }
        if (isActiveConv && messageId != null && Number.isFinite(Number(messageId))) {
          void markConversationRead(convId, Number(messageId));
        }
        void refreshInboxMetricsRef.current();
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
        void refreshInboxMetricsRef.current();
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
        void refreshInboxMetricsRef.current();
      }
    },
  });

  const {
    programs: referencePrograms,
    classes: referenceClasses,
    academicLevels: referenceAcademicLevels,
    internshipTypes: referenceInternshipTypes,
  } = useAcademicStructureCatalog();

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
    if (skipNextFilterReloadRef.current) {
      skipNextFilterReloadRef.current = false;
      return;
    }
    const { primary, priorities } = filters;
    const needsServerRefetch =
      primary === 'unread' || primary === 'urgent' || priorities.includes('Critical');
    if (needsServerRefetch) {
      void loadConversations({ silent: true });
    }
  }, [filters.primary, filters.priorities, loadConversations]);

  const conversations = useMemo(() => {
    const mapped = rawConversations.map((dto) => {
      const msgs = messagesByConv[dto.id] ?? [];
      const studentUserId = dto.context?.student_user_id ?? null;
      const conv = mapConversationDto(dto, mapMessages(msgs, studentUserId, inboxMode), inboxMode);
      const override = archiveOverridesRef.current.get(Number(dto.id));
      if (override === undefined) return conv;
      return { ...conv, archived: override };
    });
    return mapped.sort((a, b) => {
      const aMs = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bMs = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bMs - aMs;
    });
  }, [archiveOverrideVersion, inboxMode, messagesByConv, rawConversations]);

  const stats = useMemo(() => computeStats(conversations), [conversations]);

  const emptyStateStats = useMemo(() => {
    const active = conversations.filter((conversation) => !conversation.archived);
    const clientUnread = active.reduce((sum, conversation) => sum + conversation.unreadCount, 0);
    const clientWaitingAdmin = active.filter(
      (conversation) => !conversation.resolved && conversation.waitingForAdmin,
    ).length;
    const clientWaitingStudent = active.filter(
      (conversation) => !conversation.resolved && conversation.waitingForStudent,
    ).length;
    const clientResolved = active.filter((conversation) => conversation.resolved).length;

    return {
      unread: inboxMetrics?.unread_messages ?? clientUnread,
      waitingAdmin: inboxMetrics?.waiting_admin ?? clientWaitingAdmin,
      waitingStudent: inboxMetrics?.waiting_student ?? clientWaitingStudent,
      resolved: clientResolved,
    };
  }, [conversations, inboxMetrics]);
  const primaryFilterCounts = useMemo(
    () => computePrimaryFilterCounts(conversations),
    [conversations]
  );
  const filterCounts = useMemo(() => {
    const raw = computeFilterCounts(conversations);
    return {
      ...raw,
      programs: restrictFilterCountsToCatalog(raw.programs, referencePrograms),
      classes: restrictFilterCountsToCatalog(raw.classes, referenceClasses),
      academicLevels: restrictFilterCountsToCatalog(raw.academicLevels, referenceAcademicLevels),
      internshipTypes: restrictFilterCountsToCatalog(raw.internshipTypes, referenceInternshipTypes),
    };
  }, [
    conversations,
    referencePrograms,
    referenceClasses,
    referenceAcademicLevels,
    referenceInternshipTypes,
  ]);

  const programOptions = useMemo(
    () => [...referencePrograms].sort((a, b) => a.localeCompare(b, 'fr')),
    [referencePrograms],
  );

  const classOptions = useMemo(
    () => [...referenceClasses].sort((a, b) => a.localeCompare(b, 'fr')),
    [referenceClasses],
  );

  const academicLevelOptions = useMemo(
    () => [...referenceAcademicLevels].sort((a, b) => a.localeCompare(b, 'fr')),
    [referenceAcademicLevels],
  );

  const internshipTypeOptions = useMemo(
    () => [...referenceInternshipTypes].sort((a, b) => a.localeCompare(b, 'fr')),
    [referenceInternshipTypes],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (!applyFilters(c, filters)) return false;
      if (!q) return true;
      const hay = [
        c.studentName,
        c.offerTitle,
        c.company,
        c.program,
        c.className,
        c.lastMessage,
        c.applicationStatus,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [conversations, filters, search]);

  const selected = useMemo(
    () => (selectedId ? conversations.find((c) => c.id === selectedId) ?? null : null),
    [conversations, selectedId]
  );

  const messagesLoading = useMemo(() => {
    if (messagesLoadingId == null || !selectedId) return false;
    return Number(selectedId) === messagesLoadingId;
  }, [messagesLoadingId, selectedId]);

  const loadMessagesFor = useCallback(
    async (
      conversationId: number,
      studentUserId: number | null,
      options?: { silent?: boolean }
    ) => {
      const hasCached = (messagesByConvRef.current[conversationId]?.length ?? 0) > 0;
      if (!options?.silent && !hasCached) {
        setMessagesLoadingId(conversationId);
      }
      try {
        const msgs = await fetchMessages(conversationId);
        setMessagesByConv((prev) => {
          const existing = prev[conversationId] ?? [];
          const merged = mergeServerMessages(existing, msgs);
          const next = { ...prev, [conversationId]: merged };
          messagesByConvRef.current = next;
          return next;
        });
        const last = msgs[msgs.length - 1];
        if (last) {
          void markConversationRead(conversationId, last.id);
        }
        return mapMessages(msgs, studentUserId, inboxMode);
      } finally {
        if (!options?.silent && !hasCached) {
          setMessagesLoadingId((prev) => (prev === conversationId ? null : prev));
        }
      }
    },
    [inboxMode]
  );

  useEffect(() => {
    refreshMessagesRef.current = loadMessagesFor;
  }, [loadMessagesFor]);

  const openConversationById = useCallback(
    async (id: string) => {
      const numId = Number(id);
      setSelectedId(id);
      setMobileView('chat');
      const hasCachedMessages = (messagesByConvRef.current[numId]?.length ?? 0) > 0;
      try {
        let dto = rawConversationsRef.current.find((c) => String(c.id) === id);
        if (!dto) {
          setConversationLoading(true);
          const fetched = await fetchConversation(Number(id));
          if (fetched) {
            dto = fetched;
            setRawConversations((prev) =>
              prev.some((c) => c.id === fetched.id) ? prev : [fetched, ...prev]
            );
          }
        }
        if (dto) {
          if (hasCachedMessages) {
            void loadMessagesFor(dto.id, dto.context?.student_user_id ?? null, { silent: true });
          } else {
            await loadMessagesFor(dto.id, dto.context?.student_user_id ?? null);
          }
        }
        setRawConversations((prev) =>
          prev.map((c) => (String(c.id) === id ? { ...c, unread_count: 0 } : c))
        );
      } finally {
        setConversationLoading(false);
      }
    },
    [loadMessagesFor]
  );

  const openConversationForOffer = useCallback(
    async (offerUuid: string) => {
      setMobileView('chat');
      setConversationLoading(true);
      try {
        const result = await stageApi.createChat(offerUuid);
        await openConversationById(String(result.conversation_id));
      } catch {
        setConversationLoading(false);
      }
    },
    [openConversationById]
  );

  const selectConversation = useCallback(
    async (id: string) => {
      await openConversationById(id);
    },
    [openConversationById]
  );

  const setPrimaryFilter = useCallback((primary: PrimaryInboxFilter) => {
    setFilters((prev) => ({ ...prev, primary }));
  }, []);

  const toggleFilter = useCallback(
    <K extends 'applicationStatuses' | 'internshipTypes' | 'programs' | 'academicLevels' | 'classes' | 'priorities' | 'tags'>(
      key: K,
      value: InboxFilters[K][number]
    ) => {
      setFilters((prev) => ({
        ...prev,
        [key]: toggleItem(prev[key], value),
      }));
    },
    []
  );

  const clearFilters = useCallback(
    () => setFilters({ ...EMPTY_INBOX_FILTERS }),
    []
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!selectedId || !text.trim()) return;
      const conversationId = Number(selectedId);
      if (!Number.isFinite(conversationId)) return;
      const trimmed = text.trim();
      const optimisticId = `local-${Date.now()}`;
      sendWsTyping(false);
      setMessagesByConv((prev) => {
        const existing = prev[conversationId] ?? [];
        const optimistic: MessageDto = {
          id: optimisticId as unknown as number,
          conversation_id: conversationId,
          sender_id: null,
          sender_name: '',
          body: trimmed,
          message_type: 'TEXT',
          created_at: new Date().toISOString(),
          tags: [],
          is_own: true,
          delivery_status: 'delivered',
          read_by: [],
          metadata_json: { client_nonce: optimisticId },
        };
        const next = { ...prev, [conversationId]: [...existing, optimistic] };
        messagesByConvRef.current = next;
        return next;
      });
      setRawConversations((prev) =>
        sortConversationsByRecent(
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  last_preview: trimmed.slice(0, 200),
                  last_message_is_own: true,
                  last_message_at: new Date().toISOString(),
                  unread_count: 0,
                }
              : c,
          ),
        ),
      );
      try {
        const saved = await sendChatMessage(conversationId, trimmed);
        if (!saved) {
          throw new Error('send failed');
        }
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
          sortConversationsByRecent(
            prev.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    last_preview: saved.body.slice(0, 200),
                    last_message_is_own: true,
                    last_message_at: saved.created_at,
                    unread_count: 0,
                  }
                : c,
            ),
          ),
        );
        void markConversationRead(conversationId, saved.id);
        void refreshInboxMetrics();
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
    [selectedId, sendWsTyping, refreshInboxMetrics]
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
    [sendWsTyping]
  );

  const markResolved = useCallback(
    async (id: string) => {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) return;
      await applySmartAction(conv.conversationId, 'mark_resolved');
      void loadConversations({ silent: true });
      void refreshInboxMetrics();
    },
    [conversations, loadConversations, refreshInboxMetrics]
  );

  const resolveRawConversation = useCallback((id: string) => {
    const conversationId = Number(id);
    if (!Number.isFinite(conversationId)) return null;
    return rawConversationsRef.current.find((conversation) => Number(conversation.id) === conversationId) ?? null;
  }, []);

  const archiveConversation = useCallback(
    async (id: string) => {
      const dto = resolveRawConversation(id);
      if (!dto) return;
      const conversationId = Number(dto.id);

      syncArchiveOverride(conversationId, true);
      setRawConversations((prev) => {
        const next = patchConversationArchiveState(prev, conversationId, true);
        rawConversationsRef.current = next;
        return next;
      });
      setSelectedId((prev) => (prev === id ? '' : prev));
      setMobileView('list');

      try {
        await applySmartAction(conversationId, 'archive_conversation');
        syncArchiveOverride(conversationId, null);
        scheduleSilentReload(500);
        void refreshInboxMetrics();
      } catch {
        syncArchiveOverride(conversationId, null);
        setRawConversations((prev) => {
          const next = patchConversationArchiveState(prev, conversationId, false);
          rawConversationsRef.current = next;
          return next;
        });
      }
    },
    [
      refreshInboxMetrics,
      resolveRawConversation,
      scheduleSilentReload,
      syncArchiveOverride,
    ],
  );

  const assignAdmin = useCallback(
    async (id: string, assigneeUserId: number) => {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) return;
      await applySmartAction(conv.conversationId, 'assign_admin', {
        assignee_user_id: assigneeUserId,
      });
      void loadConversations({ silent: true });
      void refreshInboxMetrics();
    },
    [conversations, loadConversations, refreshInboxMetrics],
  );

  const unarchiveConversation = useCallback(
    async (id: string) => {
      const dto = resolveRawConversation(id);
      if (!dto) return;
      const conversationId = Number(dto.id);

      syncArchiveOverride(conversationId, false);
      setRawConversations((prev) => {
        const next = patchConversationArchiveState(prev, conversationId, false);
        rawConversationsRef.current = next;
        return next;
      });

      if (filters.primary === 'archived') {
        skipNextFilterReloadRef.current = true;
        setFilters((prev) => ({ ...prev, primary: 'all' }));
      }

      try {
        await applySmartAction(conversationId, 'unarchive_conversation');
        syncArchiveOverride(conversationId, null);
        scheduleSilentReload(500);
        void refreshInboxMetrics();
      } catch {
        syncArchiveOverride(conversationId, null);
        setRawConversations((prev) => {
          const next = patchConversationArchiveState(prev, conversationId, true);
          rawConversationsRef.current = next;
          return next;
        });
      }
    },
    [
      filters.primary,
      refreshInboxMetrics,
      resolveRawConversation,
      scheduleSilentReload,
      syncArchiveOverride,
    ],
  );

  const hasActiveFilters =
    filters.primary !== 'all' ||
    filters.applicationStatuses.length > 0 ||
    filters.internshipTypes.length > 0 ||
    filters.programs.length > 0 ||
    filters.academicLevels.length > 0 ||
    filters.classes.length > 0 ||
    filters.priorities.length > 0 ||
    filters.tags.length > 0;

  return {
    filtered,
    selected,
    selectedId,
    filters,
    search,
    stats,
    emptyStateStats,
    primaryFilterCounts,
    filterCounts,
    programOptions,
    classOptions,
    academicLevelOptions,
    internshipTypeOptions,
    mobileView,
    loading,
    conversationLoading,
    messagesLoading,
    loadError,
    hasActiveFilters,
    setSearch,
    setMobileView,
    setPrimaryFilter,
    selectConversation,
    openConversationById,
    openConversationForOffer,
    toggleFilter,
    clearFilters,
    sendMessage,
    markResolved,
    archiveConversation,
    unarchiveConversation,
    assignAdmin,
    refresh: loadConversations,
    peerTyping,
    notifyTyping,
  };
}

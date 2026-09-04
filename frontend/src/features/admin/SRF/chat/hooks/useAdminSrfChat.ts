import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../../auth/hooks/useAuth';
import {
  applySmartAction,
  fetchConversation,
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
  AdminSrfConversation,
  InboxStats,
  PrimaryFilterCounts,
  PrimarySrfFilter,
  SrfInboxFilters,
} from '../types/adminSrfChatTypes';
import { EMPTY_SRF_FILTERS } from '../types/adminSrfChatTypes';
import { mapSrfConversationDto, mapSrfMessages } from '../utils/srfChatMappers';
import { formatConversationPreview } from '../../../offres-stage/chat/utils/internshipChatDisplayUtils';
import type { SupportChatThread, SupportConversationListItem } from '../../../shared/admin-support-inbox/types/supportInboxTypes';

function applyPrimaryFilter(conv: AdminSrfConversation, primary: PrimarySrfFilter): boolean {
  if (primary === 'archived') return conv.archived;
  return !conv.archived;
}

function applyModuleFilters(conv: AdminSrfConversation, filters: Pick<SrfInboxFilters, 'primary' | 'unread'>): boolean {
  if (!applyPrimaryFilter(conv, filters.primary)) return false;
  if (filters.unread && conv.unreadCount === 0) return false;
  return true;
}

function computePrimaryFilterCounts(conversations: AdminSrfConversation[]): PrimaryFilterCounts {
  return {
    all: conversations.filter((c) => !c.archived).length,
    archived: conversations.filter((c) => c.archived).length,
  };
}

function isWaitingAdminReply(conv: AdminSrfConversation): boolean {
  if (conv.resolved || conv.archived) return false;
  const last = conv.messages[conv.messages.length - 1];
  if (last) return last.direction === 'in';
  if (conv.lastPreview) return !conv.lastMessageIsOwn;
  return false;
}

function computeStats(conversations: AdminSrfConversation[]): InboxStats {
  const active = conversations.filter((c) => !c.archived);
  return {
    unread: active.reduce((sum, c) => sum + c.unreadCount, 0),
    pending: active.filter(isWaitingAdminReply).length,
    resolved: active.filter((c) => c.resolved).length,
  };
}

export function useSrfSupportChat() {
  const { isSessionReady } = useAuth();
  const { refresh: refreshChatUnread } = useChatUnread();
  const [rawConversations, setRawConversations] = useState<ConversationDto[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<number, MessageDto[]>>({});
  const [inboxMetrics, setInboxMetrics] = useState<ChatMetricsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [messagesLoadingId, setMessagesLoadingId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [moduleFilters, setModuleFilters] = useState<Pick<SrfInboxFilters, 'primary' | 'unread'>>({
    primary: 'all',
    unread: false,
  });
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [archiveOverrideVersion, setArchiveOverrideVersion] = useState(0);
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
    if (!options?.silent && isInitialLoad) setLoading(true);
    setLoadError(null);
    try {
      const { unread } = moduleFiltersRef.current;
      const items = await fetchConversations('srf', {
        unreadOnly: unread ? true : undefined,
        includeArchived: true,
      });
      setRawConversations((prev) => {
        const merged = mergeFetchedConversations(items, prev, {
          activeListOnly: false,
          archiveOverrides: archiveOverridesRef.current,
        });
        rawConversationsRef.current = merged;
        return merged;
      });
      const metrics = await fetchModuleChatMetrics('srf');
      setInboxMetrics(metrics);
    } catch {
      setLoadError('Impossible de charger les conversations SRF.');
    } finally {
      if (!options?.silent && isInitialLoad) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  const refreshMessagesRef = useRef<
    (id: number, studentUserId: number | null, options?: { silent?: boolean }) => Promise<void>
  >(async () => undefined);

  const selectedConversationId = selectedId ? Number(selectedId) : null;

  const { sendTyping: sendWsTyping } = useChatWebSocket({
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
      if (event.event_type === 'inbox.updated' || event.event_type === 'conversation.updated') {
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
    if (!isSessionReady) return;
    void loadConversations();
  }, [isSessionReady, loadConversations]);

  useEffect(
    () => () => {
      if (loadConversationsDebounceRef.current) {
        window.clearTimeout(loadConversationsDebounceRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isSessionReady) return;
    if (moduleFilters.unread) {
      void loadConversations({ silent: true });
    }
  }, [isSessionReady, moduleFilters.unread, loadConversations]);

  const conversations = useMemo(() => {
    const mapped = rawConversations.map((dto) => {
      const msgs = messagesByConv[dto.id] ?? [];
      const studentUserId = dto.context?.student_user_id ?? null;
      const conv = mapSrfConversationDto(dto, mapSrfMessages(msgs, studentUserId, 'admin'));
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

  const inboxStats = useMemo(() => {
    const client = computeStats(conversations);
    return {
      unread: inboxMetrics?.unread_messages ?? client.unread,
      pending: client.pending,
      resolved: client.resolved,
    };
  }, [conversations, inboxMetrics]);

  const filteredConversations = useMemo(() => {
    const q = sidebarSearch.trim().toLowerCase();
    return conversations.filter((c) => {
      if (!applyModuleFilters(c, moduleFilters)) return false;
      if (!matchesStudentAcademic(c)) return false;
      if (!q) return true;
      const hay = [
        c.studentName,
        c.lastPreview,
        c.statusLabel,
        c.program,
        c.className,
        c.academicLevel,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [conversations, matchesStudentAcademic, moduleFilters, sidebarSearch]);

  const selected = useMemo(
    () => (selectedId ? conversations.find((c) => c.id === selectedId) ?? null : null),
    [conversations, selectedId],
  );

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
      const conversationId = Number(id);
      setSelectedId(id);
      setMobileView('chat');
      if (!Number.isFinite(conversationId)) return;

      const hasCachedMessages = (messagesByConvRef.current[conversationId]?.length ?? 0) > 0;
      try {
        let dto = rawConversationsRef.current.find((c) => String(c.id) === id);
        if (!dto) {
          setConversationLoading(true);
          const fetched = await fetchConversation(conversationId);
          if (fetched) {
            dto = fetched;
            setRawConversations((prev) => {
              const merged = mergeFetchedConversations([fetched], prev, {
                activeListOnly: false,
                archiveOverrides: archiveOverridesRef.current,
              });
              rawConversationsRef.current = merged;
              return merged;
            });
          }
        }
        if (dto) {
          if (hasCachedMessages) {
            void loadMessagesFor(
              dto.id,
              dto.context?.student_user_id ?? null,
              { silent: true },
            );
          } else {
            await loadMessagesFor(
              dto.id,
              dto.context?.student_user_id ?? null,
            );
          }
        }
        setRawConversations((prev) =>
          prev.map((c) => (String(c.id) === id ? { ...c, unread_count: 0 } : c)),
        );
      } finally {
        setConversationLoading(false);
      }
    },
    [loadMessagesFor],
  );

  const setPrimaryFilter = useCallback((primary: PrimarySrfFilter) => {
    setModuleFilters((prev) => ({ ...prev, primary }));
  }, []);

  const toggleQuickFilter = useCallback((key: 'unread') => {
    setModuleFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearFilters = useCallback(() => {
    setModuleFilters({ primary: 'all', unread: false });
    clearStudentAcademicFilters();
  }, [clearStudentAcademicFilters]);

  const sendMessage = useCallback(
    async (text: string, tagCodes?: string[], entityRefs?: import('../../../../shared/contextual-chat/types/chatEntityTypes').ChatEntityReference[]) => {
      const conversationId = Number(selectedId);
      if (!Number.isFinite(conversationId) || !text.trim()) return;

      const trimmed = text.trim();
      const optimisticId = `local-${Date.now()}`;
      const optimistic: MessageDto = withClientNonce(
        {
          id: optimisticId as unknown as number,
          conversation_id: conversationId,
          sender_id: null,
          sender_name: '',
          body: trimmed,
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

      try {
        const saved = await sendChatMessage(conversationId, trimmed, tagCodes, undefined, entityRefs);
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
    [selectedId, scheduleSilentReload, refreshChatUnread],
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

  const markResolved = useCallback(
    async (id: string) => {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) return;
      await applySmartAction(conv.conversationId, 'mark_resolved');
      void loadConversations({ silent: true });
    },
    [conversations, loadConversations],
  );

  const listItems = useMemo((): SupportConversationListItem[] => {
    return filteredConversations.map((c) => {
      const previewText = formatConversationPreview(c.lastPreview);
      const preview =
        previewText && c.lastMessageIsOwn ? `Vous : ${previewText}` : previewText;
      return {
        id: c.id,
        avatarInitials: c.studentInitials,
        avatarUrl: c.studentAvatarUrl,
        name: c.studentName,
        contextLine:
          [c.program, c.className !== '—' ? c.className : ''].filter(Boolean).join(' · ') ||
          c.statusLabel,
        preview,
        timeLabel: c.timeLabel,
        unreadCount: c.unreadCount,
        statusLabel: c.statusLabel,
      };
    });
  }, [filteredConversations]);

  const activeThread = useMemo((): SupportChatThread | null => {
    if (!selected) return null;
    return {
      id: selected.id,
      avatarInitials: selected.studentInitials,
      title: selected.studentName,
      meta: selected.statusLabel,
      resolved: selected.resolved,
      messages: selected.messages.map((m) => ({
        id: m.id,
        direction: m.direction,
        text: m.text,
        time: m.time,
        separatorBefore: m.separatorBefore,
        messageType: m.messageType,
      })),
    };
  }, [selected]);

  const messagesLoading = useMemo(() => {
    if (messagesLoadingId == null || !selectedId) return false;
    return Number(selectedId) === messagesLoadingId;
  }, [messagesLoadingId, selectedId]);

  const hasActiveFilters =
    hasActiveStudentAcademicFilters ||
    moduleFilters.primary !== 'all' ||
    moduleFilters.unread;

  const clearSelection = useCallback(() => {
    setSelectedId('');
    setMobileView('list');
  }, []);

  return {
    conversations: filteredConversations,
    listItems,
    activeThread,
    selected,
    selectedId,
    sidebarSearch,
    mobileView,
    loading,
    conversationLoading,
    messagesLoading,
    loadError,
    inboxStats,
    primaryFilterCounts,
    studentAcademicFilters,
    studentAcademicFilterCounts,
    programOptions,
    classOptions,
    academicLevelOptions,
    hasActiveFilters,
    primaryFilter: moduleFilters.primary,
    setSidebarSearch,
    setMobileView,
    setPrimaryFilter,
    toggleQuickFilter,
    selectConversation,
    clearSelection,
    sendMessage,
    toggleStudentAcademicFilter,
    clearStudentAcademicFilters,
    clearFilters,
    archiveConversation,
    unarchiveConversation,
    markResolved,
    reloadConversations: loadConversations,
  };
}

/** @deprecated Use useSrfSupportChat */
export const useAdminSrfChat = useSrfSupportChat;

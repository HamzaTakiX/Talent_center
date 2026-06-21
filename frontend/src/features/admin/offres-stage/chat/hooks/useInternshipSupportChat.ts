import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applySmartAction,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  sendChatMessage,
} from '../../../../shared/contextual-chat/api/chatApi';
import type { ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
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
    unread: active.filter((c) => c.unreadCount > 0).length,
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

export function useInternshipSupportChat() {
  const { t, i18n } = useTranslation();
  const [rawConversations, setRawConversations] = useState<ConversationDto[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<number, MessageDto[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [filters, setFilters] = useState<InboxFilters>({ ...EMPTY_INBOX_FILTERS });
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const {
    programs: referencePrograms,
    classes: referenceClasses,
    academicLevels: referenceAcademicLevels,
    internshipTypes: referenceInternshipTypes,
  } = useAcademicStructureCatalog();

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const items = await fetchConversations('offers', {
        q: search.trim() || undefined,
        unreadOnly: filters.primary === 'unread' ? true : undefined,
        urgency:
          filters.primary === 'urgent'
            ? 'HIGH'
            : filters.priorities.includes('Critical')
              ? 'CRITICAL'
              : undefined,
      });
      setRawConversations(items);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t('admin.modules.offers.inbox.loadError'));
      setRawConversations([]);
    } finally {
      setLoading(false);
    }
  }, [filters.primary, filters.priorities, search, t]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const conversations = useMemo(
    () =>
      rawConversations.map((dto) => {
        const msgs = messagesByConv[dto.id] ?? [];
        const studentUserId = dto.context?.student_user_id ?? null;
        return mapConversationDto(dto, mapMessages(msgs, studentUserId));
      }),
    [messagesByConv, rawConversations]
  );

  const stats = useMemo(() => computeStats(conversations), [conversations]);
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

  const loadMessagesFor = useCallback(async (conversationId: number, studentUserId: number | null) => {
    const msgs = await fetchMessages(conversationId);
    setMessagesByConv((prev) => ({ ...prev, [conversationId]: msgs }));
    const last = msgs[msgs.length - 1];
    if (last) {
      await markConversationRead(conversationId, last.id);
    }
    return mapMessages(msgs, studentUserId);
  }, []);

  const selectConversation = useCallback(
    async (id: string) => {
      setSelectedId(id);
      setMobileView('chat');
      const dto = rawConversations.find((c) => String(c.id) === id);
      if (!dto) return;
      if (!messagesByConv[dto.id]) {
        await loadMessagesFor(dto.id, dto.context?.student_user_id ?? null);
      }
      setRawConversations((prev) =>
        prev.map((c) => (String(c.id) === id ? { ...c, unread_count: 0 } : c))
      );
    },
    [loadMessagesFor, messagesByConv, rawConversations]
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
      if (!selected || !text.trim()) return;
      const optimistic: InternshipMessage = {
        id: `local-${Date.now()}`,
        direction: 'out',
        text: text.trim(),
        time: nowTime(),
        read: true,
      };
      setMessagesByConv((prev) => {
        const existing = prev[selected.conversationId] ?? [];
        const dto: MessageDto = {
          id: optimistic.id as unknown as number,
          conversation_id: selected.conversationId,
          sender_id: null,
          sender_name: '',
          body: optimistic.text,
          message_type: 'TEXT',
          created_at: new Date().toISOString(),
          tags: [],
          is_own: true,
          metadata_json: {},
        };
        return { ...prev, [selected.conversationId]: [...existing, dto] };
      });
      await sendChatMessage(selected.conversationId, text.trim());
      await loadMessagesFor(
        selected.conversationId,
        rawConversations.find((c) => c.id === selected.conversationId)?.context?.student_user_id ?? null
      );
      void loadConversations();
    },
    [loadConversations, loadMessagesFor, rawConversations, selected]
  );

  const markResolved = useCallback(
    async (id: string) => {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) return;
      await applySmartAction(conv.conversationId, 'mark_resolved');
      void loadConversations();
    },
    [conversations, loadConversations]
  );

  const archiveConversation = useCallback(
    async (id: string) => {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) return;
      await applySmartAction(conv.conversationId, 'archive_conversation');
      setSelectedId((prev) => (prev === id ? '' : prev));
      setMobileView('list');
      void loadConversations();
    },
    [conversations, loadConversations]
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
    primaryFilterCounts,
    filterCounts,
    programOptions,
    classOptions,
    academicLevelOptions,
    internshipTypeOptions,
    mobileView,
    loading,
    loadError,
    hasActiveFilters,
    setSearch,
    setMobileView,
    setPrimaryFilter,
    selectConversation,
    toggleFilter,
    clearFilters,
    sendMessage,
    markResolved,
    archiveConversation,
    refresh: loadConversations,
  };
}

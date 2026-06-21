import { useCallback, useMemo, useState } from 'react';
import { announcementSupportConversations } from '../data/announcementSupportMock';
import { useStudentAcademicChatFilterState } from '../../../shared/chat-filters/useStudentAcademicChatFilterState';
import type {
  AnnouncementConversation,
  AnnouncementInboxFilters,
  AnnouncementMessage,
  InboxStats,
} from '../types/announcementChatTypes';

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

type ModuleFilters = Pick<
  AnnouncementInboxFilters,
  'categories' | 'statuses' | 'priorities' | 'unread' | 'urgent' | 'archived'
>;

function applyModuleFilters(conv: AnnouncementConversation, filters: ModuleFilters): boolean {
  if (filters.archived) {
    if (!conv.archived) return false;
  } else if (conv.archived) {
    return false;
  }
  if (filters.unread && conv.unreadCount === 0) return false;
  if (filters.urgent && !conv.urgent) return false;
  if (!matchesInArray(filters.categories, conv.category)) return false;
  if (!matchesInArray(filters.statuses, conv.publishStatus)) return false;
  if (!matchesInArray(filters.priorities, conv.priority)) return false;
  return true;
}

function computeStats(conversations: AnnouncementConversation[]): InboxStats {
  const active = conversations.filter((c) => !c.archived);
  return {
    unread: active.filter((c) => c.unreadCount > 0).length,
    pending: active.filter((c) => {
      const last = c.messages[c.messages.length - 1];
      return !c.resolved && last?.direction === 'in';
    }).length,
    resolved: active.filter((c) => c.resolved).length,
  };
}

export function useAnnouncementSupportChat() {
  const [conversations, setConversations] = useState<AnnouncementConversation[]>(() =>
    announcementSupportConversations.map((c) => ({ ...c, messages: [...c.messages] }))
  );
  const [selectedId, setSelectedId] = useState('');
  const [moduleFilters, setModuleFilters] = useState<ModuleFilters>({
    categories: [],
    statuses: [],
    priorities: [],
    unread: false,
    urgent: false,
    archived: false,
  });
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

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

  const stats = useMemo(() => computeStats(conversations), [conversations]);

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
    [conversations, selectedId]
  );

  const selectConversation = useCallback((id: string) => {
    setSelectedId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
    setMobileView('chat');
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
    []
  );

  const toggleQuickFilter = useCallback((key: 'unread' | 'urgent' | 'archived') => {
    setModuleFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearFilters = useCallback(() => {
    setModuleFilters({
      categories: [],
      statuses: [],
      priorities: [],
      unread: false,
      urgent: false,
      archived: false,
    });
    clearStudentAcademicFilters();
  }, [clearStudentAcademicFilters]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!selectedId || !text.trim()) return;
      const msg: AnnouncementMessage = {
        id: `local-${Date.now()}`,
        direction: 'out',
        text: text.trim(),
        time: nowTime(),
        read: true,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                messages: [...c.messages, msg],
                lastMessage: text.trim(),
                timeLabel: 'À l\'instant',
              }
            : c
        )
      );
    },
    [selectedId]
  );

  const markResolved = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: true, urgent: false } : c))
    );
  }, []);

  const archiveConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: true, resolved: true } : c))
    );
    setSelectedId((prev) => (prev === id ? '' : prev));
    setMobileView('list');
  }, []);

  const hasActiveFilters =
    hasActiveStudentAcademicFilters ||
    moduleFilters.unread ||
    moduleFilters.urgent ||
    moduleFilters.archived ||
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
    hasActiveFilters,
    studentAcademicFilterCounts,
    programOptions,
    classOptions,
    academicLevelOptions,
    setSearch,
    setMobileView,
    selectConversation,
    toggleFilter,
    toggleQuickFilter,
    toggleStudentAcademicFilter,
    clearFilters,
    sendMessage,
    markResolved,
    archiveConversation,
  };
}

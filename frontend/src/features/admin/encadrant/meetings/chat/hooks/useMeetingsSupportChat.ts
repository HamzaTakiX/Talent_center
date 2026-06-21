import { useCallback, useMemo, useState } from 'react';
import { meetingsSupportConversations } from '../data/meetingsSupportMock';
import { hasActiveStudentAcademicFilters } from '../../../../shared/chat-filters/studentAcademicChatFilterUtils';
import { useStudentAcademicChatFilterState } from '../../../../shared/chat-filters/useStudentAcademicChatFilterState';
import type {
  MeetingConversation,
  MeetingInboxFilters,
  MeetingInboxStats,
  MeetingMessage,
  MeetingStatus,
} from '../types/meetingsChatTypes';
import { EMPTY_MEETING_FILTERS } from '../types/meetingsChatTypes';
import type { SupportMobileView } from '../../../../shared/admin-support-inbox/types/supportInboxTypes';
import { formatSupportChatTime } from '../../../../shared/admin-support-inbox/utils/supportInboxUtils';

type ModuleFilters = Pick<MeetingInboxFilters, 'unread' | 'urgent' | 'archived' | 'statuses'>;

function applyModuleFilters(conv: MeetingConversation, filters: ModuleFilters): boolean {
  if (filters.archived) {
    if (!conv.archived) return false;
  } else if (conv.archived) return false;
  if (filters.unread && conv.unreadCount === 0) return false;
  if (filters.urgent && !conv.urgent) return false;
  if (filters.statuses.length > 0 && !filters.statuses.includes(conv.meetingStatus)) return false;
  return true;
}

function computeMeetingStats(conversations: MeetingConversation[]): MeetingInboxStats {
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

export function useMeetingsSupportChat() {
  const [conversations, setConversations] = useState<MeetingConversation[]>(() =>
    meetingsSupportConversations.map((c) => ({ ...c, messages: [...c.messages] }))
  );
  const [selectedId, setSelectedId] = useState('');
  const [moduleFilters, setModuleFilters] = useState<ModuleFilters>({
    unread: false,
    urgent: false,
    archived: false,
    statuses: [],
  });
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<SupportMobileView>('list');

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

  const stats = useMemo(() => computeMeetingStats(conversations), [conversations]);

  const filters = useMemo(
    (): MeetingInboxFilters => ({
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
        c.participantName,
        c.meetingTitle,
        c.encadrantName,
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

  const toggleStatusFilter = useCallback((status: MeetingStatus) => {
    setModuleFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  }, []);

  const toggleQuickFilter = useCallback((key: 'unread' | 'urgent' | 'archived') => {
    setModuleFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearFilters = useCallback(() => {
    setModuleFilters({
      unread: false,
      urgent: false,
      archived: false,
      statuses: [],
    });
    clearStudentAcademicFilters();
  }, [clearStudentAcademicFilters]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!selectedId || !text.trim()) return;
      const msg: MeetingMessage = {
        id: `local-${Date.now()}`,
        direction: 'out',
        text: text.trim(),
        time: formatSupportChatTime(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                messages: [...c.messages, msg],
                lastMessage: text.trim(),
                timeLabel: "À l'instant",
              }
            : c
        )
      );
    },
    [selectedId]
  );

  const hasActiveFilters =
    hasActiveStudentAcademicFilters ||
    moduleFilters.unread ||
    moduleFilters.urgent ||
    moduleFilters.archived ||
    moduleFilters.statuses.length > 0;

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
    toggleStatusFilter,
    toggleQuickFilter,
    toggleStudentAcademicFilter,
    clearFilters,
    sendMessage,
  };
}

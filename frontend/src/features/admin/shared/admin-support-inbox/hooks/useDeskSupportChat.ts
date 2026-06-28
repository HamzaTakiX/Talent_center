import { useCallback, useMemo, useState } from 'react';

import type { AdminChatMessage, AdminChatParticipant } from '../../admin-module-chat/adminChatTypes';

import {
  buildDeskConversations,
  type DeskConversationRecord,
  toActiveThread,
  toListItems,
} from '../adapters/mapDeskChatData';

import { hasActiveStudentAcademicFilters } from '../../chat-filters/studentAcademicChatFilterUtils';

import { useStudentAcademicChatFilterState } from '../../chat-filters/useStudentAcademicChatFilterState';

import type { PrimaryDeskFilter, SupportMobileView, SupportQuickFilters } from '../types/supportInboxTypes';

import {
  applyPrimaryDeskFilter,
  computePrimaryFilterCounts,
  computeSupportInboxStats,
  formatSupportChatTime,
  hasActiveQuickFilters,
  matchesQuickFilters,
} from '../utils/supportInboxUtils';

import { EMPTY_SUPPORT_QUICK_FILTERS } from '../types/supportInboxTypes';

interface Options {
  participants: AdminChatParticipant[];
  initialMessages: Record<string, AdminChatMessage[]>;
  searchFields?: (conv: DeskConversationRecord) => string[];
}

const DEFAULT_SEARCH_FIELDS = (conv: DeskConversationRecord) => [
  conv.title,
  conv.preview,
  conv.contextLine ?? '',
  conv.statusLabel ?? '',
  conv.program ?? '',
  conv.className ?? '',
  conv.academicLevel ?? '',
  conv.displayName ?? '',
  conv.email ?? '',
  conv.roleLabel ?? '',
];

export function useDeskSupportChat({
  participants,
  initialMessages,
  searchFields = DEFAULT_SEARCH_FIELDS,
}: Options) {
  const [conversations, setConversations] = useState<DeskConversationRecord[]>(() =>
    buildDeskConversations(participants, initialMessages)
  );
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [primaryFilter, setPrimaryFilter] = useState<PrimaryDeskFilter>('all');
  const [quickFilters, setQuickFilters] = useState<SupportQuickFilters>({
    ...EMPTY_SUPPORT_QUICK_FILTERS,
  });
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
    isArchived: (c) => Boolean(c.archived),
  });

  const primaryFilterCounts = useMemo(
    () => computePrimaryFilterCounts(conversations),
    [conversations]
  );

  const stats = useMemo(() => computeSupportInboxStats(conversations), [conversations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (!applyPrimaryDeskFilter(c, primaryFilter)) return false;
      if (!matchesQuickFilters(c, quickFilters)) return false;
      if (!matchesStudentAcademic(c)) return false;
      if (!q) return true;
      return searchFields(c).join(' ').toLowerCase().includes(q);
    });
  }, [conversations, primaryFilter, quickFilters, matchesStudentAcademic, search, searchFields]);

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

  const toggleQuickFilter = useCallback((key: keyof SupportQuickFilters) => {
    setQuickFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearQuickFilters = useCallback(
    () => setQuickFilters({ ...EMPTY_SUPPORT_QUICK_FILTERS }),
    []
  );

  const clearFilters = useCallback(() => {
    clearQuickFilters();
    clearStudentAcademicFilters();
  }, [clearQuickFilters, clearStudentAcademicFilters]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!selectedId || !text.trim()) return;
      const msg = {
        id: `local-${Date.now()}`,
        direction: 'out' as const,
        text: text.trim(),
        time: formatSupportChatTime(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                messages: [...c.messages, msg],
                preview: text.trim(),
                timeLabel: "À l'instant",
              }
            : c
        )
      );
    },
    [selectedId]
  );

  const markResolved = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: true } : c))
    );
  }, []);

  const archiveConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: true, resolved: true } : c))
    );
    setPrimaryFilter('archived');
  }, []);

  const unarchiveConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: false } : c))
    );
    setPrimaryFilter('all');
  }, []);

  return {
    listItems: toListItems(filtered),
    activeThread: toActiveThread(selected),
    selected,
    selectedId,
    search,
    stats,
    mobileView,
    primaryFilter,
    primaryFilterCounts,
    quickFilters,
    studentAcademicFilters,
    studentAcademicFilterCounts,
    programOptions,
    classOptions,
    academicLevelOptions,
    hasActiveFilters: hasActiveQuickFilters(quickFilters) || hasActiveStudentAcademicFilters,
    setSearch,
    setMobileView,
    setPrimaryFilter,
    selectConversation,
    toggleQuickFilter,
    clearQuickFilters,
    clearFilters,
    toggleStudentAcademicFilter,
    sendMessage,
    markResolved,
    archiveConversation,
    unarchiveConversation,
  };
}

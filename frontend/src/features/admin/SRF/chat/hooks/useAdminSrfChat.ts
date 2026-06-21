import { useCallback, useMemo, useState } from 'react';

import { adminSrfConversations } from '../data/adminSrfChatMock';

import { useStudentAcademicChatFilterState } from '../../../shared/chat-filters/useStudentAcademicChatFilterState';

import type { AdminSrfChatMessage, AdminSrfConversation } from '../types/adminSrfChatTypes';

import type { ChatEmptyStateStats } from '../../../shared/admin-module-chat/types/chatEmptyStateTypes';

import type {

  SupportChatThread,

  SupportConversationListItem,

  SupportMobileView,

} from '../../../shared/admin-support-inbox/types/supportInboxTypes';



function nowTime(): string {

  return new Intl.DateTimeFormat('fr-FR', {

    hour: '2-digit',

    minute: '2-digit',

    hour12: false,

  }).format(new Date());

}



export function useAdminSrfChat() {

  const [conversations, setConversations] = useState<AdminSrfConversation[]>(() =>

    adminSrfConversations.map((c) => ({ ...c, messages: [...c.messages] }))

  );

  const [selectedId, setSelectedId] = useState('');

  const [sidebarSearch, setSidebarSearch] = useState('');

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

  } = useStudentAcademicChatFilterState(conversations);



  const filteredConversations = useMemo(() => {

    const q = sidebarSearch.trim().toLowerCase();

    return conversations.filter((c) => {

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

  }, [conversations, matchesStudentAcademic, sidebarSearch]);



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



  const sendMessage = useCallback(

    (text: string) => {

      if (!selectedId || !text.trim()) return;

      const msg: AdminSrfChatMessage = {

        id: `local-${Date.now()}`,

        direction: 'out',

        text: text.trim(),

        time: nowTime(),

      };

      setConversations((prev) =>

        prev.map((c) =>

          c.id === selectedId

            ? {

                ...c,

                messages: [...c.messages, msg],

                lastPreview: text.trim(),

                timeLabel: 'À l\'instant',

              }

            : c

        )

      );

    },

    [selectedId]

  );



  const markThreadRead = useCallback(() => {

    if (!selectedId) return;

    setConversations((prev) =>

      prev.map((c) => (c.id === selectedId ? { ...c, unreadCount: 0 } : c))

    );

  }, [selectedId]);



  const inboxStats = useMemo((): ChatEmptyStateStats => {

    const unread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    const pending = conversations.filter((c) => {

      const last = c.messages[c.messages.length - 1];

      return last?.direction === 'in';

    }).length;

    const resolved = Math.max(conversations.length - pending, 0);

    return { unread, pending, resolved };

  }, [conversations]);



  const listItems = useMemo((): SupportConversationListItem[] => {

    return filteredConversations.map((c) => ({

      id: c.id,

      avatarInitials: c.studentInitials,

      name: c.studentName,

      contextLine: [c.program, c.className !== '—' ? c.className : ''].filter(Boolean).join(' · ') || c.statusLabel,

      preview: c.lastPreview,

      timeLabel: c.timeLabel,

      unreadCount: c.unreadCount,

      statusLabel: c.statusLabel,

    }));

  }, [filteredConversations]);



  const activeThread = useMemo((): SupportChatThread | null => {

    if (!selected) return null;

    return {

      id: selected.id,

      avatarInitials: selected.studentInitials,

      title: selected.studentName,

      meta: selected.statusLabel,

      messages: selected.messages.map((m) => ({

        id: m.id,

        direction: m.direction,

        text: m.text,

        time: m.time,

        separatorBefore: m.separatorBefore,

      })),

    };

  }, [selected]);



  return {

    conversations: filteredConversations,

    listItems,

    activeThread,

    selected,

    selectedId,

    sidebarSearch,

    mobileView,

    studentAcademicFilters,

    studentAcademicFilterCounts,

    programOptions,

    classOptions,

    academicLevelOptions,

    hasActiveFilters: hasActiveStudentAcademicFilters,

    setSidebarSearch,

    setMobileView,

    selectConversation,

    sendMessage,

    markThreadRead,

    toggleStudentAcademicFilter,

    clearStudentAcademicFilters,

    inboxStats,

  };

}



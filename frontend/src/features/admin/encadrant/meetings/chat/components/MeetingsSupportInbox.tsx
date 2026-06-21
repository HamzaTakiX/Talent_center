import { FunctionComponent } from 'react';
import { useChatEmptyState } from '../../../../i18n/useAdminCopy';
import SupportChatWorkspace from '../../../../shared/admin-support-inbox/components/SupportChatWorkspace';
import SupportConversationList from '../../../../shared/admin-support-inbox/components/SupportConversationList';
import SupportInboxShell from '../../../../shared/admin-support-inbox/components/SupportInboxShell';
import type { SupportConversationListItem } from '../../../../shared/admin-support-inbox/types/supportInboxTypes';
import { useMeetingsSupportChat } from '../hooks/useMeetingsSupportChat';
import type { MeetingConversation } from '../types/meetingsChatTypes';
import MeetingsContextPanel from './MeetingsContextPanel';
import MeetingsFilterPanel from './MeetingsFilterPanel';

function toListItems(conversations: MeetingConversation[]): SupportConversationListItem[] {
  return conversations.map((conv) => ({
    id: conv.id,
    avatarInitials: conv.participantInitials,
    name: conv.participantName,
    contextLine: [conv.program, conv.className !== '—' ? conv.className : ''].filter(Boolean).join(' · ') || conv.meetingTitle,
    preview: conv.lastMessage,
    timeLabel: conv.timeLabel,
    unreadCount: conv.unreadCount,
    statusLabel: conv.meetingStatus,
  }));
}

const MeetingsSupportInbox: FunctionComponent = () => {
  const emptyState = useChatEmptyState('meetings');
  const {
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
  } = useMeetingsSupportChat();

  const thread = selected
    ? {
        id: selected.id,
        avatarInitials: selected.participantInitials,
        title: selected.participantName,
        meta: `${selected.meetingTitle} · ${selected.meetingStatus}`,
        messages: selected.messages.map((m) => ({
          id: m.id,
          direction: m.direction,
          text: m.text,
          time: m.time,
          separatorBefore: m.separatorBefore,
        })),
        resolved: selected.resolved,
      }
    : null;

  return (
    <SupportInboxShell
      hasSelection={Boolean(selected)}
      mobileView={mobileView}
      sidebar={
        <SupportConversationList
          items={toListItems(filtered)}
          selectedId={selectedId}
          search={search}
          hasActiveFilters={hasActiveFilters}
          searchPlaceholder="Rechercher des réunions ou participants"
          onSearchChange={setSearch}
          onSelect={selectConversation}
          filtersSlot={
            <MeetingsFilterPanel
              filters={filters}
              hasActiveFilters={hasActiveFilters}
              filterCounts={studentAcademicFilterCounts}
              programOptions={programOptions}
              classOptions={classOptions}
              academicLevelOptions={academicLevelOptions}
              onToggleStatus={toggleStatusFilter}
              onToggleStudentAcademic={toggleStudentAcademicFilter}
              onToggleQuick={toggleQuickFilter}
              onClear={clearFilters}
            />
          }
        />
      }
      workspace={
        <SupportChatWorkspace
          thread={thread}
          emptyState={emptyState}
          stats={stats}
          onSend={sendMessage}
          onBack={() => setMobileView('list')}
          composerPlaceholder="Répondre dans le fil de réunion…"
        />
      }
      contextPanel={selected ? <MeetingsContextPanel conversation={selected} /> : undefined}
    />
  );
};

export default MeetingsSupportInbox;

import { FunctionComponent, ReactNode } from 'react';
import { Archive, ArchiveRestore, CheckCircle2 } from 'lucide-react';

import type { AdminChatChannel } from '../../../i18n/useAdminCopy';

import { useAdminChatChannel, useChatEmptyState } from '../../../i18n/useAdminCopy';
import { useInternshipInboxCopy } from '../../../offres-stage/hooks/useOffersListLabels';
import { useAdminToast } from '../../../dashboard/context/AdminToastContext';

import type { AdminChatMessage, AdminChatParticipant } from '../../admin-module-chat/adminChatTypes';

import DeskStudentFilterPanel from '../../chat-filters/DeskStudentFilterPanel';

import type { DeskConversationRecord } from '../adapters/mapDeskChatData';

import { useDeskSupportChat } from '../hooks/useDeskSupportChat';

import SupportChatWorkspace from './SupportChatWorkspace';

import SupportConversationList from './SupportConversationList';

import SupportInboxShell from './SupportInboxShell';

interface Props {
  channel: AdminChatChannel;
  participants: AdminChatParticipant[];
  initialMessages: Record<string, AdminChatMessage[]>;
  renderContextPanel?: (conversation: DeskConversationRecord) => ReactNode;
  searchPlaceholder?: string;
  showQuickFilters?: boolean;
}

const DeskSupportInbox: FunctionComponent<Props> = ({
  channel,
  participants,
  initialMessages,
  renderContextPanel,
  searchPlaceholder,
  showQuickFilters = true,
}) => {
  const chatCopy = useAdminChatChannel(channel);
  const emptyState = useChatEmptyState(channel);
  const toast = useAdminToast();
  const { t: inboxT } = useInternshipInboxCopy();

  const {
    listItems,
    activeThread,
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
    hasActiveFilters,
    setSearch,
    setMobileView,
    setPrimaryFilter,
    selectConversation,
    toggleQuickFilter,
    clearFilters,
    toggleStudentAcademicFilter,
    sendMessage,
    markResolved,
    archiveConversation,
    unarchiveConversation,
  } = useDeskSupportChat({ participants, initialMessages });

  const handleResolved = () => {
    if (!selectedId) return;
    markResolved(selectedId);
    toast.showToast('Conversation marquée comme résolue', 'success');
  };

  const handleArchive = () => {
    if (!selectedId) return;
    archiveConversation(selectedId);
    toast.showToast('Conversation archivée', 'info');
  };

  const handleUnarchive = () => {
    if (!selectedId) return;
    unarchiveConversation(selectedId);
    toast.showToast('Conversation restaurée', 'success');
  };

  return (
    <SupportInboxShell
      hasSelection={Boolean(selected)}
      mobileView={mobileView}
      sidebar={
        <SupportConversationList
          items={listItems}
          selectedId={selectedId}
          search={search}
          hasActiveFilters={hasActiveFilters}
          searchPlaceholder={searchPlaceholder ?? chatCopy.searchPlaceholder}
          onSearchChange={setSearch}
          onSelect={selectConversation}
          primaryFilter={primaryFilter}
          primaryFilterCounts={primaryFilterCounts}
          onSetPrimaryFilter={setPrimaryFilter}
          filtersSlot={
            <DeskStudentFilterPanel
              quickFilters={quickFilters}
              studentFilters={studentAcademicFilters}
              hasActiveFilters={hasActiveFilters}
              filterCounts={studentAcademicFilterCounts}
              programOptions={programOptions}
              classOptions={classOptions}
              academicLevelOptions={academicLevelOptions}
              onToggleQuick={toggleQuickFilter}
              onToggleStudentAcademic={toggleStudentAcademicFilter}
              onClear={clearFilters}
              showQuickFilters={showQuickFilters}
            />
          }
        />
      }
      workspace={
        <SupportChatWorkspace
          thread={activeThread}
          emptyState={emptyState}
          stats={stats}
          onSend={sendMessage}
          onBack={() => setMobileView('list')}
          headerMeta={selected?.subtitle ?? selected?.workflowStatus}
          composerPlaceholder={chatCopy.composerPlaceholder}
          headerActions={
            selected ? (
              <>
                {!selected.resolved ? (
                  <button type="button" onClick={handleResolved} className="isi-header-btn">
                    <CheckCircle2 className="size-4" />
                    <span>{inboxT('resolve')}</span>
                  </button>
                ) : null}
                {selected.archived ? (
                  <button type="button" onClick={handleUnarchive} className="isi-header-btn">
                    <ArchiveRestore className="size-4" />
                    <span>{inboxT('unarchive')}</span>
                  </button>
                ) : (
                  <button type="button" onClick={handleArchive} className="isi-header-btn">
                    <Archive className="size-4" />
                    <span>{inboxT('archive')}</span>
                  </button>
                )}
              </>
            ) : undefined
          }
        />
      }
      contextPanel={selected && renderContextPanel ? renderContextPanel(selected) : undefined}
    />
  );
};

export default DeskSupportInbox;

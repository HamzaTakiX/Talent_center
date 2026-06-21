import { FunctionComponent, ReactNode } from 'react';

import type { AdminChatChannel } from '../../../i18n/useAdminCopy';

import { useAdminChatChannel, useChatEmptyState } from '../../../i18n/useAdminCopy';

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



  const {

    listItems,

    activeThread,

    selected,

    selectedId,

    search,

    stats,

    mobileView,

    quickFilters,

    studentAcademicFilters,

    studentAcademicFilterCounts,

    programOptions,

    classOptions,

    academicLevelOptions,

    hasActiveFilters,

    setSearch,

    setMobileView,

    selectConversation,

    toggleQuickFilter,

    clearFilters,

    toggleStudentAcademicFilter,

    sendMessage,

  } = useDeskSupportChat({ participants, initialMessages });



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

        />

      }

      contextPanel={selected && renderContextPanel ? renderContextPanel(selected) : undefined}

    />

  );

};



export default DeskSupportInbox;



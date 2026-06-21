import { FunctionComponent } from 'react';

import { useChatEmptyState } from '../../../i18n/useAdminCopy';

import SupportChatWorkspace from '../../../shared/admin-support-inbox/components/SupportChatWorkspace';

import SupportConversationList from '../../../shared/admin-support-inbox/components/SupportConversationList';

import SupportInboxShell from '../../../shared/admin-support-inbox/components/SupportInboxShell';

import { useAdminSrfChat } from '../hooks/useAdminSrfChat';

import SrfFinancialContextPanel from './SrfFinancialContextPanel';

import SrfStudentFilterPanel from './SrfStudentFilterPanel';



const SrfSupportInbox: FunctionComponent = () => {

  const emptyState = useChatEmptyState('srf');

  const {

    listItems,

    activeThread,

    selected,

    selectedId,

    sidebarSearch,

    mobileView,

    inboxStats,

    studentAcademicFilters,

    studentAcademicFilterCounts,

    programOptions,

    classOptions,

    academicLevelOptions,

    hasActiveFilters,

    setSidebarSearch,

    setMobileView,

    selectConversation,

    sendMessage,

    toggleStudentAcademicFilter,

    clearStudentAcademicFilters,

  } = useAdminSrfChat();



  return (

    <SupportInboxShell

      hasSelection={Boolean(selected)}

      mobileView={mobileView}

      sidebar={

        <SupportConversationList

          items={listItems}

          selectedId={selectedId}

          search={sidebarSearch}

          hasActiveFilters={hasActiveFilters}

          searchPlaceholder="Rechercher un étudiant…"

          onSearchChange={setSidebarSearch}

          onSelect={selectConversation}

          emptyMessage="Aucun étudiant trouvé"

          filtersSlot={

            <SrfStudentFilterPanel

              filters={studentAcademicFilters}

              hasActiveFilters={hasActiveFilters}

              filterCounts={studentAcademicFilterCounts}

              programOptions={programOptions}

              classOptions={classOptions}

              academicLevelOptions={academicLevelOptions}

              onToggle={toggleStudentAcademicFilter}

              onClear={clearStudentAcademicFilters}

            />

          }

        />

      }

      workspace={

        <SupportChatWorkspace

          thread={activeThread}

          emptyState={emptyState}

          stats={{

            unread: inboxStats.unread ?? 0,

            pending: inboxStats.pending ?? 0,

            resolved: inboxStats.resolved ?? 0,

          }}

          onSend={sendMessage}

          onBack={() => setMobileView('list')}

          composerPlaceholder="Enregistrer une note trésorerie…"

        />

      }

      contextPanel={selected ? <SrfFinancialContextPanel conversation={selected} /> : undefined}

    />

  );

};



export default SrfSupportInbox;



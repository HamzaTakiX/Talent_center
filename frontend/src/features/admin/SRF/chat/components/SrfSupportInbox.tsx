import { FunctionComponent, useEffect, useRef, useState } from 'react';

import { CircleDollarSign } from 'lucide-react';

import { useTranslation } from 'react-i18next';

import { useSearchParams, useLocation } from 'react-router-dom';

import { srfApi } from '../../../api/srf';

import { useOptionalAdminToast } from '../../../dashboard/context/AdminToastContext';

import { InternshipChatContextPanelSkeleton } from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';

import SupportConversationList from '../../../shared/admin-support-inbox/components/SupportConversationList';

import SupportInboxShell from '../../../shared/admin-support-inbox/components/SupportInboxShell';

import { useSrfSupportChat } from '../hooks/useAdminSrfChat';

import AdminSrfChatThread from './AdminSrfChatThread';

import SrfFinancialContextPanel from './SrfFinancialContextPanel';

import SrfStudentFilterPanel from './SrfStudentFilterPanel';



const SrfSupportInbox: FunctionComponent = () => {

  const { t } = useTranslation();

  const toast = useOptionalAdminToast();

  const [searchParams, setSearchParams] = useSearchParams();

  const location = useLocation();

  const accountFromUrl = searchParams.get('account') ?? '';

  const isOpeningFromAccount =

    searchParams.get('opening') === '1' && accountFromUrl.trim() !== '';

  const [openingAccountChat, setOpeningAccountChat] = useState(false);

  const openingAttemptRef = useRef<string | null>(null);



  const {
    listItems,

    selected,

    selectedId,

    sidebarSearch,

    mobileView,

    inboxStats,

    loading,

    conversationLoading,

    messagesLoading,

    loadError,

    studentAcademicFilters,

    studentAcademicFilterCounts,

    programOptions,

    classOptions,

    academicLevelOptions,

    hasActiveFilters,

    primaryFilter,

    primaryFilterCounts,

    setSidebarSearch,

    setMobileView,

    setPrimaryFilter,

    selectConversation,

    clearSelection,

    sendMessage,

    toggleStudentAcademicFilter,

    clearStudentAcademicFilters,

    archiveConversation,

    unarchiveConversation,

    reloadConversations,

  } = useSrfSupportChat();



  useEffect(() => {

    const openingFromAccount =

      searchParams.get('opening') === '1' && Boolean(searchParams.get('account')?.trim());

    if (openingFromAccount || openingAccountChat) return;



    clearSelection();

    if (searchParams.get('conversation')) {

      const next = new URLSearchParams(searchParams);

      next.delete('conversation');

      setSearchParams(next, { replace: true });

    }

  }, [location.key]);



  useEffect(() => {

    const accountParam = searchParams.get('account')?.trim() ?? '';

    const shouldOpen = searchParams.get('opening') === '1' && accountParam !== '';



    if (!shouldOpen) {

      openingAttemptRef.current = null;

      return;

    }



    if (openingAttemptRef.current === accountParam) return;

    openingAttemptRef.current = accountParam;



    const accountId = Number(accountParam);

    if (!Number.isFinite(accountId)) {

      const next = new URLSearchParams(searchParams);

      next.delete('account');

      next.delete('opening');

      setSearchParams(next, { replace: true });

      return;

    }



    let cancelled = false;

    setOpeningAccountChat(true);



    void srfApi

      .openChat(accountId)

      .then(async ({ conversation_id }) => {

        if (cancelled) return;

        const next = new URLSearchParams(searchParams);

        next.delete('account');

        next.delete('opening');

        next.set('conversation', String(conversation_id));

        setSearchParams(next, { replace: true });

        await selectConversation(String(conversation_id));

        void reloadConversations({ silent: true });

      })

      .catch(() => {

        if (cancelled) return;

        openingAttemptRef.current = null;

        toast.showToast(t('admin.common.detailModal.student.chatOpenError'), 'error');

        const next = new URLSearchParams(searchParams);

        next.delete('account');

        next.delete('opening');

        setSearchParams(next, { replace: true });

      })

      .finally(() => {

        if (!cancelled) setOpeningAccountChat(false);

      });



    return () => {

      cancelled = true;

    };

  }, [searchParams, setSearchParams, selectConversation, reloadConversations, t, toast]);



  const handleArchive = () => {

    if (!selectedId) return;

    void archiveConversation(selectedId).then(() => {

      toast.showToast('Conversation archivée', 'info');

    });

  };



  const handleUnarchive = () => {

    if (!selectedId) return;

    void unarchiveConversation(selectedId).then(() => {

      toast.showToast('Conversation restaurée', 'success');

    });

  };



  const isOpeningConversation =

    openingAccountChat ||

    isOpeningFromAccount ||

    (loading && !selectedId) ||

    (conversationLoading && !selected);



  const hasSelection = Boolean(selected) || isOpeningConversation;



  return (

    <SupportInboxShell

      hasSelection={hasSelection}

      mobileView={mobileView}

      sidebar={

        <SupportConversationList

          title={t('admin.chat.conversations', { defaultValue: 'Conversations' })}

          subtitle={t('student.srf.chat.sidebarSubtitle', {

            defaultValue: 'SRF — Suivi financier',

          })}

          icon={CircleDollarSign}

          items={listItems}

          loading={loading && listItems.length === 0}

          loadError={loadError}

          selectedId={selectedId}

          search={sidebarSearch}

          hasActiveFilters={hasActiveFilters}

          searchPlaceholder={t('admin.modules.srf.chat.searchPlaceholder', {

            defaultValue: 'Rechercher un étudiant…',

          })}

          onSearchChange={setSidebarSearch}

          onSelect={(id) => void selectConversation(id)}

          primaryFilter={primaryFilter}

          primaryFilterCounts={primaryFilterCounts}

          onSetPrimaryFilter={setPrimaryFilter}

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

        <AdminSrfChatThread

          conversation={selected}

          stats={inboxStats}

          statsLoading={loading}

          conversationLoading={isOpeningConversation}

          messagesLoading={messagesLoading}

          onSend={(text, tagCodes, entityRefs) => void sendMessage(text, tagCodes, entityRefs)}

          onBack={() => setMobileView('list')}

          onArchive={handleArchive}

          onUnarchive={handleUnarchive}

        />

      }

      contextPanel={

        selected ? (

          <SrfFinancialContextPanel conversation={selected} />

        ) : isOpeningConversation ? (

          <InternshipChatContextPanelSkeleton />

        ) : undefined

      }

    />

  );

};



export default SrfSupportInbox;


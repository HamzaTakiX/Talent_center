import { FunctionComponent, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SupportInboxShell from '../../../../admin/shared/admin-support-inbox/components/SupportInboxShell';
import { InternshipChatContextPanelSkeleton } from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';
import StudentLayout from '../../../components/StudentLayout';
import { STUDENT_DOCUMENTS_CHAT_PATH, studentDocumentDetailPath } from '../../constants/routes';
import { useStudentDocumentChat } from '../hooks/useStudentDocumentChat';
import StudentDocumentChatArea from './StudentDocumentChatArea';
import StudentDocumentContextPanel from './StudentDocumentContextPanel';
import StudentDocumentConversationList from './StudentDocumentConversationList';

const StudentDocumentSupportInbox: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceFromUrl = searchParams.get('service') ?? '';
  const deepLinkHandled = useRef(false);

  const {
    conversations,
    selected,
    selectedId,
    filters,
    search,
    loading,
    loadError,
    conversationLoading,
    messagesLoading,
    mobileView,
    unreadTotal,
    primaryFilterCounts,
    hasActiveFilters,
    peerTyping,
    setSearch,
    setMobileView,
    setPrimaryFilter,
    toggleQuickFilter,
    clearFilters,
    openConversationById,
    openConversationForService,
    sendMessage,
    notifyTyping,
    archiveConversation,
    unarchiveConversation,
  } = useStudentDocumentChat();

  useEffect(() => {
    if (deepLinkHandled.current || !serviceFromUrl) return;
    deepLinkHandled.current = true;
    void openConversationForService(serviceFromUrl);
    navigate(STUDENT_DOCUMENTS_CHAT_PATH, { replace: true });
  }, [serviceFromUrl, openConversationForService, navigate]);

  const goService = () => {
    if (selected?.serviceId) {
      navigate(studentDocumentDetailPath(selected.serviceId));
    }
  };

  const isOpeningConversation = conversationLoading && !selected;

  return (
    <SupportInboxShell
      Layout={StudentLayout}
      hasSelection={Boolean(selected) || isOpeningConversation}
      mobileView={mobileView}
      sidebar={
        <StudentDocumentConversationList
          conversations={conversations}
          selectedId={selectedId}
          loading={loading}
          loadError={loadError}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          primaryFilterCounts={primaryFilterCounts}
          search={search}
          sidebarTitle={t('student.documents.chat.sidebarTitle', {
            defaultValue: 'Questions sur les documents',
          })}
          sidebarSubtitle={t('student.documents.chat.sidebarSubtitle', {
            defaultValue: 'Échangez avec le bureau des documents',
          })}
          searchPlaceholder={t('student.documents.chat.search')}
          onSetPrimary={setPrimaryFilter}
          onToggleQuickFilter={toggleQuickFilter}
          onClearFilters={clearFilters}
          onSearchChange={setSearch}
          onSelect={(id) => void openConversationById(id)}
        />
      }
      workspace={
        <StudentDocumentChatArea
          conversation={selected}
          unreadTotal={unreadTotal}
          messagesLoading={messagesLoading}
          conversationLoading={conversationLoading}
          statsLoading={loading}
          peerTyping={peerTyping}
          onSend={(text, files, tagCodes, entityRefs) => void sendMessage(text, files, tagCodes, entityRefs)}
          onTyping={notifyTyping}
          onBack={() => setMobileView('list')}
          onArchive={() => selectedId && void archiveConversation(selectedId)}
          onUnarchive={() => selectedId && void unarchiveConversation(selectedId)}
        />
      }
      contextPanel={
        selected ? (
          <StudentDocumentContextPanel conversation={selected} onViewService={goService} />
        ) : isOpeningConversation ? (
          <InternshipChatContextPanelSkeleton />
        ) : undefined
      }
    />
  );
};

export default StudentDocumentSupportInbox;

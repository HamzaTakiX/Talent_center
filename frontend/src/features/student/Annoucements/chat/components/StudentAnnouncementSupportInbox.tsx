import { FunctionComponent, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SupportInboxShell from '../../../../admin/shared/admin-support-inbox/components/SupportInboxShell';
import { InternshipChatContextPanelSkeleton } from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';
import StudentLayout from '../../../components/StudentLayout';
import { STUDENT_ANNOUNCEMENTS_PATH, getStudentAnnouncementDetailPath } from '../../constants/routes';
import { STUDENT_ANNOUNCEMENTS_CHAT_PATH } from '../constants/routes';
import { useStudentAnnouncementChat } from '../hooks/useStudentAnnouncementChat';
import StudentAnnouncementChatArea from './StudentAnnouncementChatArea';
import StudentAnnouncementContextPanel from './StudentAnnouncementContextPanel';
import StudentAnnouncementConversationList from './StudentAnnouncementConversationList';

const StudentAnnouncementSupportInbox: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const announcementFromUrl = searchParams.get('announcement') ?? '';
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
    announcementTypeOptions,
    hasActiveFilters,
    peerTyping,
    setSearch,
    setMobileView,
    setPrimaryFilter,
    toggleAnnouncementTypeFilter,
    togglePriorityFilter,
    toggleQuickFilter,
    clearFilters,
    openConversationById,
    openConversationForAnnouncement,
    sendMessage,
    notifyTyping,
    archiveConversation,
    unarchiveConversation,
  } = useStudentAnnouncementChat();

  useEffect(() => {
    if (deepLinkHandled.current || !announcementFromUrl) return;
    deepLinkHandled.current = true;
    void openConversationForAnnouncement(announcementFromUrl);
    navigate(STUDENT_ANNOUNCEMENTS_CHAT_PATH, { replace: true });
  }, [announcementFromUrl, openConversationForAnnouncement, navigate]);

  const goAnnouncement = () => {
    if (selected?.announcementId) {
      navigate(getStudentAnnouncementDetailPath(selected.announcementId));
      return;
    }
    navigate(STUDENT_ANNOUNCEMENTS_PATH);
  };

  const isOpeningConversation = conversationLoading && !selected;

  return (
    <SupportInboxShell
      Layout={StudentLayout}
      hasSelection={Boolean(selected) || isOpeningConversation}
      mobileView={mobileView}
      sidebar={
        <StudentAnnouncementConversationList
          conversations={conversations}
          selectedId={selectedId}
          loading={loading}
          loadError={loadError}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          primaryFilterCounts={primaryFilterCounts}
          announcementTypeOptions={announcementTypeOptions}
          search={search}
          sidebarTitle={t('student.announcements.chat.sidebarTitle')}
          sidebarSubtitle={t('student.announcements.chat.sidebarSubtitle')}
          searchPlaceholder={t('student.announcements.chat.search')}
          onSetPrimary={setPrimaryFilter}
          onToggleAnnouncementType={toggleAnnouncementTypeFilter}
          onTogglePriority={togglePriorityFilter}
          onToggleQuickFilter={toggleQuickFilter}
          onClearFilters={clearFilters}
          onSearchChange={setSearch}
          onSelect={(id) => void openConversationById(id)}
        />
      }
      workspace={
        <StudentAnnouncementChatArea
          conversation={selected}
          unreadTotal={unreadTotal}
          messagesLoading={messagesLoading}
          conversationLoading={conversationLoading}
          statsLoading={loading}
          peerTyping={peerTyping}
          onSend={(text, files, tagCodes, entityRefs) => void sendMessage(text, files, tagCodes, entityRefs)}
          onTyping={notifyTyping}
          onBack={() => setMobileView('list')}
          onViewAnnouncement={goAnnouncement}
          onArchive={() => selectedId && void archiveConversation(selectedId)}
          onUnarchive={() => selectedId && void unarchiveConversation(selectedId)}
        />
      }
      contextPanel={
        selected ? (
          <StudentAnnouncementContextPanel
            conversation={selected}
            onViewAnnouncement={goAnnouncement}
          />
        ) : isOpeningConversation ? (
          <InternshipChatContextPanelSkeleton />
        ) : undefined
      }
    />
  );
};

export default StudentAnnouncementSupportInbox;

import { FunctionComponent, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import InternshipConversationList from '../../../../admin/offres-stage/chat/components/InternshipConversationList';
import { useInternshipSupportChat } from '../../../../admin/offres-stage/chat/hooks/useInternshipSupportChat';
import SupportInboxShell from '../../../../admin/shared/admin-support-inbox/components/SupportInboxShell';
import StudentLayout from '../../../components/StudentLayout';
import { getInternshipOfferDetailsPath } from '../../constants/routes';
import { STUDENT_CHAT_PATH } from '../constants/routes';
import StudentInternshipChatArea from './StudentInternshipChatArea';
import StudentInternshipContextPanel from './StudentInternshipContextPanel';
import { InternshipChatContextPanelSkeleton } from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';

const StudentInternshipSupportInbox: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conversationFromUrl = searchParams.get('conversation') ?? '';
  const offerFromUrl = searchParams.get('offer') ?? '';
  const deepLinkHandled = useRef(false);

  const {
    filtered,
    selected,
    selectedId,
    filters,
    search,
    stats,
    emptyStateStats,
    filterCounts,
    primaryFilterCounts,
    programOptions,
    classOptions,
    academicLevelOptions,
    internshipTypeOptions,
    mobileView,
    loading,
    conversationLoading,
    messagesLoading,
    hasActiveFilters,
    setSearch,
    setMobileView,
    setPrimaryFilter,
    selectConversation,
    openConversationById,
    openConversationForOffer,
    toggleFilter,
    clearFilters,
    sendMessage,
    peerTyping,
    notifyTyping,
    archiveConversation,
    unarchiveConversation,
  } = useInternshipSupportChat('student');

  useEffect(() => {
    if (deepLinkHandled.current) return;
    if (offerFromUrl) {
      deepLinkHandled.current = true;
      void openConversationForOffer(offerFromUrl);
      navigate(STUDENT_CHAT_PATH, { replace: true });
      return;
    }
    if (conversationFromUrl) {
      deepLinkHandled.current = true;
      void openConversationById(conversationFromUrl);
    }
  }, [conversationFromUrl, offerFromUrl, openConversationById, openConversationForOffer, navigate]);

  const goOffer = () => {
    if (selected?.offerUuid) {
      navigate(getInternshipOfferDetailsPath(selected.offerUuid));
    }
  };

  const isOpeningConversation = conversationLoading && !selected;

  return (
    <SupportInboxShell
      Layout={StudentLayout}
      hasSelection={Boolean(selected) || isOpeningConversation}
      mobileView={mobileView}
      sidebar={
        <InternshipConversationList
          variant="student"
          conversations={filtered}
          selectedId={selectedId}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          filterCounts={filterCounts}
          primaryFilterCounts={primaryFilterCounts}
          programOptions={programOptions}
          classOptions={classOptions}
          academicLevelOptions={academicLevelOptions}
          internshipTypeOptions={internshipTypeOptions}
          loading={loading}
          search={search}
          sidebarTitle={t('student.internshipOffers.chat.sidebarTitle')}
          sidebarSubtitle={t('student.internshipOffers.chat.sidebarSubtitle')}
          searchPlaceholder={t('student.internshipOffers.chat.search')}
          onSetPrimary={setPrimaryFilter}
          onToggleFilter={toggleFilter}
          onClearFilters={clearFilters}
          onSearchChange={setSearch}
          onSelect={(id) => void selectConversation(id)}
        />
      }
      workspace={
        <StudentInternshipChatArea
          conversation={selected}
          stats={stats}
          emptyStateStats={emptyStateStats}
          messagesLoading={messagesLoading}
          conversationLoading={conversationLoading}
          statsLoading={loading}
          onSend={(text, files, tagCodes, entityRefs) => void sendMessage(text, files, tagCodes, entityRefs)}
          onBack={() => setMobileView('list')}
          onViewOffer={goOffer}
          onArchive={() => selectedId && void archiveConversation(selectedId)}
          onUnarchive={() => selectedId && void unarchiveConversation(selectedId)}
          peerTyping={peerTyping}
          onTyping={notifyTyping}
        />
      }
      contextPanel={
        selected ? (
          <StudentInternshipContextPanel conversation={selected} />
        ) : isOpeningConversation ? (
          <InternshipChatContextPanelSkeleton />
        ) : undefined
      }
    />
  );
};

export default StudentInternshipSupportInbox;

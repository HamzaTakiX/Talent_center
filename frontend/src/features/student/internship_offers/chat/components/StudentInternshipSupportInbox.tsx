import { FunctionComponent, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import InternshipConversationList from '../../../../admin/offres-stage/chat/components/InternshipConversationList';
import { useInternshipSupportChat } from '../../../../admin/offres-stage/chat/hooks/useInternshipSupportChat';
import SupportInboxShell from '../../../../admin/shared/admin-support-inbox/components/SupportInboxShell';
import StudentLayout from '../../../components/StudentLayout';
import { getInternshipOfferDetailsPath } from '../../constants/routes';
import StudentInternshipChatArea from './StudentInternshipChatArea';
import StudentInternshipContextPanel from './StudentInternshipContextPanel';

const StudentInternshipSupportInbox: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conversationFromUrl = searchParams.get('conversation') ?? '';

  const {
    filtered,
    selected,
    selectedId,
    filters,
    search,
    stats,
    filterCounts,
    primaryFilterCounts,
    programOptions,
    classOptions,
    academicLevelOptions,
    internshipTypeOptions,
    mobileView,
    loading,
    hasActiveFilters,
    setSearch,
    setMobileView,
    setPrimaryFilter,
    selectConversation,
    toggleFilter,
    clearFilters,
    sendMessage,
  } = useInternshipSupportChat();

  useEffect(() => {
    if (!conversationFromUrl || loading) return;
    if (filtered.some((c) => c.id === conversationFromUrl)) {
      void selectConversation(conversationFromUrl);
    }
  }, [conversationFromUrl, filtered, loading, selectConversation]);

  const goOffer = () => {
    if (selected?.offerUuid) {
      navigate(getInternshipOfferDetailsPath(selected.offerUuid));
    }
  };

  return (
    <SupportInboxShell
      Layout={StudentLayout}
      hasSelection={Boolean(selected)}
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
          onSend={(text) => void sendMessage(text)}
          onBack={() => setMobileView('list')}
          onViewOffer={goOffer}
        />
      }
      contextPanel={selected ? <StudentInternshipContextPanel conversation={selected} /> : undefined}
    />
  );
};

export default StudentInternshipSupportInbox;

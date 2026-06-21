import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminToast } from '../../../dashboard/context/AdminToastContext';
import SupportInboxShell from '../../../shared/admin-support-inbox/components/SupportInboxShell';
import { useInternshipSupportChat } from '../hooks/useInternshipSupportChat';
import InternshipChatArea from './InternshipChatArea';
import InternshipContextPanel from './InternshipContextPanel';
import InternshipConversationList from './InternshipConversationList';

const InternshipSupportInbox: FunctionComponent = () => {
  const toast = useAdminToast();
  const navigate = useNavigate();

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
    markResolved,
    archiveConversation,
  } = useInternshipSupportChat();

  const handleResolved = () => {
    if (!selectedId) return;
    void markResolved(selectedId).then(() => {
      toast.showToast('Conversation marquée comme résolue', 'success');
    });
  };

  const handleArchive = () => {
    if (!selectedId) return;
    void archiveConversation(selectedId).then(() => {
      toast.showToast('Conversation archivée', 'info');
    });
  };

  const goStudent = () => {
    if (selected?.studentProfileId) {
      navigate(`/admin/students/${selected.studentProfileId}`);
    }
  };

  const goOffer = () => {
    if (selected?.offerUuid) {
      navigate(`/admin/internship-offers/${selected.offerUuid}`);
    }
  };

  const goApplication = () => {
    if (selected?.applicationUuid) {
      navigate(`/admin/internship-offers/applications/${selected.applicationUuid}`);
    }
  };

  return (
    <SupportInboxShell
      hasSelection={Boolean(selected)}
      mobileView={mobileView}
      sidebar={
        <InternshipConversationList
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
          onSetPrimary={setPrimaryFilter}
          onToggleFilter={toggleFilter}
          onClearFilters={clearFilters}
          onSearchChange={setSearch}
          onSelect={(id) => void selectConversation(id)}
        />
      }
      workspace={
        <InternshipChatArea
          conversation={selected}
          stats={stats}
          onSend={(text) => void sendMessage(text)}
          onBack={() => setMobileView('list')}
          onViewStudent={goStudent}
          onViewApplication={goApplication}
          onViewOffer={goOffer}
          onMarkResolved={handleResolved}
          onArchive={handleArchive}
        />
      }
      contextPanel={selected ? <InternshipContextPanel conversation={selected} /> : undefined}
    />
  );
};

export default InternshipSupportInbox;

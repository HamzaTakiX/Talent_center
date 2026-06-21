import { FunctionComponent, useState } from 'react';
import { useAdminToast } from '../../../dashboard/context/AdminToastContext';
import SupportInboxShell from '../../../shared/admin-support-inbox/components/SupportInboxShell';
import { useAnnouncementSupportChat } from '../hooks/useAnnouncementSupportChat';
import AnnouncementChatArea from './AnnouncementChatArea';
import AnnouncementContextPanel from './AnnouncementContextPanel';
import AnnouncementConversationList from './AnnouncementConversationList';
import { AnnouncementDetailModals } from './AnnouncementDetailModals';

const AnnouncementSupportInbox: FunctionComponent = () => {
  const toast = useAdminToast();
  const [announcementModal, setAnnouncementModal] = useState(false);
  const [studentModal, setStudentModal] = useState(false);
  const [audienceModal, setAudienceModal] = useState(false);

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
    toggleFilter,
    toggleQuickFilter,
    toggleStudentAcademicFilter,
    clearFilters,
    sendMessage,
    markResolved,
    archiveConversation,
  } = useAnnouncementSupportChat();

  const openAnnouncement = () => setAnnouncementModal(true);
  const openStudent = () => setStudentModal(true);
  const openAudience = () => setAudienceModal(true);

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

  return (
    <SupportInboxShell
      hasSelection={Boolean(selected)}
      mobileView={mobileView}
      sidebar={
        <AnnouncementConversationList
          conversations={filtered}
          selectedId={selectedId}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          filterCounts={studentAcademicFilterCounts}
          programOptions={programOptions}
          classOptions={classOptions}
          academicLevelOptions={academicLevelOptions}
          search={search}
          onToggleFilter={toggleFilter}
          onToggleStudentAcademicFilter={toggleStudentAcademicFilter}
          onToggleQuickFilter={toggleQuickFilter}
          onClearFilters={clearFilters}
          onSearchChange={setSearch}
          onSelect={selectConversation}
        />
      }
      workspace={
        <AnnouncementChatArea
          conversation={selected}
          stats={stats}
          onSend={sendMessage}
          onBack={() => setMobileView('list')}
          onOpenAnnouncement={openAnnouncement}
          onOpenStudent={openStudent}
          onOpenAudience={openAudience}
          onMarkResolved={handleResolved}
          onArchive={handleArchive}
        />
      }
      contextPanel={
        selected ? (
          <AnnouncementContextPanel
            conversation={selected}
            onOpenAnnouncement={openAnnouncement}
            onOpenStudent={openStudent}
            onOpenAudience={openAudience}
          />
        ) : undefined
      }
      overlays={
        <AnnouncementDetailModals
          conversation={selected}
          announcementOpen={announcementModal}
          studentOpen={studentModal}
          audienceOpen={audienceModal}
          onCloseAnnouncement={() => setAnnouncementModal(false)}
          onCloseStudent={() => setStudentModal(false)}
          onCloseAudience={() => setAudienceModal(false)}
        />
      }
    />
  );
};

export default AnnouncementSupportInbox;

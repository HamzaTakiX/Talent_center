import { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminToast } from '../../../dashboard/context/AdminToastContext';
import StudentDetailModal from '../../../student/components/StudentDetailModal';
import SupportInboxShell from '../../../shared/admin-support-inbox/components/SupportInboxShell';
import { useAnnouncementSupportChat } from '../hooks/useAnnouncementSupportChat';
import { announcementViewPath } from '../utils/announcementChatNavigation';
import AnnouncementChatArea from './AnnouncementChatArea';
import AnnouncementContextPanel from './AnnouncementContextPanel';
import AnnouncementConversationList from './AnnouncementConversationList';
import { InternshipChatContextPanelSkeleton } from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';

const AnnouncementSupportInbox: FunctionComponent = () => {
  const toast = useAdminToast();
  const navigate = useNavigate();
  const [viewStudentUserId, setViewStudentUserId] = useState<number | null>(null);

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
    primaryFilterCounts,
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
    unarchiveConversation,
    notifyTyping,
    loading,
    conversationLoading,
    messagesLoading,
    loadError,
    peerTyping,
    setPrimaryFilter,
  } = useAnnouncementSupportChat();

  const openAnnouncementView = () => {
    const path = announcementViewPath(selected?.announcementUuid);
    if (path) navigate(path);
  };

  const openStudentModal = () => {
    if (!selected?.studentUserId) return;
    setViewStudentUserId(selected.studentUserId);
  };

  const isOpeningConversation = conversationLoading && !selected;

  const handleResolved = () => {
    if (!selectedId) return;
    void markResolved(selectedId);
    toast.showToast('Conversation marquée comme résolue', 'success');
  };

  const handleArchive = () => {
    if (!selectedId) return;
    void archiveConversation(selectedId);
    toast.showToast('Conversation archivée', 'info');
  };

  const handleUnarchive = () => {
    if (!selectedId) return;
    void unarchiveConversation(selectedId);
    toast.showToast('Conversation restaurée', 'success');
  };

  return (
    <>
      <StudentDetailModal
        open={viewStudentUserId != null}
        studentId={viewStudentUserId}
        preview={
          selected && viewStudentUserId === selected.studentUserId
            ? {
                name: selected.studentName,
                email: selected.studentEmail,
                avatarUrl: selected.studentAvatarUrl,
                initials: selected.studentInitials,
              }
            : undefined
        }
        onClose={() => setViewStudentUserId(null)}
        onEdit={(id) => {
          setViewStudentUserId(null);
          navigate(`/admin/students/${id}/edit`);
        }}
      />

      <SupportInboxShell
        hasSelection={Boolean(selected) || isOpeningConversation}
        mobileView={mobileView}
        sidebar={
          <AnnouncementConversationList
            conversations={filtered}
            loading={loading}
            loadError={loadError}
            selectedId={selectedId}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            filterCounts={studentAcademicFilterCounts}
            primaryFilterCounts={primaryFilterCounts}
            programOptions={programOptions}
            classOptions={classOptions}
            academicLevelOptions={academicLevelOptions}
            search={search}
            onSetPrimary={setPrimaryFilter}
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
            messagesLoading={messagesLoading}
            conversationLoading={conversationLoading}
            statsLoading={loading}
            peerTyping={peerTyping}
            onSend={(text) => void sendMessage(text)}
            onTyping={notifyTyping}
            onBack={() => setMobileView('list')}
            onMarkResolved={handleResolved}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
          />
        }
        contextPanel={
          selected ? (
            <AnnouncementContextPanel
              conversation={selected}
              onOpenAnnouncement={openAnnouncementView}
              onOpenStudent={openStudentModal}
            />
          ) : isOpeningConversation ? (
            <InternshipChatContextPanelSkeleton />
          ) : undefined
        }
      />
    </>
  );
};

export default AnnouncementSupportInbox;

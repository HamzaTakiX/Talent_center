import { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminToast } from '../../../dashboard/context/AdminToastContext';
import StudentDetailModal from '../../../student/components/StudentDetailModal';
import SupportInboxShell from '../../../shared/admin-support-inbox/components/SupportInboxShell';
import { InternshipChatContextPanelSkeleton } from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import { useDocumentSupportChat } from '../hooks/useDocumentSupportChat';
import DocumentChatArea from './DocumentChatArea';
import DocumentContextPanel from './DocumentContextPanel';
import DocumentConversationList from './DocumentConversationList';

const DocumentSupportInbox: FunctionComponent = () => {
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
    loading,
    conversationLoading,
    messagesLoading,
    loadError,
    hasActiveFilters,
    studentAcademicFilterCounts,
    primaryFilterCounts,
    programOptions,
    classOptions,
    academicLevelOptions,
    peerTyping,
    setSearch,
    setMobileView,
    setPrimaryFilter,
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
  } = useDocumentSupportChat();

  const openCatalogService = () => {
    if (!selected?.serviceId) return;
    navigate(`/admin/documents/catalog/${selected.serviceId}/edit`);
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
          <DocumentConversationList
            conversations={filtered}
            loading={loading}
            loadError={loadError}
            selectedId={selectedId}
            filters={filters}
            primaryFilterCounts={primaryFilterCounts}
            hasActiveFilters={hasActiveFilters}
            filterCounts={studentAcademicFilterCounts}
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
            onSelect={(id) => void selectConversation(id)}
          />
        }
        workspace={
          <DocumentChatArea
            conversation={selected}
            stats={stats}
            messagesLoading={messagesLoading}
            conversationLoading={conversationLoading}
            statsLoading={loading}
            peerTyping={peerTyping}
            onSend={(text, files) => void sendMessage(text, files)}
            onTyping={notifyTyping}
            onBack={() => setMobileView('list')}
            onMarkResolved={handleResolved}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
          />
        }
        contextPanel={
          selected ? (
            <DocumentContextPanel
              conversation={selected}
              onOpenService={openCatalogService}
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

export default DocumentSupportInbox;

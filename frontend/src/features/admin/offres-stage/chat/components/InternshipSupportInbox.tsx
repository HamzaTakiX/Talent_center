import { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminToast } from '../../../dashboard/context/AdminToastContext';
import StudentDetailModal from '../../../student/components/StudentDetailModal';
import InternshipOfferDetailModal from '../../components/InternshipOfferDetailModal';
import type { InternshipOffer } from '../../types';
import SupportInboxShell from '../../../shared/admin-support-inbox/components/SupportInboxShell';
import { useInternshipSupportChat } from '../hooks/useInternshipSupportChat';
import InternshipChatArea from './InternshipChatArea';
import InternshipContextPanel from './InternshipContextPanel';
import InternshipConversationList from './InternshipConversationList';
import { useInternshipInboxCopy } from '../../hooks/useOffersListLabels';
import { internshipApplicationPath, internshipOfferPath } from '../utils/internshipChatNavigation';

const InternshipSupportInbox: FunctionComponent = () => {
  const toast = useAdminToast();
  const navigate = useNavigate();
  const { t } = useInternshipInboxCopy();
  const [viewStudentUserId, setViewStudentUserId] = useState<number | null>(null);
  const [viewOffer, setViewOffer] = useState<InternshipOffer | null>(null);

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
    loadError,
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
    unarchiveConversation,
    assignAdmin,
    peerTyping,
    notifyTyping,
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

  const handleUnarchive = () => {
    if (!selectedId) return;
    void unarchiveConversation(selectedId).then(() => {
      toast.showToast('Conversation restaurée', 'success');
    });
  };

  const openStudentModal = () => {
    if (!selected?.studentUserId) return;
    setViewStudentUserId(selected.studentUserId);
  };

  const openOfferDetail = () => {
    if (!selected?.offerUuid) return;
    setViewOffer({
      id: selected.offerUuid,
      title: selected.offerTitle,
      company: selected.company,
      status: 'Active',
      applicants: 0,
      deadline: selected.deadline,
      companyLogoUrl: selected.companyLogoUrl ?? null,
    });
  };

  const openOfferInModule = () => {
    const path = internshipOfferPath(selected?.offerUuid);
    if (path) navigate(path);
  };

  const goApplication = () => {
    if (!selected) return;
    const path = internshipApplicationPath(selected);
    if (path) navigate(path);
  };

  const handleAssignAdmin = async (assigneeUserId: number) => {
    if (!selectedId) return;
    try {
      await assignAdmin(selectedId, assigneeUserId);
      toast.showToast(t('assignAdminModal.success'), 'success');
    } catch {
      toast.showToast(t('assignAdminModal.error'), 'error');
    }
  };

  return (
    <>
      <InternshipOfferDetailModal
        open={viewOffer != null}
        offer={viewOffer}
        onClose={() => setViewOffer(null)}
        onEdit={(offerId) => {
          setViewOffer(null);
          navigate(`/admin/internship-offers/${offerId}/edit`);
        }}
      />

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
            loadError={loadError}
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
            emptyStateStats={emptyStateStats}
            messagesLoading={messagesLoading}
            conversationLoading={conversationLoading}
            statsLoading={loading}
            onSend={(text) => void sendMessage(text)}
            onBack={() => setMobileView('list')}
            onViewStudent={openStudentModal}
            onViewApplication={goApplication}
            onViewOffer={openOfferDetail}
            onOpenOfferInModule={openOfferInModule}
            onMarkResolved={handleResolved}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            peerTyping={peerTyping}
            onTyping={notifyTyping}
          />
        }
        contextPanel={
          selected ? (
            <InternshipContextPanel
              conversation={selected}
              onAssignAdmin={handleAssignAdmin}
              onViewStudent={openStudentModal}
              onViewOffer={openOfferDetail}
            />
          ) : undefined
        }
      />
    </>
  );
};

export default InternshipSupportInbox;

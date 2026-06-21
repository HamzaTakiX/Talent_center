import { FunctionComponent, useState } from 'react';
import { useAdminToast } from '../../../dashboard/context/AdminToastContext';
import SupportInboxShell from '../../../shared/admin-support-inbox/components/SupportInboxShell';
import { useDocumentSupportChat } from '../hooks/useDocumentSupportChat';
import DocumentChatArea from './DocumentChatArea';
import DocumentContextPanel from './DocumentContextPanel';
import DocumentConversationList from './DocumentConversationList';
import { DocumentDetailModals } from './DocumentDetailModals';

const DocumentSupportInbox: FunctionComponent = () => {
  const toast = useAdminToast();
  const [requestModal, setRequestModal] = useState(false);
  const [studentModal, setStudentModal] = useState(false);
  const [workflowModal, setWorkflowModal] = useState(false);

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
  } = useDocumentSupportChat();

  const openRequest = () => setRequestModal(true);
  const openStudent = () => setStudentModal(true);
  const openWorkflow = () => setWorkflowModal(true);

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
        <DocumentConversationList
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
        <DocumentChatArea
          conversation={selected}
          stats={stats}
          onSend={sendMessage}
          onBack={() => setMobileView('list')}
          onOpenRequest={openRequest}
          onOpenStudent={openStudent}
          onOpenWorkflow={openWorkflow}
          onMarkResolved={handleResolved}
          onArchive={handleArchive}
        />
      }
      contextPanel={
        selected ? (
          <DocumentContextPanel
            conversation={selected}
            onOpenRequest={openRequest}
            onOpenStudent={openStudent}
            onOpenWorkflow={openWorkflow}
          />
        ) : undefined
      }
      overlays={
        <DocumentDetailModals
          conversation={selected}
          requestOpen={requestModal}
          studentOpen={studentModal}
          workflowOpen={workflowModal}
          onCloseRequest={() => setRequestModal(false)}
          onCloseStudent={() => setStudentModal(false)}
          onCloseWorkflow={() => setWorkflowModal(false)}
        />
      }
    />
  );
};

export default DocumentSupportInbox;

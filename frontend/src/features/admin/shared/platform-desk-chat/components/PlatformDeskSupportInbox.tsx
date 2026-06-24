import { FunctionComponent, ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOptionalAdminToast } from '../../../dashboard/context/AdminToastContext';
import { useAdminChatChannel } from '../../../i18n/useAdminCopy';
import type { AdminChatChannel } from '../../../i18n/useAdminCopy';
import StudentDetailModal from '../../../student/components/StudentDetailModal';
import SupportInboxShell, {
  type SupportInboxLayoutProps,
} from '../../admin-support-inbox/components/SupportInboxShell';
import { InternshipChatContextPanelSkeleton } from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import { usePlatformDeskSupportChat } from '../hooks/usePlatformDeskSupportChat';
import type { PlatformDeskEntityType, PlatformDeskViewerRole } from '../types/platformDeskChatTypes';
import { toDeskConversationRecord } from '../utils/platformDeskChatMappers';
import PlatformDeskChatArea from './PlatformDeskChatArea';
import PlatformDeskConversationList from './PlatformDeskConversationList';

type Props = {
  entityType: PlatformDeskEntityType;
  channel: AdminChatChannel;
  viewerRole?: PlatformDeskViewerRole;
  renderContextPanel: (
    conversation: ReturnType<typeof toDeskConversationRecord>,
    onOpenProfile?: () => void,
  ) => ReactNode;
  showAcademicFilters?: boolean;
  Layout?: React.ComponentType<SupportInboxLayoutProps>;
  enableAdminActions?: boolean;
};

const PlatformDeskSupportInbox: FunctionComponent<Props> = ({
  entityType,
  channel,
  viewerRole = 'admin',
  renderContextPanel,
  showAcademicFilters = true,
  Layout,
  enableAdminActions = true,
}) => {
  const toast = useOptionalAdminToast();
  const navigate = useNavigate();
  const chatCopy = useAdminChatChannel(channel);
  const [viewStudentUserId, setViewStudentUserId] = useState<number | null>(null);
  const isStudentViewer = viewerRole === 'student';
  const isStudentDm =
    entityType === 'student_admin_dm' || entityType === 'student_desk';

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
  } = usePlatformDeskSupportChat(entityType, viewerRole);

  const isOpeningConversation = conversationLoading && !selected;

  const openProfile = () => {
    if (!selected?.userId) return;
    if (isStudentDm && viewerRole === 'admin') {
      setViewStudentUserId(selected.userId);
      return;
    }
    if (!isStudentViewer && entityType === 'admin_desk') {
      navigate(`/admin/admins/${selected.userId}/edit`);
    }
  };

  const handleResolved = () => {
    if (!selectedId || !enableAdminActions) return;
    void markResolved(selectedId);
    toast.showToast('Conversation marquée comme résolue', 'success');
  };

  const handleArchive = () => {
    if (!selectedId || !enableAdminActions) return;
    void archiveConversation(selectedId);
    toast.showToast('Conversation archivée', 'info');
  };

  const handleUnarchive = () => {
    if (!selectedId || !enableAdminActions) return;
    void unarchiveConversation(selectedId);
    toast.showToast('Conversation restaurée', 'success');
  };

  return (
    <>
      {isStudentDm && viewerRole === 'admin' ? (
        <StudentDetailModal
          open={viewStudentUserId != null}
          studentId={viewStudentUserId}
          preview={
            selected && viewStudentUserId === selected.userId
              ? {
                  name: selected.displayName,
                  email: selected.email,
                  avatarUrl: selected.avatarUrl,
                  initials: selected.initials,
                }
              : undefined
          }
          onClose={() => setViewStudentUserId(null)}
          onEdit={(id) => {
            setViewStudentUserId(null);
            navigate(`/admin/students/${id}/edit`);
          }}
        />
      ) : null}

      <SupportInboxShell
        Layout={Layout}
        hasSelection={Boolean(selected) || isOpeningConversation}
        mobileView={mobileView}
        sidebar={
          <PlatformDeskConversationList
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
            searchPlaceholder={chatCopy.searchPlaceholder}
            showAcademicFilters={showAcademicFilters && viewerRole === 'admin'}
            onSetPrimary={setPrimaryFilter}
            onToggleStudentAcademicFilter={toggleStudentAcademicFilter}
            onToggleQuickFilter={toggleQuickFilter}
            onClearFilters={clearFilters}
            onSearchChange={setSearch}
            onSelect={selectConversation}
          />
        }
        workspace={
          <PlatformDeskChatArea
            channel={channel}
            conversation={selected}
            stats={stats}
            messagesLoading={messagesLoading}
            conversationLoading={conversationLoading}
            statsLoading={loading}
            peerTyping={peerTyping}
            onSend={(text) => void sendMessage(text)}
            onTyping={notifyTyping}
            onBack={() => setMobileView('list')}
            onOpenProfile={
              selected?.userId && (viewerRole === 'admin' || isStudentViewer)
                ? openProfile
                : undefined
            }
            onMarkResolved={enableAdminActions ? handleResolved : () => undefined}
            onArchive={enableAdminActions ? handleArchive : () => undefined}
            onUnarchive={enableAdminActions ? handleUnarchive : () => undefined}
            showAdminActions={enableAdminActions}
          />
        }
        contextPanel={
          selected ? (
            renderContextPanel(
              toDeskConversationRecord(selected),
              selected.userId ? openProfile : undefined,
            )
          ) : isOpeningConversation ? (
            <InternshipChatContextPanelSkeleton />
          ) : undefined
        }
      />
    </>
  );
};

export default PlatformDeskSupportInbox;

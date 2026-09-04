import { FunctionComponent, ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { useOptionalAdminToast } from '../../../dashboard/context/AdminToastContext';
import { adminEncadrantsApi } from '../../../api/encadrants';
import type { AdminEncadrantRow } from '../../../api/types';
import EncadrantDetailModal from '../../../encadrant/components/EncadrantDetailModal';
import { useAdminChatChannel } from '../../../i18n/useAdminCopy';
import type { AdminChatChannel } from '../../../i18n/useAdminCopy';
import StudentDetailModal from '../../../student/components/StudentDetailModal';
import SupportInboxShell, {
  type SupportInboxLayoutProps,
} from '../../admin-support-inbox/components/SupportInboxShell';
import { InternshipChatContextPanelSkeleton } from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import type { ChatModule } from '../../../../shared/contextual-chat/types';
import type { ChatEntityReference } from '../../../../shared/contextual-chat/types/chatEntityTypes';
import type { SupervisionMeetingChatConfig } from '../../../../shared/meeting-room/types/chatMeetingRequest';
import { usePlatformDeskSupportChat } from '../hooks/usePlatformDeskSupportChat';
import type { PlatformDeskEntityType, PlatformDeskViewerRole, PlatformDeskConversation } from '../types/platformDeskChatTypes';
import { toDeskConversationRecord } from '../utils/platformDeskChatMappers';
import PlatformDeskChatArea from './PlatformDeskChatArea';
import PlatformDeskConversationList from './PlatformDeskConversationList';

type Props = {
  entityType: PlatformDeskEntityType;
  channel: AdminChatChannel;
  viewerRole?: PlatformDeskViewerRole;
  chatModule?: ChatModule;
  supervisionMeeting?: SupervisionMeetingChatConfig;
  showTagAction?: boolean;
  renderContextPanel?: (
    conversation: ReturnType<typeof toDeskConversationRecord>,
    onOpenProfile?: () => void,
  ) => ReactNode;
  showAcademicFilters?: boolean;
  Layout?: React.ComponentType<SupportInboxLayoutProps>;
  enableAdminActions?: boolean;
  enableArchive?: boolean;
  sidebarTitle?: string;
  sidebarSubtitle?: string;
  sidebarIcon?: LucideIcon;
  searchPlaceholder?: string;
  initialConversationId?: string;
  onInitialConversationHandled?: () => void;
  /** Show workspace loading while a student conversation is being created from URL params. */
  forceOpeningConversation?: boolean;
  renderThreadEmpty?: (conversation: PlatformDeskConversation) => ReactNode;
  initialPendingEntities?: ChatEntityReference[];
};

const PlatformDeskSupportInbox: FunctionComponent<Props> = ({
  entityType,
  channel,
  viewerRole = 'admin',
  chatModule,
  supervisionMeeting,
  showTagAction = false,
  renderContextPanel,
  showAcademicFilters = true,
  Layout,
  enableAdminActions = true,
  enableArchive,
  sidebarTitle,
  sidebarSubtitle,
  sidebarIcon,
  searchPlaceholder,
  initialConversationId = '',
  onInitialConversationHandled,
  forceOpeningConversation = false,
  renderThreadEmpty,
  initialPendingEntities,
}) => {
  const toast = useOptionalAdminToast();
  const navigate = useNavigate();
  const chatCopy = useAdminChatChannel(channel);
  const [viewStudentUserId, setViewStudentUserId] = useState<number | null>(null);
  const [viewEncadrantId, setViewEncadrantId] = useState<number | null>(null);
  const [viewEncadrantRow, setViewEncadrantRow] = useState<AdminEncadrantRow | null>(null);
  const handledInitialConversationRef = useRef<string | null>(null);
  const isStudentViewer = viewerRole === 'student';
  const isStudentDm =
    entityType === 'student_admin_dm' || entityType === 'student_desk';
  // Archive is staff-only (admin / encadrant); students never archive desk threads.
  const canArchive = isStudentViewer ? false : (enableArchive ?? enableAdminActions);

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
  } = usePlatformDeskSupportChat(entityType, viewerRole, { chatModule });

  useEffect(() => {
    const conversationId = initialConversationId.trim();
    if (!conversationId) {
      handledInitialConversationRef.current = null;
      return;
    }
    if (handledInitialConversationRef.current === conversationId) return;

    handledInitialConversationRef.current = conversationId;
    void selectConversation(conversationId).finally(() => {
      onInitialConversationHandled?.();
    });
  }, [initialConversationId, onInitialConversationHandled, selectConversation]);

  useEffect(() => {
    if (viewEncadrantId == null) {
      setViewEncadrantRow(null);
      return;
    }
    let cancelled = false;
    adminEncadrantsApi
      .get(viewEncadrantId)
      .then((row) => {
        if (!cancelled) setViewEncadrantRow(row);
      })
      .catch(() => {
        if (!cancelled) setViewEncadrantRow(null);
      });
    return () => {
      cancelled = true;
    };
  }, [viewEncadrantId]);

  const isOpeningConversation =
    forceOpeningConversation || (conversationLoading && !selected);

  const openProfile = () => {
    if (!selected?.userId) return;
    if (isStudentDm && viewerRole === 'admin') {
      setViewStudentUserId(selected.userId);
      return;
    }
    if (!isStudentViewer && entityType === 'admin_desk') {
      navigate(`/admin/admins/${selected.userId}/edit`);
      return;
    }
    if (!isStudentViewer && entityType === 'encadrant_desk') {
      const profileId = selected.userId;
      if (profileId) setViewEncadrantId(profileId);
      return;
    }
  };

  const handleResolved = () => {
    if (!selectedId || !enableAdminActions) return;
    void markResolved(selectedId);
    toast.showToast('Conversation marquée comme résolue', 'success');
  };

  const handleArchive = () => {
    if (!selectedId || !canArchive) return;
    void archiveConversation(selectedId);
    if (!isStudentViewer) {
      toast.showToast('Conversation archivée', 'info');
    }
  };

  const handleUnarchive = () => {
    if (!selectedId || !canArchive) return;
    void unarchiveConversation(selectedId);
    if (!isStudentViewer) {
      toast.showToast('Conversation restaurée', 'success');
    }
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

      {entityType === 'encadrant_desk' && viewerRole === 'admin' ? (
        <EncadrantDetailModal
          open={viewEncadrantId != null}
          encadrantId={viewEncadrantId}
          encadrant={viewEncadrantRow}
          onClose={() => setViewEncadrantId(null)}
          onEdit={(id) => {
            setViewEncadrantId(null);
            navigate(`/admin/encadrants/${id}/edit`);
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
            searchPlaceholder={searchPlaceholder ?? chatCopy.searchPlaceholder}
            sidebarTitle={sidebarTitle}
            sidebarSubtitle={sidebarSubtitle}
            sidebarIcon={sidebarIcon}
            showAcademicFilters={showAcademicFilters && viewerRole === 'admin'}
            viewerRole={viewerRole}
            showArchive={canArchive}
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
            onSend={(text, files, tagCodes, entityRefs) => void sendMessage(text, files, tagCodes, entityRefs)}
            onTyping={notifyTyping}
            onBack={() => setMobileView('list')}
            onMarkResolved={enableAdminActions ? handleResolved : () => undefined}
            onArchive={canArchive ? handleArchive : () => undefined}
            onUnarchive={canArchive ? handleUnarchive : () => undefined}
            showAdminActions={enableAdminActions}
            showArchiveActions={canArchive}
            viewerRole={viewerRole}
            renderThreadEmpty={renderThreadEmpty}
            supervisionMeeting={supervisionMeeting}
            showTagAction={showTagAction}
            chatModule={chatModule}
            initialPendingEntities={initialPendingEntities}
          />
        }
        contextPanel={
          renderContextPanel && selected
            ? renderContextPanel(
                toDeskConversationRecord(selected),
                selected.userId ? openProfile : undefined,
              )
            : renderContextPanel && isOpeningConversation
              ? <InternshipChatContextPanelSkeleton />
              : undefined
        }
      />
    </>
  );
};

export default PlatformDeskSupportInbox;

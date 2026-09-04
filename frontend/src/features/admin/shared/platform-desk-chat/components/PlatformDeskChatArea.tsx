import { FunctionComponent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  InternshipChatMessagesSkeleton,
  InternshipChatWorkspaceSkeleton,
} from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import ChatEmptyState from '../../admin-module-chat/components/ChatEmptyState';
import SupportMessageComposer from '../../admin-support-inbox/components/SupportMessageComposer';
import {
  StandardChatMessageThread,
  toChatToolMessages,
  useChatConversationTools,
  type StandardChatMessage,
} from '../../../../shared/chat-design-system';
import { useAdminChatChannel, useChatEmptyState } from '../../../i18n/useAdminCopy';
import type { AdminChatChannel } from '../../../i18n/useAdminCopy';
import type { SupervisionMeetingChatConfig } from '../../../../shared/meeting-room/types/chatMeetingRequest';
import { ChatMeetingRequestBubble } from '../../../../shared/meeting-room/components/chat/ChatMeetingRequestBubble';
import { ChatMeetingRequestComposerButton } from '../../../../shared/meeting-room/components/chat/ChatMeetingRequestComposerButton';
import ChatComposerEntityPicker from '../../../../shared/contextual-chat/components/ChatComposerEntityPicker';
import { useChatComposerEntityState } from '../../../../shared/contextual-chat/hooks/useChatComposerEntityState';
import type { ChatEntityReference } from '../../../../shared/contextual-chat/types/chatEntityTypes';
import type { ChatModule } from '../../../../shared/contextual-chat/types';
import type {
  PlatformDeskConversation,
  PlatformDeskInboxStats,
  PlatformDeskMessage,
  PlatformDeskViewerRole,
} from '../types/platformDeskChatTypes';
import PlatformDeskChatHeader from './PlatformDeskChatHeader';

type Props = {
  channel: AdminChatChannel;
  conversation: PlatformDeskConversation | null;
  stats: PlatformDeskInboxStats;
  messagesLoading?: boolean;
  conversationLoading?: boolean;
  statsLoading?: boolean;
  peerTyping?: boolean;
  onSend: (
    text: string,
    files?: File[],
    tagCodes?: string[],
    entityRefs?: ChatEntityReference[],
  ) => void;
  onTyping?: (isTyping: boolean) => void;
  onBack?: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  showAdminActions?: boolean;
  showArchiveActions?: boolean;
  viewerRole?: PlatformDeskViewerRole;
  renderThreadEmpty?: (conversation: PlatformDeskConversation) => ReactNode;
  /** Supervision student↔encadrant: meeting request + tag composer actions. */
  supervisionMeeting?: SupervisionMeetingChatConfig;
  showTagAction?: boolean;
  chatModule?: ChatModule;
  composerExtraActions?: ReactNode;
  initialPendingEntities?: ChatEntityReference[];
};

function formatNowTime(locale: string): string {
  return new Intl.DateTimeFormat(locale.startsWith('ar') ? 'ar-MA' : locale.startsWith('fr') ? 'fr-FR' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

const PlatformDeskChatArea: FunctionComponent<Props> = ({
  channel,
  conversation,
  stats,
  messagesLoading = false,
  conversationLoading = false,
  statsLoading = false,
  peerTyping = false,
  onSend,
  onTyping,
  onBack,
  onMarkResolved,
  onArchive,
  onUnarchive,
  showAdminActions = true,
  showArchiveActions,
  viewerRole = 'admin',
  renderThreadEmpty,
  supervisionMeeting,
  showTagAction = false,
  chatModule = 'platform',
  composerExtraActions,
  initialPendingEntities,
}) => {
  const [draft, setDraft] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const { pendingEntities, setPendingEntities, removePendingEntity, clearPendingEntities } =
    useChatComposerEntityState(conversation?.id);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [localMeetingMessages, setLocalMeetingMessages] = useState<PlatformDeskMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const emptyState = useChatEmptyState(channel);
  const chatCopy = useAdminChatChannel(channel);
  const { t, i18n } = useTranslation();
  const emptyStats = useMemo(() => {
    const base = {
      unread: stats.unread,
      pending: stats.pending,
      resolved: stats.resolved,
      availableAdmins: stats.availableAdmins,
    };

    if (viewerRole !== 'student') return base;

    return {
      ...base,
      labels: {
        unread: t('student.support.chat.emptyStats.unread'),
        pending: t('student.support.chat.emptyStats.pending'),
        resolved: t('student.support.chat.emptyStats.resolved'),
        availableAdmins: t('student.support.chat.emptyStats.availableAdmins'),
      },
    };
  }, [stats, t, viewerRole]);

  const archiveEnabled = showArchiveActions ?? showAdminActions;

  const displayMessages = useMemo(() => {
    const base = conversation?.messages ?? [];
    if (!localMeetingMessages.length) return base;
    return [...base, ...localMeetingMessages];
  }, [conversation?.messages, localMeetingMessages]);

  const chatTools = useChatConversationTools({
    messages: toChatToolMessages(displayMessages),
    conversationKey: conversation?.id ?? '',
    counterpartyName: conversation?.displayName,
    archived: conversation?.archived,
    showArchive: archiveEnabled,
    onArchive,
    onUnarchive,
    scrollContainerRef: scrollRef,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [displayMessages.length, conversation?.id, peerTyping]);

  useEffect(() => {
    setDraft('');
    setPendingFiles([]);
    if (initialPendingEntities?.length) {
      setPendingEntities(initialPendingEntities);
    } else {
      clearPendingEntities();
    }
    setAttachError(null);
    setLocalMeetingMessages([]);
  }, [clearPendingEntities, conversation?.id, initialPendingEntities, setPendingEntities]);

  const hasPendingOutgoingMeetingRequest = useMemo(
    () =>
      displayMessages.some(
        (message) =>
          message.direction === 'out' &&
          message.messageType === 'MEETING_REQUEST' &&
          message.meetingRequest?.status === 'pending',
      ),
    [displayMessages],
  );

  const outgoingMeetingRequestNotice = useMemo(() => {
    if (!hasPendingOutgoingMeetingRequest || !conversation || !supervisionMeeting) {
      return null;
    }
    return supervisionMeeting.portal === 'student'
      ? t('meetingRoom.chat.alreadyPendingStudent')
      : t('meetingRoom.chat.alreadyPendingEncadrant');
  }, [conversation, hasPendingOutgoingMeetingRequest, supervisionMeeting, t]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text && !pendingFiles.length) return;
    const entityRefsToSend = pendingEntities.length ? pendingEntities : undefined;
    onSend(text, pendingFiles.length ? pendingFiles : undefined, undefined, entityRefsToSend);
    setDraft('');
    setPendingFiles([]);
    clearPendingEntities();
    setAttachError(null);
  }, [clearPendingEntities, draft, onSend, pendingEntities, pendingFiles]);

  const handleSendMeetingRequest = useCallback(() => {
    if (!conversation || !supervisionMeeting || hasPendingOutgoingMeetingRequest) return;
    const requestId = `mr-${Date.now()}`;
    const msg: PlatformDeskMessage = {
      id: `local-${requestId}`,
      direction: 'out',
      text: t('meetingRoom.chat.requestPreview'),
      time: formatNowTime(i18n.language),
      createdAt: new Date().toISOString(),
      messageType: 'MEETING_REQUEST',
      meetingRequest: {
        requestId,
        mode: 'video',
        status: 'pending',
        title: t('meetingRoom.withParticipant', { name: conversation.displayName }),
      },
    };
    setLocalMeetingMessages((prev) => [...prev, msg]);
  }, [
    conversation,
    hasPendingOutgoingMeetingRequest,
    i18n.language,
    supervisionMeeting,
    t,
  ]);

  const handleMeetingRequestAccepted = useCallback((requestId: string) => {
    setLocalMeetingMessages((prev) =>
      prev.map((message) =>
        message.meetingRequest?.requestId === requestId
          ? {
              ...message,
              meetingRequest: {
                ...message.meetingRequest,
                status: 'accepted' as const,
              },
            }
          : message,
      ),
    );
  }, []);

  const renderMeetingRequest = useCallback(
    (message: StandardChatMessage) => {
      if (!supervisionMeeting || !message.meetingRequest || !conversation) return null;
      return (
        <ChatMeetingRequestBubble
          direction={message.direction === 'out' ? 'out' : 'in'}
          partnerName={conversation.displayName}
          meetingRequest={message.meetingRequest}
          portal={supervisionMeeting.portal}
          studentProfileId={
            supervisionMeeting.studentProfileId ?? conversation.studentProfileId ?? undefined
          }
          onAccepted={handleMeetingRequestAccepted}
        />
      );
    },
    [conversation, handleMeetingRequestAccepted, supervisionMeeting],
  );

  if ((conversationLoading || messagesLoading) && !conversation) {
    return <InternshipChatWorkspaceSkeleton />;
  }

  if (!conversation) {
    return (
      <section className="isi-chat isi-chat--empty">
        <ChatEmptyState
          {...emptyState}
          statsLoading={statsLoading}
          stats={emptyStats}
        />
      </section>
    );
  }

  const typingLabel =
    conversation.entityType === 'student_desk' || conversation.entityType === 'supervision_dm'
      ? viewerRole === 'student'
        ? t('student.encadrant.chat.peerTyping', { defaultValue: "L'encadrant écrit…" })
        : t('student.encadrant.chat.studentTyping', { defaultValue: "L'étudiant écrit…" })
      : conversation.entityType === 'student_admin_dm'
        ? "L'étudiant écrit…"
        : "L'administrateur écrit…";

  const enableSupervisionActions = Boolean(supervisionMeeting) || showTagAction;
  const tagActionEnabled = showTagAction || Boolean(supervisionMeeting);
  const extraActions =
    composerExtraActions ??
    (enableSupervisionActions ? (
      <>
        {supervisionMeeting ? (
          <ChatMeetingRequestComposerButton
            disabled={conversation.archived || hasPendingOutgoingMeetingRequest}
            onClick={handleSendMeetingRequest}
            tooltipLabel={
              hasPendingOutgoingMeetingRequest
                ? t('meetingRoom.chat.alreadyPendingTooltip')
                : undefined
            }
          />
        ) : null}
        {tagActionEnabled ? (
          <ChatComposerEntityPicker
            chatModule={chatModule}
            conversationId={conversation.id}
            enabled
            disabled={conversation.archived}
            selected={pendingEntities}
            onChange={setPendingEntities}
          />
        ) : null}
      </>
    ) : undefined);

  return (
    <section className="isi-chat">
      <PlatformDeskChatHeader
        conversation={conversation}
        onBack={onBack}
        onMarkResolved={onMarkResolved}
        showAdminActions={showAdminActions}
        viewerRole={viewerRole}
        conversationMenu={chatTools.menu}
      />
      {chatTools.searchBar}

      <div ref={scrollRef} className="isi-messages">
        {messagesLoading && displayMessages.length === 0 ? (
          <InternshipChatMessagesSkeleton embedded />
        ) : displayMessages.length === 0 && !peerTyping && renderThreadEmpty ? (
          renderThreadEmpty(conversation)
        ) : (
          <StandardChatMessageThread
            messages={displayMessages}
            inboxMode={viewerRole === 'student' ? 'student' : 'admin'}
            typing={peerTyping}
            typingLabel={typingLabel}
            getMessageBlockProps={chatTools.getMessageBlockProps}
            renderHighlightedText={chatTools.renderHighlightedText}
            renderMeetingRequest={supervisionMeeting ? renderMeetingRequest : undefined}
          />
        )}
      </div>

      {chatTools.panels}

      {outgoingMeetingRequestNotice ? (
        <div
          role="status"
          className="mx-3 mb-2 rounded-[10px] border border-[color-mix(in_srgb,var(--admin-brand)_24%,var(--admin-border))] bg-[color-mix(in_srgb,var(--admin-brand)_8%,var(--admin-bg-elevated))] px-3 py-2 text-sm leading-5 text-[var(--admin-text-secondary)]"
        >
          {outgoingMeetingRequestNotice}
        </div>
      ) : null}

      <SupportMessageComposer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onTyping={onTyping}
        pendingFiles={pendingFiles}
        onPendingFilesChange={setPendingFiles}
        pendingEntities={pendingEntities}
        onRemovePendingEntity={removePendingEntity}
        attachError={attachError}
        onAttachError={setAttachError}
        showVoice={false}
        disabled={conversation.archived}
        placeholder={chatCopy.composerPlaceholder}
        extraActions={extraActions}
      />
    </section>
  );
};

export default PlatformDeskChatArea;

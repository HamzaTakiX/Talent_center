import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
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
} from '../../../../shared/chat-design-system';
import { useAdminChatChannel, useChatEmptyState } from '../../../i18n/useAdminCopy';
import type { AdminChatChannel } from '../../../i18n/useAdminCopy';
import type {
  PlatformDeskConversation,
  PlatformDeskInboxStats,
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
  onSend: (text: string, files?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  onBack?: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  showAdminActions?: boolean;
  showArchiveActions?: boolean;
  viewerRole?: PlatformDeskViewerRole;
};

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
}) => {
  const [draft, setDraft] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const emptyState = useChatEmptyState(channel);
  const chatCopy = useAdminChatChannel(channel);

  const archiveEnabled = showArchiveActions ?? showAdminActions;

  const chatTools = useChatConversationTools({
    messages: toChatToolMessages(conversation?.messages ?? []),
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
  }, [conversation?.messages.length, conversation?.id, peerTyping]);

  useEffect(() => {
    setDraft('');
    setPendingFiles([]);
    setAttachError(null);
  }, [conversation?.id]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text && !pendingFiles.length) return;
    onSend(text, pendingFiles.length ? pendingFiles : undefined);
    setDraft('');
    setPendingFiles([]);
    setAttachError(null);
  }, [draft, onSend, pendingFiles]);

  if ((conversationLoading || messagesLoading) && !conversation) {
    return <InternshipChatWorkspaceSkeleton />;
  }

  if (!conversation) {
    return (
      <section className="isi-chat isi-chat--empty">
        <ChatEmptyState
          {...emptyState}
          statsLoading={statsLoading}
          stats={{
            unread: stats.unread,
            pending: stats.pending,
            resolved: stats.resolved,
          }}
        />
      </section>
    );
  }

  const typingLabel =
    conversation.entityType === 'student_desk'
      ? "L'étudiant écrit…"
      : "L'administrateur écrit…";

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
        {messagesLoading && conversation.messages.length === 0 ? (
          <InternshipChatMessagesSkeleton embedded />
        ) : (
          <StandardChatMessageThread
            messages={conversation.messages}
            inboxMode={viewerRole === 'student' ? 'student' : 'admin'}
            typing={peerTyping}
            typingLabel={typingLabel}
            getMessageBlockProps={chatTools.getMessageBlockProps}
            renderHighlightedText={chatTools.renderHighlightedText}
          />
        )}
      </div>

      {chatTools.panels}

      <SupportMessageComposer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onTyping={onTyping}
        pendingFiles={pendingFiles}
        onPendingFilesChange={setPendingFiles}
        attachError={attachError}
        onAttachError={setAttachError}
        showVoice={false}
        placeholder={chatCopy.composerPlaceholder}
      />
    </section>
  );
};

export default PlatformDeskChatArea;

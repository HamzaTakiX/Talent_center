import { FunctionComponent, useEffect, useRef } from 'react';
import {
  InternshipChatMessagesSkeleton,
  InternshipChatWorkspaceSkeleton,
} from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import ChatEmptyState from '../../../shared/admin-module-chat/components/ChatEmptyState';
import SupportMessageComposer from '../../../shared/admin-support-inbox/components/SupportMessageComposer';
import {
  StandardChatMessageThread,
  toChatToolMessages,
  useChatConversationTools,
} from '../../../../shared/chat-design-system';
import ChatComposerModuleExtras from '../../../../shared/contextual-chat/components/ChatComposerModuleExtras';
import { useSupportChatAreaComposer } from '../../../../shared/contextual-chat/hooks/useSupportChatAreaComposer';
import type { ChatEntityReference } from '../../../../shared/contextual-chat/types/chatEntityTypes';
import { useChatEmptyState } from '../../../i18n/useAdminCopy';
import type { AnnouncementConversation, InboxStats } from '../types/announcementChatTypes';
import AnnouncementChatHeader from './AnnouncementChatHeader';

type Props = {
  conversation: AnnouncementConversation | null;
  stats: InboxStats;
  messagesLoading?: boolean;
  conversationLoading?: boolean;
  statsLoading?: boolean;
  peerTyping?: boolean;
  onSend: (text: string, tagCodes?: string[], entityRefs?: ChatEntityReference[]) => void;
  onTyping?: (isTyping: boolean) => void;
  onBack?: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
};

const AnnouncementChatArea: FunctionComponent<Props> = ({
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
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const composer = useSupportChatAreaComposer(conversation?.id, (text, _files, tagCodes, entityRefs) => {
    onSend(text, tagCodes, entityRefs);
  });

  const chatTools = useChatConversationTools({
    messages: toChatToolMessages(conversation?.messages ?? []),
    conversationKey: conversation?.id ?? '',
    counterpartyName: conversation?.studentName,
    archived: conversation?.archived,
    onArchive,
    onUnarchive,
    scrollContainerRef: scrollRef,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation?.messages.length, conversation?.id, peerTyping]);

  const emptyState = useChatEmptyState('announcements');

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

  return (
    <section className="isi-chat">
      <AnnouncementChatHeader
        conversation={conversation}
        onBack={onBack}
        onMarkResolved={onMarkResolved}
        conversationMenu={chatTools.menu}
      />
      {chatTools.searchBar}

      <div ref={scrollRef} className="isi-messages">
        {messagesLoading && conversation.messages.length === 0 ? (
          <InternshipChatMessagesSkeleton embedded />
        ) : (
          <StandardChatMessageThread
            messages={conversation.messages}
            inboxMode="admin"
            emptyLabel="Aucun message"
            typing={peerTyping}
            typingLabel="L'étudiant écrit…"
            getMessageBlockProps={chatTools.getMessageBlockProps}
            renderHighlightedText={chatTools.renderHighlightedText}
          />
        )}
      </div>

      {chatTools.panels}

      <SupportMessageComposer
        value={composer.draft}
        onChange={composer.setDraft}
        onSend={composer.handleSend}
        onTyping={onTyping}
        showVoice={false}
        extraActions={
          <ChatComposerModuleExtras
            chatModule="announcements"
            conversationId={conversation.id}
            composer={composer}
            disabled={conversation.archived}
            showTagPicker={false}
          />
        }
        pendingEntities={composer.pendingEntities}
        onRemovePendingEntity={composer.removePendingEntity}
      />
    </section>
  );
};

export default AnnouncementChatArea;

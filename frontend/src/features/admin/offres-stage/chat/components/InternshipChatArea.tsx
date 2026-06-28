import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import ChatEmptyState from '../../../shared/admin-module-chat/components/ChatEmptyState';
import SupportMessageComposer from '../../../shared/admin-support-inbox/components/SupportMessageComposer';
import {
  StandardChatMessageThread,
  toChatToolMessages,
  useChatConversationTools,
} from '../../../../shared/chat-design-system';
import type { InboxStats, InternshipConversation } from '../types/internshipChatTypes';
import { InternshipChatMessagesSkeleton, InternshipChatWorkspaceSkeleton } from './InternshipChatLoadingSkeletons';
import InternshipChatHeader from './InternshipChatHeader';
import { useInternshipInboxCopy } from '../../hooks/useOffersListLabels';

type Props = {
  conversation: InternshipConversation | null;
  stats: InboxStats;
  emptyStateStats?: {
    unread: number;
    waitingAdmin: number;
    waitingStudent: number;
    resolved: number;
  };
  messagesLoading?: boolean;
  conversationLoading?: boolean;
  statsLoading?: boolean;
  onSend: (text: string) => void;
  onBack?: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  peerTyping?: boolean;
  onTyping?: (isTyping: boolean) => void;
};

const InternshipChatArea: FunctionComponent<Props> = ({
  conversation,
  stats,
  emptyStateStats,
  messagesLoading = false,
  conversationLoading = false,
  statsLoading = false,
  onSend,
  onBack,
  onMarkResolved,
  onArchive,
  onUnarchive,
  peerTyping = false,
  onTyping,
}) => {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, emptyState } = useInternshipInboxCopy();

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
  }, [conversation?.messages.length, conversation?.id]);

  useEffect(() => {
    setDraft('');
  }, [conversation?.id]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  }, [draft, onSend]);

  if ((conversationLoading || messagesLoading) && !conversation) {
    return <InternshipChatWorkspaceSkeleton />;
  }

  if (!conversation) {
    const displayStats = emptyStateStats ?? {
      unread: stats.unread,
      waitingAdmin: stats.waitingAdmin,
      waitingStudent: stats.waitingStudent,
      resolved: stats.resolved,
    };
    return (
      <section className="isi-chat isi-chat--empty">
        <ChatEmptyState
          title={emptyState.title}
          description={emptyState.description}
          moduleType="internship"
          statsLoading={statsLoading}
          stats={{
            unread: displayStats.unread,
            pending: displayStats.waitingAdmin,
            resolved: displayStats.resolved,
            labels: {
              pending: t('stats.waitingAdmin'),
            },
          }}
        />
      </section>
    );
  }

  return (
    <section className="isi-chat">
      <InternshipChatHeader
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
            systemEventsPrefix="admin.modules.offers.inbox.systemEvents"
            emptyLabel={t('noMessages')}
            typing={peerTyping}
            typingLabel={t('typingIndicator', { defaultValue: "L'étudiant écrit…" })}
            getMessageBlockProps={chatTools.getMessageBlockProps}
            renderHighlightedText={chatTools.renderHighlightedText}
            seenLabelFor={(msg) =>
              msg.seenTime ? t('seenAt', { time: msg.seenTime }) : undefined
            }
          />
        )}
      </div>

      {chatTools.panels}

      <SupportMessageComposer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onTyping={onTyping}
        placeholder={t('composerPlaceholder')}
        inputAriaLabel={t('composerPlaceholder')}
        attachAriaLabel={t('attachFile')}
        sendAriaLabel={t('sendMessage')}
        showVoice={false}
      />
    </section>
  );
};

export default InternshipChatArea;

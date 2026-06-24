import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import {
  InternshipChatMessagesSkeleton,
  InternshipChatWorkspaceSkeleton,
} from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import InternshipMessageReadStatus from '../../../offres-stage/chat/components/InternshipMessageReadStatus';
import ChatEmptyState from '../../admin-module-chat/components/ChatEmptyState';
import SupportMessageComposer from '../../admin-support-inbox/components/SupportMessageComposer';
import { useAdminChatChannel, useChatEmptyState } from '../../../i18n/useAdminCopy';
import type { AdminChatChannel } from '../../../i18n/useAdminCopy';
import type {
  PlatformDeskConversation,
  PlatformDeskInboxStats,
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
  onSend: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onBack?: () => void;
  onOpenProfile?: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  showAdminActions?: boolean;
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
  onOpenProfile,
  onMarkResolved,
  onArchive,
  onUnarchive,
  showAdminActions = true,
}) => {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const emptyState = useChatEmptyState(channel);
  const chatCopy = useAdminChatChannel(channel);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation?.messages.length, conversation?.id, peerTyping]);

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
        onOpenProfile={onOpenProfile}
        onMarkResolved={onMarkResolved}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        showAdminActions={showAdminActions}
      />

      <div ref={scrollRef} className="isi-messages">
        {messagesLoading && conversation.messages.length === 0 ? (
          <InternshipChatMessagesSkeleton embedded />
        ) : (
          conversation.messages.map((msg) => (
            <div key={msg.id} className="isi-msg-block">
              {msg.separatorBefore ? (
                <div className="isi-date-sep">
                  <span>{msg.separatorBefore}</span>
                </div>
              ) : null}
              {msg.direction === 'in' ? (
                <div className="isi-msg isi-msg--in">
                  <div className="isi-bubble isi-bubble--in">{msg.text}</div>
                  <time className="isi-msg-time">{msg.time}</time>
                </div>
              ) : (
                <div className="isi-msg isi-msg--out">
                  <div className="isi-bubble isi-bubble--out">{msg.text}</div>
                  <InternshipMessageReadStatus
                    message={{
                      time: msg.time,
                      deliveryStatus: msg.deliveryStatus,
                      seenTime: msg.seenTime,
                    }}
                  />
                </div>
              )}
            </div>
          ))
        )}
        {peerTyping ? (
          <div className="isi-typing">
            <span />
            <span />
            <span />
            <span>{typingLabel}</span>
          </div>
        ) : null}
      </div>

      <SupportMessageComposer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onTyping={onTyping}
        showVoice={false}
        placeholder={chatCopy.composerPlaceholder}
      />
    </section>
  );
};

export default PlatformDeskChatArea;

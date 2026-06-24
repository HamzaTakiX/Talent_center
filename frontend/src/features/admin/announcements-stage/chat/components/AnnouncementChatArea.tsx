import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Paperclip } from 'lucide-react';
import {
  InternshipChatMessagesSkeleton,
  InternshipChatWorkspaceSkeleton,
} from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import InternshipMessageReadStatus from '../../../offres-stage/chat/components/InternshipMessageReadStatus';
import ChatEmptyState from '../../../shared/admin-module-chat/components/ChatEmptyState';
import SupportMessageComposer from '../../../shared/admin-support-inbox/components/SupportMessageComposer';
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
  onSend: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onBack?: () => void;
  onOpenAnnouncement: () => void;
  onOpenStudent: () => void;
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
  onOpenAnnouncement,
  onOpenStudent,
  onMarkResolved,
  onArchive,
  onUnarchive,
}) => {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

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
        onOpenAnnouncement={onOpenAnnouncement}
        onOpenStudent={onOpenStudent}
        onMarkResolved={onMarkResolved}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
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
                  {msg.attachmentName ? (
                    <div className="isi-file-preview">
                      <Paperclip className="size-4 shrink-0" />
                      <span>{msg.attachmentName}</span>
                    </div>
                  ) : null}
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
            <span /><span /><span />
            <span>L&apos;étudiant écrit…</span>
          </div>
        ) : null}
      </div>

      <SupportMessageComposer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onTyping={onTyping}
        showVoice={false}
      />
    </section>
  );
};

export default AnnouncementChatArea;

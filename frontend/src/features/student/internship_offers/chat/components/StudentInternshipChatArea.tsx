import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChatEmptyState from '../../../../admin/shared/admin-module-chat/components/ChatEmptyState';
import SupportMessageComposer from '../../../../admin/shared/admin-support-inbox/components/SupportMessageComposer';
import type {
  InboxStats,
  InternshipConversation,
} from '../../../../admin/offres-stage/chat/types/internshipChatTypes';
import { InternshipChatMessagesSkeleton, InternshipChatWorkspaceSkeleton } from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';
import InternshipMessageReadStatus from '../../../../admin/offres-stage/chat/components/InternshipMessageReadStatus';
import StudentInternshipChatHeader from './StudentInternshipChatHeader';
import { formatInternshipSystemMessage } from '../../../../admin/offres-stage/chat/utils/internshipChatSystemMessageUtils';

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
  onViewOffer: () => void;
  peerTyping?: boolean;
  onTyping?: (isTyping: boolean) => void;
};

const StudentInternshipChatArea: FunctionComponent<Props> = ({
  conversation,
  stats,
  emptyStateStats,
  messagesLoading = false,
  conversationLoading = false,
  statsLoading = false,
  onSend,
  onBack,
  onViewOffer,
  peerTyping = false,
  onTyping,
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

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
          title={t('student.internshipOffers.chat.emptyTitle')}
          description={t('student.internshipOffers.chat.emptyDescription')}
          moduleType="internship"
          statsLoading={statsLoading}
          stats={{
            unread: displayStats.unread,
            pending: displayStats.waitingStudent,
            resolved: displayStats.resolved,
          }}
        />
      </section>
    );
  }

  return (
    <section className="isi-chat">
      <StudentInternshipChatHeader
        conversation={conversation}
        onBack={onBack}
        onViewOffer={onViewOffer}
      />

      <div ref={scrollRef} className="isi-messages">
        {messagesLoading && conversation.messages.length === 0 ? (
          <InternshipChatMessagesSkeleton embedded />
        ) : conversation.messages.length === 0 ? (
          <div className="isi-messages-empty">
            <p className="text-sm text-[var(--admin-text-muted)]">
              {t('student.internshipOffers.chat.noMessages')}
            </p>
          </div>
        ) : (
          conversation.messages.map((msg) => {
            const systemLabel =
              msg.messageType === 'EVENT' || msg.messageType === 'SYSTEM'
                ? formatInternshipSystemMessage(msg, 'student', t)
                : null;

            return (
            <div key={msg.id} className="isi-msg-block">
              {msg.separatorBefore ? (
                <div className="isi-date-sep">
                  <span>{msg.separatorBefore}</span>
                </div>
              ) : null}
              {systemLabel ? (
                <div className="isi-system-msg">{systemLabel}</div>
              ) : msg.direction === 'in' ? (
                <div className="isi-msg isi-msg--in">
                  <div className="isi-bubble isi-bubble--in">{msg.text}</div>
                  <time className="isi-msg-time">{msg.time}</time>
                </div>
              ) : (
                <div className="isi-msg isi-msg--out">
                  <div className="isi-bubble isi-bubble--out">{msg.text}</div>
                  <InternshipMessageReadStatus
                    message={msg}
                    seenLabel={
                      msg.seenTime
                        ? t('student.internshipOffers.chat.seenAt', { time: msg.seenTime })
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
            );
          })
        )}
        {peerTyping ? (
          <div className="isi-typing-indicator text-xs text-[var(--admin-text-muted)] px-4 pb-2">
            {t('student.internshipOffers.chat.adminTyping', { defaultValue: "L'administrateur écrit…" })}
          </div>
        ) : null}
      </div>

      <SupportMessageComposer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onTyping={onTyping}
        placeholder={t('student.internshipOffers.chat.composer')}
        inputAriaLabel={t('student.internshipOffers.chat.composer')}
        attachAriaLabel={t('student.internshipOffers.chat.attachFile')}
        sendAriaLabel={t('student.internshipOffers.chat.sendMessage')}
        showVoice={false}
      />
    </section>
  );
};

export default StudentInternshipChatArea;

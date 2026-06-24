import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Paperclip } from 'lucide-react';
import ChatEmptyState from '../../../shared/admin-module-chat/components/ChatEmptyState';
import SupportMessageComposer from '../../../shared/admin-support-inbox/components/SupportMessageComposer';
import type { InboxStats, InternshipConversation } from '../types/internshipChatTypes';
import { InternshipChatMessagesSkeleton, InternshipChatWorkspaceSkeleton } from './InternshipChatLoadingSkeletons';
import InternshipChatHeader from './InternshipChatHeader';
import InternshipMessageReadStatus from './InternshipMessageReadStatus';
import { useInternshipInboxCopy } from '../../hooks/useOffersListLabels';
import { formatInternshipSystemMessage } from '../utils/internshipChatSystemMessageUtils';

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
  onViewStudent: () => void;
  onViewApplication: () => void;
  onViewOffer: () => void;
  onOpenOfferInModule?: () => void;
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
  onViewStudent,
  onViewApplication,
  onViewOffer,
  onOpenOfferInModule,
  onMarkResolved,
  onArchive,
  onUnarchive,
  peerTyping = false,
  onTyping,
}) => {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, emptyState } = useInternshipInboxCopy();
  const { t: tRoot } = useTranslation();

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
        onViewStudent={onViewStudent}
        onViewApplication={onViewApplication}
        onViewOffer={onViewOffer}
        onOpenOfferInModule={onOpenOfferInModule}
        onMarkResolved={onMarkResolved}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
      />

      <div ref={scrollRef} className="isi-messages">
        {messagesLoading && conversation.messages.length === 0 ? (
          <InternshipChatMessagesSkeleton embedded />
        ) : conversation.messages.length === 0 ? (
          <div className="isi-messages-empty">
            <p className="text-sm text-[var(--admin-text-muted)]">{t('noMessages')}</p>
          </div>
        ) : (
          conversation.messages.map((msg) => {
            const systemLabel =
              msg.messageType === 'EVENT' || msg.messageType === 'SYSTEM'
                ? formatInternshipSystemMessage(msg, 'admin', tRoot)
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
                    message={msg}
                    seenLabel={
                      msg.seenTime ? t('seenAt', { time: msg.seenTime }) : undefined
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
            {t('typingIndicator', { defaultValue: "L'étudiant écrit…" })}
          </div>
        ) : null}
      </div>

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

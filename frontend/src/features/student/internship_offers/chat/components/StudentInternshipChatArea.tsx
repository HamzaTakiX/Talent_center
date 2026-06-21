import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { CheckCheck, Paperclip, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatEmptyState from '../../../../admin/shared/admin-module-chat/components/ChatEmptyState';
import type {
  InboxStats,
  InternshipConversation,
} from '../../../../admin/offres-stage/chat/types/internshipChatTypes';
import StudentInternshipChatHeader from './StudentInternshipChatHeader';

type Props = {
  conversation: InternshipConversation | null;
  stats: InboxStats;
  onSend: (text: string) => void;
  onBack?: () => void;
  onViewOffer: () => void;
};

const StudentInternshipChatArea: FunctionComponent<Props> = ({
  conversation,
  stats,
  onSend,
  onBack,
  onViewOffer,
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const adjustComposer = useCallback(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 24), 120)}px`;
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation?.messages.length, conversation?.id]);

  useEffect(() => {
    setDraft('');
    if (composerRef.current) composerRef.current.style.height = '24px';
  }, [conversation?.id]);

  useEffect(() => {
    adjustComposer();
  }, [draft, adjustComposer]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
    if (composerRef.current) composerRef.current.style.height = '24px';
  }, [draft, onSend]);

  if (!conversation) {
    return (
      <section className="isi-chat isi-chat--empty">
        <ChatEmptyState
          title={t('student.internshipOffers.chat.emptyTitle')}
          description={t('student.internshipOffers.chat.emptyDescription')}
          moduleType="internship"
          stats={{
            unread: stats.unread,
            pending: stats.waitingStudent,
            resolved: stats.resolved,
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
        {conversation.messages.length === 0 ? (
          <div className="isi-messages-empty">
            <p className="text-sm text-[var(--admin-text-muted)]">
              {t('student.internshipOffers.chat.noMessages')}
            </p>
          </div>
        ) : (
          conversation.messages.map((msg) => (
            <div key={msg.id} className="isi-msg-block">
              {msg.separatorBefore ? (
                <div className="isi-date-sep">
                  <span>{msg.separatorBefore}</span>
                </div>
              ) : null}
              {msg.messageType === 'EVENT' || msg.messageType === 'SYSTEM' ? (
                <div className="isi-system-msg">{msg.text}</div>
              ) : msg.direction === 'in' ? (
                <div className="isi-msg isi-msg--in">
                  <div className="isi-bubble isi-bubble--in">{msg.text}</div>
                  <time className="isi-msg-time">{msg.time}</time>
                </div>
              ) : (
                <div className="isi-msg isi-msg--out">
                  <div className="isi-bubble isi-bubble--out">{msg.text}</div>
                  <div className="isi-msg-meta">
                    <time className="isi-msg-time">{msg.time}</time>
                    <CheckCheck className="size-3.5 opacity-60" strokeWidth={2.25} />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <footer className="isi-composer-wrap">
        <div className="isi-composer">
          <button
            type="button"
            className="isi-composer-action"
            aria-label={t('student.internshipOffers.chat.attachFile')}
          >
            <Paperclip className="size-4" strokeWidth={1.85} />
          </button>
          <textarea
            ref={composerRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('student.internshipOffers.chat.composer')}
            className="isi-composer-input"
            aria-label={t('student.internshipOffers.chat.composer')}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            className="isi-composer-send"
            aria-label={t('student.internshipOffers.chat.sendMessage')}
          >
            <Send className="size-4" strokeWidth={2} />
          </button>
        </div>
      </footer>
    </section>
  );
};

export default StudentInternshipChatArea;

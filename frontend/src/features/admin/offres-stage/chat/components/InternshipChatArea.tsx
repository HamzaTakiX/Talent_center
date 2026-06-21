import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { CheckCheck, Paperclip, Send } from 'lucide-react';
import ChatEmptyState from '../../../shared/admin-module-chat/components/ChatEmptyState';
import type { InboxStats, InternshipConversation } from '../types/internshipChatTypes';
import InternshipChatHeader from './InternshipChatHeader';
import { useInternshipInboxCopy } from '../../hooks/useOffersListLabels';

type Props = {
  conversation: InternshipConversation | null;
  stats: InboxStats;
  onSend: (text: string) => void;
  onBack?: () => void;
  onViewStudent: () => void;
  onViewApplication: () => void;
  onViewOffer: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
};

const InternshipChatArea: FunctionComponent<Props> = ({
  conversation,
  stats,
  onSend,
  onBack,
  onViewStudent,
  onViewApplication,
  onViewOffer,
  onMarkResolved,
  onArchive,
}) => {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const { t, emptyState } = useInternshipInboxCopy();

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
          title={emptyState.title}
          description={emptyState.description}
          moduleType="internship"
          stats={{
            unread: stats.unread,
            pending: stats.waitingAdmin,
            resolved: stats.resolved,
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
        onMarkResolved={onMarkResolved}
        onArchive={onArchive}
      />

      <div ref={scrollRef} className="isi-messages">
        {conversation.messages.length === 0 ? (
          <div className="isi-messages-empty">
            <p className="text-sm text-[var(--admin-text-muted)]">{t('noMessages')}</p>
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
          <button type="button" className="isi-composer-action" aria-label={t('attachFile')}>
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
            placeholder={t('composerPlaceholder')}
            className="isi-composer-input"
            aria-label={t('composerPlaceholder')}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            className="isi-composer-send"
            aria-label={t('sendMessage')}
          >
            <Send className="size-4" strokeWidth={2} />
          </button>
        </div>
      </footer>
    </section>
  );
};

export default InternshipChatArea;

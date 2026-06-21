import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CheckCheck, Mic, Paperclip, Send } from 'lucide-react';
import ChatEmptyState from '../../../shared/admin-module-chat/components/ChatEmptyState';
import { useChatEmptyState } from '../../../i18n/useAdminCopy';
import type { AnnouncementConversation, InboxStats } from '../types/announcementChatTypes';
import AnnouncementChatHeader from './AnnouncementChatHeader';

type Props = {
  conversation: AnnouncementConversation | null;
  stats: InboxStats;
  onSend: (text: string) => void;
  onBack?: () => void;
  onOpenAnnouncement: () => void;
  onOpenStudent: () => void;
  onOpenAudience: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
};

const AnnouncementChatArea: FunctionComponent<Props> = ({
  conversation,
  stats,
  onSend,
  onBack,
  onOpenAnnouncement,
  onOpenStudent,
  onOpenAudience,
  onMarkResolved,
  onArchive,
}) => {
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
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
    if (!conversation) return;
    setTyping(Math.random() > 0.7);
    const t = window.setTimeout(() => setTyping(false), 2500);
    return () => window.clearTimeout(t);
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

  const emptyState = useChatEmptyState('announcements');

  if (!conversation) {
    return (
      <section className="isi-chat isi-chat--empty">
        <ChatEmptyState
          {...emptyState}
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
        onOpenAudience={onOpenAudience}
        onMarkResolved={onMarkResolved}
        onArchive={onArchive}
      />

      <div ref={scrollRef} className="isi-messages">
        {conversation.messages.map((msg) => (
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
                <div className="isi-msg-meta">
                  <time className="isi-msg-time">{msg.time}</time>
                  <CheckCheck className="size-3.5 opacity-60" strokeWidth={2.25} />
                </div>
              </div>
            )}
          </div>
        ))}
        {typing ? (
          <div className="isi-typing">
            <span /><span /><span />
            <span>En train d'écrire…</span>
          </div>
        ) : null}
      </div>

      <footer className="isi-composer-wrap">
        <div className="isi-composer">
          <button type="button" className="isi-composer-action" aria-label="Pièce jointe">
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
            placeholder="Écrire un message…"
            className="isi-composer-input"
            aria-label="Message"
          />
          <button type="button" className="isi-composer-action" aria-label="Note vocale">
            <Mic className="size-4" strokeWidth={1.85} />
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            className="isi-composer-send"
            aria-label="Envoyer"
          >
            <Send className="size-4" strokeWidth={2} />
          </button>
        </div>
      </footer>
    </section>
  );
};

export default AnnouncementChatArea;

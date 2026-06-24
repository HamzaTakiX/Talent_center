import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CheckCheck, Paperclip } from 'lucide-react';
import ChatEmptyState from '../../../shared/admin-module-chat/components/ChatEmptyState';
import SupportMessageComposer from '../../../shared/admin-support-inbox/components/SupportMessageComposer';
import { useChatEmptyState } from '../../../i18n/useAdminCopy';
import type { DocumentConversation, InboxStats } from '../types/documentChatTypes';
import DocumentChatHeader from './DocumentChatHeader';

type Props = {
  conversation: DocumentConversation | null;
  stats: InboxStats;
  onSend: (text: string) => void;
  onBack?: () => void;
  onOpenRequest: () => void;
  onOpenStudent: () => void;
  onOpenWorkflow: () => void;
  onMarkResolved: () => void;
  onArchive: () => void;
};

const DocumentChatArea: FunctionComponent<Props> = ({
  conversation,
  stats,
  onSend,
  onBack,
  onOpenRequest,
  onOpenStudent,
  onOpenWorkflow,
  onMarkResolved,
  onArchive,
}) => {
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation?.messages.length, conversation?.id]);

  useEffect(() => {
    setDraft('');
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation) return;
    setTyping(Math.random() > 0.7);
    const t = window.setTimeout(() => setTyping(false), 2500);
    return () => window.clearTimeout(t);
  }, [conversation?.id]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  }, [draft, onSend]);

  const emptyState = useChatEmptyState('documents');

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
      <DocumentChatHeader
        conversation={conversation}
        onBack={onBack}
        onOpenRequest={onOpenRequest}
        onOpenStudent={onOpenStudent}
        onOpenWorkflow={onOpenWorkflow}
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

      <SupportMessageComposer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        showVoice
      />
    </section>
  );
};

export default DocumentChatArea;

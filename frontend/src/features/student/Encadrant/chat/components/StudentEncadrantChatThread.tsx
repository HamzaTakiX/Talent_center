import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SupportMessageComposer from '../../../../admin/shared/admin-support-inbox/components/SupportMessageComposer';
import {
  StandardChatMessageThread,
  toChatToolMessages,
  useChatConversationTools,
} from '../../../../shared/chat-design-system';
import type { AnnouncementMessage } from '../../../../admin/announcements-stage/chat/types/announcementChatTypes';

type Props = {
  messages: AnnouncementMessage[];
  encadrantName: string;
  encadrantInitials: string;
  avatarUrl?: string | null;
  loading?: boolean;
  loadError?: string | null;
  archived?: boolean;
  onSend: (text: string) => void;
  onBack?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
};

const StudentEncadrantChatThread: FunctionComponent<Props> = ({
  messages,
  encadrantName,
  encadrantInitials,
  avatarUrl = null,
  loading = false,
  loadError,
  archived = false,
  onSend,
  onBack,
  onArchive,
  onUnarchive,
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatTools = useChatConversationTools({
    messages: toChatToolMessages(messages),
    conversationKey: 'student-encadrant',
    counterpartyName: encadrantName,
    archived,
    showArchive: false,
    onArchive,
    onUnarchive,
    scrollContainerRef: scrollRef,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, chatTools.searchQuery]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  }, [draft, onSend]);

  const emptyLabel = useMemo(() => {
    if (loadError) return loadError;
    if (loading) {
      return t('student.encadrant.chat.loading', { defaultValue: 'Chargement…' });
    }
    return t('student.encadrant.chat.emptyThread', {
      defaultValue: 'Aucun message pour le moment. Écrivez à votre encadrant.',
    });
  }, [loadError, loading, t]);

  return (
    <section className="isi-chat">
      <header className="isi-chat-header isi-chat-header--student">
        <div className="isi-chat-header-left">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="isi-icon-btn lg:hidden"
              aria-label={t('student.encadrant.chat.back', { defaultValue: 'Retour à la liste' })}
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : null}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="isi-avatar isi-avatar--header object-cover"
            />
          ) : (
            <span className="isi-avatar isi-avatar--header bg-[var(--admin-brand)] text-white">
              {encadrantInitials}
            </span>
          )}
          <div className="isi-chat-header-copy min-w-0">
            <h2 className="isi-chat-name truncate">{encadrantName}</h2>
            <p className="isi-chat-meta truncate text-[var(--admin-text-secondary)]">
              {t('student.encadrant.chat.subtitle', {
                defaultValue: 'Votre encadrant de stage',
              })}
            </p>
          </div>
        </div>
        <div className="isi-chat-actions">{chatTools.menu}</div>
      </header>
      {chatTools.searchBar}

      <div ref={scrollRef} className="isi-messages">
        <StandardChatMessageThread
          messages={messages}
          inboxMode="student"
          emptyLabel={emptyLabel}
          getMessageBlockProps={chatTools.getMessageBlockProps}
          renderHighlightedText={chatTools.renderHighlightedText}
        />
      </div>

      {chatTools.panels}

      <SupportMessageComposer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        placeholder={t('student.encadrant.chat.composer', {
          defaultValue: 'Écrire un message à votre encadrant…',
        })}
        showVoice={false}
        disabled={archived}
      />
    </section>
  );
};

export default StudentEncadrantChatThread;

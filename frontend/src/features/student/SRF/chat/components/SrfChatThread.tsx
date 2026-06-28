import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SupportMessageComposer from '../../../../admin/shared/admin-support-inbox/components/SupportMessageComposer';
import {
  StandardChatMessageThread,
  toChatToolMessages,
  useChatConversationTools,
} from '../../../../shared/chat-design-system';
import type { SrfChatMessage } from '../types';

type Props = {
  messages: SrfChatMessage[];
  loading?: boolean;
  loadError?: string | null;
  archived?: boolean;
  initialDraft?: string;
  onSend: (text: string) => void;
  onBack?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
};

const SrfChatThread: FunctionComponent<Props> = ({
  messages,
  loading = false,
  loadError,
  archived = false,
  initialDraft = '',
  onSend,
  onBack,
  onArchive,
  onUnarchive,
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(initialDraft);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialDraft) setDraft(initialDraft);
  }, [initialDraft]);

  const chatTools = useChatConversationTools({
    messages: toChatToolMessages(messages),
    conversationKey: 'student-srf',
    counterpartyName: t('student.srf.chat.serviceName'),
    archived,
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
    if (loading) return t('student.srf.chat.loading', { defaultValue: 'Chargement…' });
    return t('admin.chat.noMessages');
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
              aria-label={t('student.srf.chat.back', { defaultValue: 'Retour à la liste' })}
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : null}
          <span className="isi-avatar isi-avatar--header bg-emerald-500 text-white">SRF</span>
          <div className="isi-chat-header-copy min-w-0">
            <h2 className="isi-chat-name truncate">{t('student.srf.chat.serviceName')}</h2>
            <p className="isi-chat-meta truncate text-emerald-600 dark:text-emerald-400">
              <span className="inline-block size-2 rounded-full bg-emerald-500 me-1.5 align-middle" aria-hidden />
              {t('student.srf.chat.online')}
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
        placeholder={t('student.srf.chat.composerPlaceholder', { defaultValue: 'Écrire un message…' })}
        showVoice={false}
      />
    </section>
  );
};

export default SrfChatThread;

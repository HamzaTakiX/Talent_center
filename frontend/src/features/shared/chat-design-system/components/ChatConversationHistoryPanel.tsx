import { FunctionComponent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Clock, MessageSquare, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ConversationHistoryEntry } from '../types/chatConversationToolsTypes';

type Props = {
  open: boolean;
  entries: ConversationHistoryEntry[];
  onClose: () => void;
  onJumpToMessage: (messageId: string) => void;
};

const ChatConversationHistoryPanel: FunctionComponent<Props> = ({
  open,
  entries,
  onClose,
  onJumpToMessage,
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="chat-conversation-panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label={t('admin.chat.closePanel')}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t('admin.chat.conversationHistory')}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="chat-conversation-panel chat-conversation-panel--history"
          >
            <header className="chat-conversation-panel__header">
              <h3 className="chat-conversation-panel__title">{t('admin.chat.conversationHistory')}</h3>
              <button
                type="button"
                onClick={onClose}
                className="chat-conversation-panel__close"
                aria-label={t('admin.chat.closePanel')}
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </header>

            <div className="chat-conversation-panel__body">
              {entries.length === 0 ? (
                <p className="chat-conversation-panel__empty">{t('admin.chat.noHistory')}</p>
              ) : (
                <ol className="chat-history-timeline">
                  {entries.map((entry) => {
                    if (entry.kind === 'date') {
                      return (
                        <li key={entry.id} className="chat-history-timeline__date">
                          <Clock className="size-3.5" strokeWidth={2} aria-hidden />
                          <span>{entry.label}</span>
                        </li>
                      );
                    }

                    const Icon = entry.kind === 'event' ? Sparkles : MessageSquare;

                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          className="chat-history-timeline__item"
                          onClick={() => {
                            onJumpToMessage(entry.messageId);
                            onClose();
                          }}
                        >
                          <span className="chat-history-timeline__icon">
                            <Icon className="size-3.5" strokeWidth={2} aria-hidden />
                          </span>
                          <span className="chat-history-timeline__content">
                            <span className="chat-history-timeline__label">{entry.label}</span>
                            {entry.preview ? (
                              <span className="chat-history-timeline__preview">{entry.preview}</span>
                            ) : null}
                          </span>
                          <ChevronRight className="chat-history-timeline__chevron size-3.5" aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default ChatConversationHistoryPanel;

import { FunctionComponent, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  matchCount: number;
  activeMatchIndex: number;
  onPrevMatch: () => void;
  onNextMatch: () => void;
  onClose: () => void;
};

const ChatConversationSearchBar: FunctionComponent<Props> = ({
  open,
  query,
  onQueryChange,
  matchCount,
  activeMatchIndex,
  onPrevMatch,
  onNextMatch,
  onClose,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="chat-conversation-search overflow-hidden border-b border-[var(--admin-border)]"
        >
          <div className="chat-conversation-search__inner">
            <label className="chat-conversation-search__field">
              <Search className="chat-conversation-search__icon" strokeWidth={2} aria-hidden />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder={t('admin.chat.searchInConversation')}
                aria-label={t('admin.chat.searchInConversation')}
                className="chat-conversation-search__input"
                autoComplete="off"
                spellCheck={false}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    if (event.shiftKey) onPrevMatch();
                    else onNextMatch();
                  }
                }}
              />
              {query.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    onQueryChange('');
                    inputRef.current?.focus();
                  }}
                  className="chat-conversation-search__clear"
                  aria-label={t('admin.chat.clearSearch')}
                >
                  <X className="size-3.5" strokeWidth={2.25} />
                </button>
              ) : null}
            </label>

            <div className="chat-conversation-search__nav">
              <span className="chat-conversation-search__count" aria-live="polite">
                {query.trim()
                  ? matchCount > 0
                    ? t('admin.chat.searchResults', {
                        current: activeMatchIndex + 1,
                        total: matchCount,
                      })
                    : t('admin.chat.noMessages')
                  : ''}
              </span>
              <div className="chat-conversation-search__nav-buttons">
                <button
                  type="button"
                  onClick={onPrevMatch}
                  disabled={!matchCount}
                  className="chat-conversation-search__nav-btn"
                  aria-label={t('admin.chat.searchNavigatePrev')}
                >
                  <ChevronUp className="size-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={onNextMatch}
                  disabled={!matchCount}
                  className="chat-conversation-search__nav-btn"
                  aria-label={t('admin.chat.searchNavigateNext')}
                >
                  <ChevronDown className="size-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="chat-conversation-search__nav-btn"
                  aria-label={t('admin.chat.closeSearch')}
                >
                  <X className="size-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ChatConversationSearchBar;

import {
  FunctionComponent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, RefreshCw, Search, Tag, Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatComposerTooltip from './ChatComposerTooltip';
import { useAuthorizedChatTags } from '../hooks/useAuthorizedChatTags';
import type { ChatModule } from '../types';
import type { ChatComposerPendingTag } from '../types/chatTagTypes';
import '../styles/chat-composer-tags.css';

type Props = {
  chatModule: ChatModule;
  selectedCodes: string[];
  onChange: (tags: ChatComposerPendingTag[]) => void;
  disabled?: boolean;
  /** When false, the picker button is not rendered. */
  enabled?: boolean;
};

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el) return;
      if (event.target instanceof Node && !el.contains(event.target)) onOutside();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, [active, onOutside, ref]);
}

function TagPickerSkeleton() {
  return (
    <div className="chat-composer-tag-picker__skeleton" aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="chat-composer-tag-picker__skeleton-row" style={{ animationDelay: `${index * 80}ms` }}>
          <div className="chat-composer-tag-picker__skeleton-icon" />
          <div className="chat-composer-tag-picker__skeleton-lines">
            <div className="chat-composer-tag-picker__skeleton-line" />
            <div className="chat-composer-tag-picker__skeleton-line--short" />
          </div>
        </div>
      ))}
    </div>
  );
}

const ChatComposerTagPicker: FunctionComponent<Props> = ({
  chatModule,
  selectedCodes,
  onChange,
  disabled = false,
  enabled = true,
}) => {
  const { t } = useTranslation();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { tags, byCode, loading, error, refresh } = useAuthorizedChatTags(chatModule, enabled);

  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  useClickOutside(rootRef, close, open);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => searchRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((tag) => {
      const label = t(`admin.chat.tags.${tag.code}`, { defaultValue: tag.name }).toLowerCase();
      return tag.code.toLowerCase().includes(q) || label.includes(q) || tag.name.toLowerCase().includes(q);
    });
  }, [query, t, tags]);

  const emitChange = useCallback(
    (codes: string[]) => {
      const next: ChatComposerPendingTag[] = codes
        .map((code) => {
          const tag = byCode.get(code);
          if (!tag) return null;
          return {
            code: tag.code,
            name: t(`admin.chat.tags.${tag.code}`, { defaultValue: tag.name }),
            color: tag.color || '#64748b',
          };
        })
        .filter((tag): tag is ChatComposerPendingTag => Boolean(tag));
      onChange(next);
    },
    [byCode, onChange, t],
  );

  const toggle = (code: string) => {
    if (selectedSet.has(code)) {
      emitChange(selectedCodes.filter((item) => item !== code));
    } else {
      emitChange([...selectedCodes, code]);
    }
  };

  if (!enabled) return null;

  const ariaLabel = t('admin.chat.tagTemplate', { defaultValue: 'Tag ou contexte' });
  const hasSelection = selectedCodes.length > 0;

  return (
    <div ref={rootRef} className="chat-composer-tag-picker">
      <ChatComposerTooltip label={ariaLabel} disabled={disabled}>
        <button
          type="button"
          className={`isi-composer-action${hasSelection ? ' isi-composer-action--tag-active' : ''}${open ? ' isi-composer-action--tag-open' : ''}`}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          disabled={disabled}
          onClick={() => setOpen((value) => !value)}
        >
          <Tag className="size-[1.05rem]" strokeWidth={1.85} aria-hidden />
        </button>
      </ChatComposerTooltip>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={t('admin.chat.tagPickerTitle', { defaultValue: 'Contexte / tags' })}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="chat-composer-tag-picker__panel"
          >
            <header className="chat-composer-tag-picker__head">
              <div className="chat-composer-tag-picker__head-row">
                <span className="chat-composer-tag-picker__head-icon" aria-hidden>
                  <Tag className="size-4" strokeWidth={2} />
                </span>
                <div className="chat-composer-tag-picker__head-copy">
                  <p className="chat-composer-tag-picker__eyebrow">
                    {t('admin.chat.menuSectionExplore', { defaultValue: 'Explorer' })}
                  </p>
                  <p className="chat-composer-tag-picker__title">
                    {t('admin.chat.tagPickerTitle', { defaultValue: 'Contexte / tags' })}
                  </p>
                  <p className="chat-composer-tag-picker__hint">
                    {t(`admin.chat.tagPickerHints.${chatModule}`, {
                      defaultValue: t('admin.chat.tagPickerHint', {
                        defaultValue: 'Sélectionnez le contexte métier pour ce message.',
                      }),
                    })}
                  </p>
                </div>
              </div>
              <label className="chat-composer-tag-picker__search">
                <Search className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                <input
                  ref={searchRef}
                  type="text"
                  inputMode="search"
                  enterKeyHint="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('admin.chat.tagPickerSearch', { defaultValue: 'Rechercher…' })}
                  autoComplete="off"
                  role="searchbox"
                />
              </label>
            </header>

            <div className="chat-composer-tag-picker__list">
              {loading ? (
                <TagPickerSkeleton />
              ) : error ? (
                <div className="chat-composer-tag-picker__state" role="alert">
                  <span className="chat-composer-tag-picker__state-icon chat-composer-tag-picker__state-icon--error">
                    <AlertCircle className="size-4" strokeWidth={2} aria-hidden />
                  </span>
                  <p className="chat-composer-tag-picker__state-copy">
                    {t('admin.chat.tagPickerError', { defaultValue: 'Impossible de charger les tags.' })}
                  </p>
                  <button type="button" className="chat-composer-tag-picker__retry" onClick={() => void refresh()}>
                    <RefreshCw className="mr-1 inline size-3" strokeWidth={2.25} aria-hidden />
                    {t('admin.chat.tagPickerRetry', { defaultValue: 'Réessayer' })}
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="chat-composer-tag-picker__state">
                  <span className="chat-composer-tag-picker__state-icon">
                    <Tags className="size-4" strokeWidth={2} aria-hidden />
                  </span>
                  <p className="chat-composer-tag-picker__state-copy">
                    {query.trim()
                      ? t('admin.chat.tagPickerNoResults', { defaultValue: 'Aucun tag ne correspond à votre recherche.' })
                      : t('admin.chat.tagPickerEmpty', { defaultValue: 'Aucun tag disponible.' })}
                  </p>
                </div>
              ) : (
                filtered.map((tag) => {
                  const selected = selectedSet.has(tag.code);
                  const label = t(`admin.chat.tags.${tag.code}`, { defaultValue: tag.name });
                  const tagColor = tag.color || '#64748b';
                  return (
                    <button
                      key={tag.code}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`chat-composer-tag-picker__option${selected ? ' is-selected' : ''}`}
                      style={{ ['--tag-color' as string]: tagColor }}
                      onClick={() => toggle(tag.code)}
                    >
                      <span className="chat-composer-tag-picker__swatch-wrap">
                        <span className="chat-composer-tag-picker__swatch" aria-hidden />
                      </span>
                      <span className="chat-composer-tag-picker__option-copy">
                        <span className="chat-composer-tag-picker__option-label">{label}</span>
                        <span className="chat-composer-tag-picker__option-code">{tag.code}</span>
                      </span>
                      {selected ? (
                        <span className="chat-composer-tag-picker__check" aria-hidden>
                          <Check className="size-3" strokeWidth={2.75} />
                        </span>
                      ) : (
                        <span className="chat-composer-tag-picker__check-spacer" aria-hidden />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {hasSelection && !loading && !error ? (
              <footer className="chat-composer-tag-picker__footer">
                <span>
                  {t('admin.chat.tagPickerSelectedHint', {
                    defaultValue: 'Sélection appliquée au prochain message',
                  })}
                </span>
                <span className="chat-composer-tag-picker__footer-count">
                  {selectedCodes.length}
                </span>
              </footer>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ChatComposerTagPicker;

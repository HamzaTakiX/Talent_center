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
import {
  AlertCircle,
  Briefcase,
  CalendarClock,
  Check,
  CheckSquare,
  FileText,
  Link2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatComposerTooltip from './ChatComposerTooltip';
import { useChatEntityReferences } from '../hooks/useChatEntityReferences';
import type { ChatModule } from '../types';
import type { ChatComposerPendingEntity, ChatEntityReference } from '../types/chatEntityTypes';
import '../styles/chat-composer-tags.css';

type Props = {
  chatModule: ChatModule;
  conversationId?: string;
  selected: ChatComposerPendingEntity[];
  onChange: (entities: ChatComposerPendingEntity[]) => void;
  disabled?: boolean;
  enabled?: boolean;
};

function refKey(ref: Pick<ChatEntityReference, 'entity_type' | 'entity_id'>) {
  return `${ref.entity_type}:${ref.entity_id}`;
}

const ENTITY_GROUP_ORDER = [
  'meeting',
  'task',
  'report',
  'internship_offer',
  'offer_application',
] as const;

function EntityTypeIcon({ type }: { type: string }) {
  const iconProps = { className: 'size-3.5', strokeWidth: 2.25, 'aria-hidden': true as const };
  switch (type) {
    case 'meeting':
      return <CalendarClock {...iconProps} />;
    case 'task':
      return <CheckSquare {...iconProps} />;
    case 'report':
      return <FileText {...iconProps} />;
    case 'internship_offer':
    case 'offer_application':
      return <Briefcase {...iconProps} />;
    default:
      return <Link2 {...iconProps} />;
  }
}

function groupEntityItems(items: ChatEntityReference[]) {
  const buckets = new Map<string, ChatEntityReference[]>();
  for (const item of items) {
    const key = item.entity_type || 'other';
    const list = buckets.get(key);
    if (list) list.push(item);
    else buckets.set(key, [item]);
  }
  const ordered = ENTITY_GROUP_ORDER.filter((key) => buckets.has(key)).map((key) => ({
    type: key,
    items: buckets.get(key) ?? [],
  }));
  for (const [type, groupItems] of buckets) {
    if (!ENTITY_GROUP_ORDER.includes(type as (typeof ENTITY_GROUP_ORDER)[number])) {
      ordered.push({ type, items: groupItems });
    }
  }
  return ordered;
}

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

const ChatComposerEntityPicker: FunctionComponent<Props> = ({
  chatModule,
  conversationId,
  selected,
  onChange,
  disabled = false,
  enabled = true,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const { items, loading, error, search, setSearch, reload } = useChatEntityReferences(
    chatModule,
    conversationId,
    enabled,
  );

  useClickOutside(rootRef, () => setOpen(false), open);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const selectedKeys = useMemo(() => new Set(selected.map(refKey)), [selected]);
  const groupedItems = useMemo(() => groupEntityItems(items), [items]);
  const showGroups = groupedItems.length > 1;

  const toggle = useCallback(
    (item: ChatEntityReference) => {
      const key = refKey(item);
      if (selectedKeys.has(key)) {
        onChange(selected.filter((entry) => refKey(entry) !== key));
      } else if (selected.length < 5) {
        onChange([...selected, item]);
      }
    },
    [onChange, selected, selectedKeys],
  );

  if (!enabled) return null;

  const ariaLabel = t('admin.chat.entityPickerAction', { defaultValue: 'Référencer un élément' });
  const hasSelection = selected.length > 0;

  return (
    <div ref={rootRef} className="chat-composer-tag-picker chat-composer-entity-picker">
      <ChatComposerTooltip label={ariaLabel} disabled={disabled}>
        <button
          type="button"
          className={`isi-composer-action isi-composer-action--entity${hasSelection ? ' isi-composer-action--entity-active' : ''}${open ? ' isi-composer-action--entity-open' : ''}`}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          disabled={disabled}
          onClick={() => setOpen((value) => !value)}
        >
          <Link2 className="size-[1.05rem]" strokeWidth={1.85} aria-hidden />
        </button>
      </ChatComposerTooltip>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={t('admin.chat.entityPickerTitle', { defaultValue: 'Référencer un élément' })}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="chat-composer-tag-picker__panel"
          >
            <header className="chat-composer-tag-picker__head">
              <div className="chat-composer-tag-picker__head-row">
                <span className="chat-composer-tag-picker__head-icon" aria-hidden>
                  <Link2 className="size-4" strokeWidth={2} />
                </span>
                <div className="chat-composer-tag-picker__head-copy">
                  <p className="chat-composer-tag-picker__eyebrow">
                    {t('admin.chat.menuSectionExplore', { defaultValue: 'Explorer' })}
                  </p>
                  <p className="chat-composer-tag-picker__title">
                    {t('admin.chat.entityPickerTitle', { defaultValue: 'Référencer un élément' })}
                  </p>
                  <p className="chat-composer-tag-picker__hint">
                    {t(`admin.chat.entityPickerHints.${chatModule}`, {
                      defaultValue: t('admin.chat.entityPickerHint', {
                        defaultValue: 'Indiquez de quel document, offre ou élément il s’agit.',
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('admin.chat.entityPickerSearch', { defaultValue: 'Rechercher…' })}
                  autoComplete="off"
                  role="searchbox"
                />
              </label>
            </header>

            <div className="chat-composer-tag-picker__list">
              {loading ? (
                <div className="chat-composer-tag-picker__skeleton" aria-hidden>
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="chat-composer-tag-picker__skeleton-row">
                      <div className="chat-composer-tag-picker__skeleton-icon" />
                      <div className="chat-composer-tag-picker__skeleton-lines">
                        <div className="chat-composer-tag-picker__skeleton-line" />
                        <div className="chat-composer-tag-picker__skeleton-line--short" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="chat-composer-tag-picker__state" role="alert">
                  <span className="chat-composer-tag-picker__state-icon chat-composer-tag-picker__state-icon--error">
                    <AlertCircle className="size-4" strokeWidth={2} aria-hidden />
                  </span>
                  <p className="chat-composer-tag-picker__state-copy">
                    {t('admin.chat.entityPickerError', { defaultValue: 'Impossible de charger les éléments.' })}
                  </p>
                  <button type="button" className="chat-composer-tag-picker__retry" onClick={() => void reload()}>
                    <RefreshCw className="mr-1 inline size-3" strokeWidth={2.25} aria-hidden />
                    {t('admin.chat.entityPickerRetry', { defaultValue: 'Réessayer' })}
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="chat-composer-tag-picker__state">
                  <span className="chat-composer-tag-picker__state-icon">
                    <Link2 className="size-4" strokeWidth={2} aria-hidden />
                  </span>
                  <p className="chat-composer-tag-picker__state-copy">
                    {search.trim()
                      ? t('admin.chat.entityPickerNoResults', {
                          defaultValue: 'Aucun élément ne correspond à votre recherche.',
                        })
                      : t('admin.chat.entityPickerEmpty', { defaultValue: 'Aucun élément disponible.' })}
                  </p>
                </div>
              ) : (
                groupedItems.map((group) => (
                  <div key={group.type} className="chat-composer-entity-picker__group">
                    {showGroups ? (
                      <p className="chat-composer-entity-picker__group-label">
                        {t(`admin.chat.entityPickerGroups.${group.type}`, {
                          defaultValue: group.type,
                        })}
                      </p>
                    ) : null}
                    {group.items.map((item) => {
                      const selectedItem = selectedKeys.has(refKey(item));
                      return (
                        <button
                          key={refKey(item)}
                          type="button"
                          role="option"
                          aria-selected={selectedItem}
                          className={`chat-composer-tag-picker__option chat-composer-entity-picker__option${selectedItem ? ' is-selected' : ''}`}
                          onClick={() => toggle(item)}
                        >
                          <span className="chat-composer-entity-picker__icon-wrap">
                            <EntityTypeIcon type={item.entity_type} />
                          </span>
                          <span className="chat-composer-tag-picker__option-copy">
                            <span className="chat-composer-tag-picker__option-label">{item.label}</span>
                            {item.subtitle ? (
                              <span className="chat-composer-tag-picker__option-code">{item.subtitle}</span>
                            ) : null}
                          </span>
                          {selectedItem ? (
                            <Check className="chat-composer-tag-picker__check size-4" strokeWidth={2.5} aria-hidden />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ChatComposerEntityPicker;

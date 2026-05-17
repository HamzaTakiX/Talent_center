import { FunctionComponent, RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AdminSearchGroup, AdminSearchItem } from '../types';
import AdminCommandPaletteResult from './AdminCommandPaletteResult';

interface AdminSearchDropdownProps {
  open: boolean;
  listId: string;
  listRef: RefObject<HTMLDivElement | null>;
  query: string;
  hasQuery: boolean;
  totalCount: number;
  results: AdminSearchGroup[];
  suggestedItems: AdminSearchItem[];
  recentQueries: string[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (item: AdminSearchItem) => void;
  onRecentClick: (q: string) => void;
  onClearRecent: () => void;
}

const AdminSearchDropdown: FunctionComponent<AdminSearchDropdownProps> = ({
  open,
  listId,
  listRef,
  hasQuery,
  totalCount,
  results,
  suggestedItems,
  recentQueries,
  activeIndex,
  onActiveIndexChange,
  onSelect,
  onRecentClick,
  onClearRecent,
}) => {
  const { t } = useTranslation();
  let flatIndex = -1;

  const showEmpty = hasQuery && totalCount === 0;
  const showContent =
    (hasQuery && totalCount > 0) ||
    (!hasQuery && (suggestedItems.length > 0 || recentQueries.length > 0));

  return (
    <AnimatePresence>
      {open && (showContent || showEmpty) && (
        <motion.div
          id={listId}
          ref={listRef as React.Ref<HTMLDivElement>}
          role="listbox"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="admin-header-search-dropdown admin-scroll"
        >
          {!hasQuery && recentQueries.length > 0 && (
            <motion.div className="admin-cmd-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-cmd-group-header">
                <span>{t('admin.globalSearch.recent')}</span>
                <button type="button" className="admin-cmd-clear-recent" onClick={onClearRecent}>
                  {t('admin.globalSearch.clearRecent')}
                </button>
              </div>
              {recentQueries.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="admin-cmd-recent"
                  onClick={() => onRecentClick(q)}
                >
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--admin-text-muted)]" strokeWidth={2} />
                  <span>{q}</span>
                </button>
              ))}
            </motion.div>
          )}

          {!hasQuery && suggestedItems.length > 0 && (
            <motion.div className="admin-cmd-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-cmd-group-header">{t('admin.globalSearch.suggested')}</div>
              {suggestedItems.map((item) => {
                flatIndex += 1;
                const idx = flatIndex;
                return (
                  <AdminCommandPaletteResult
                    key={item.id}
                    item={item}
                    isActive={activeIndex === idx}
                    onSelect={() => onSelect(item)}
                    onHover={() => onActiveIndexChange(idx)}
                  />
                );
              })}
            </motion.div>
          )}

          {hasQuery &&
            results.map((group) => (
              <motion.div
                key={group.category}
                className="admin-cmd-group"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="admin-cmd-group-header">
                  <span>{group.label}</span>
                  <span className="admin-cmd-group-count">{group.items.length}</span>
                </div>
                {group.items.map((item) => {
                  flatIndex += 1;
                  const idx = flatIndex;
                  return (
                    <AdminCommandPaletteResult
                      key={item.id}
                      item={item}
                      isActive={activeIndex === idx}
                      onSelect={() => onSelect(item)}
                      onHover={() => onActiveIndexChange(idx)}
                    />
                  );
                })}
              </motion.div>
            ))}

          {showEmpty && (
            <motion.div
              className="admin-cmd-empty admin-cmd-empty--compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="admin-cmd-empty-icon">
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <p className="admin-cmd-empty-title">{t('admin.globalSearch.noResults')}</p>
              <p className="admin-cmd-empty-hint">{t('admin.globalSearch.noResultsHint')}</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminSearchDropdown;

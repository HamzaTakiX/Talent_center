import { FunctionComponent, ReactNode, useState } from 'react';
import { Archive, Filter, MessageSquare, Search, X } from 'lucide-react';
import { useInternshipInboxCopy } from '../../../offres-stage/hooks/useOffersListLabels';
import InternshipSidebarEmptyState from '../../../offres-stage/chat/components/InternshipSidebarEmptyState';
import type { PrimaryDeskFilter, PrimaryFilterCounts, SupportConversationListItem } from '../types/supportInboxTypes';
import SupportConversationCard from './SupportConversationCard';
import SupportSearchField from './SupportSearchField';

interface Props {
  title?: string;
  items: SupportConversationListItem[];
  selectedId: string;
  search: string;
  hasActiveFilters?: boolean;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  filtersSlot?: ReactNode;
  emptyMessage?: string;
  emptyHint?: string;
  primaryFilter?: PrimaryDeskFilter;
  primaryFilterCounts?: PrimaryFilterCounts;
  onSetPrimaryFilter?: (value: PrimaryDeskFilter) => void;
}

const SupportConversationList: FunctionComponent<Props> = ({
  title = 'Conversations',
  items,
  selectedId,
  search,
  hasActiveFilters = false,
  searchPlaceholder,
  onSearchChange,
  onSelect,
  filtersSlot,
  emptyMessage = 'Aucune conversation',
  emptyHint = 'Ajustez vos filtres ou votre recherche',
  primaryFilter = 'all',
  primaryFilterCounts,
  onSetPrimaryFilter,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const showFilters = Boolean(filtersSlot);
  const showArchiveToggle = Boolean(onSetPrimaryFilter && primaryFilterCounts);
  const { t } = useInternshipInboxCopy();
  const viewingArchived = primaryFilter === 'archived';

  return (
    <aside className="isi-sidebar">
      <div className="isi-sidebar-head">
        <div className="isi-sidebar-title-wrap">
          <MessageSquare className="isi-sidebar-title-icon" strokeWidth={2} aria-hidden />
          <h2 className="isi-sidebar-title">{title}</h2>
        </div>

        <div className="isi-sidebar-actions">
          {showArchiveToggle ? (
            <button
              type="button"
              onClick={() => onSetPrimaryFilter!(viewingArchived ? 'all' : 'archived')}
              className={`isi-filter-toggle ${viewingArchived ? 'isi-filter-toggle--active' : ''}`}
              aria-label={viewingArchived ? t('backToActiveConversations') : t('viewArchivedAria')}
              title={viewingArchived ? t('backToActiveConversations') : t('primaryChips.archived')}
            >
              <Archive className="size-4" strokeWidth={2} />
              {!viewingArchived && primaryFilterCounts!.archived > 0 ? (
                <span className="isi-sidebar-action-badge">
                  {primaryFilterCounts!.archived > 99 ? '99+' : primaryFilterCounts!.archived}
                </span>
              ) : null}
            </button>
          ) : null}

          {showFilters ? (
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`isi-filter-toggle ${filtersOpen || hasActiveFilters ? 'isi-filter-toggle--active' : ''}`}
              aria-expanded={filtersOpen}
              aria-label={t('filters')}
            >
              <Filter className="size-4" strokeWidth={2} />
              {hasActiveFilters ? <span className="isi-filter-dot" /> : null}
            </button>
          ) : null}
        </div>
      </div>

      {viewingArchived ? (
        <div className="isi-archived-strip">
          <Archive className="isi-archived-strip-icon" strokeWidth={2} aria-hidden />
          <span className="isi-archived-strip-label">{t('archivedBanner')}</span>
          <button
            type="button"
            onClick={() => onSetPrimaryFilter?.('all')}
            className="isi-archived-strip-back"
          >
            {t('backToActiveConversations')}
          </button>
        </div>
      ) : null}

      {searchPlaceholder ? (
        <div className="isi-search-wrap">
          <label className="admin-header-search-field isi-search-field">
            <Search className="admin-header-search-icon" strokeWidth={2} aria-hidden />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="admin-input admin-header-search-input isi-search-input"
              aria-label="Rechercher une conversation"
              autoComplete="off"
              spellCheck={false}
            />
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="admin-header-search-clear"
                aria-label="Effacer"
              >
                <X className="size-3.5" strokeWidth={2.25} />
              </button>
            ) : null}
          </label>
        </div>
      ) : (
        <SupportSearchField
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      )}

      {showFilters && filtersOpen ? filtersSlot : null}

      <nav className="isi-conv-list" aria-label="Liste des conversations">
        {items.length === 0 ? (
          search.trim() ? (
            <div className="isi-conv-empty isi-conv-empty--search">
              <Search className="isi-empty-search-icon" strokeWidth={1.5} aria-hidden />
              <p className="isi-empty-search-title">Aucun résultat</p>
              <p className="isi-empty-search-desc">
                Aucune conversation pour «&nbsp;{search.trim()}&nbsp;»
              </p>
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="isi-empty-search-clear-btn"
              >
                Effacer la recherche
              </button>
            </div>
          ) : showArchiveToggle ? (
            <InternshipSidebarEmptyState
              title={viewingArchived ? t('noArchivedConversations') : t('noConversations')}
              description={
                viewingArchived ? t('noArchivedConversationsDesc') : t('noConversationsFilterHint')
              }
              variant={viewingArchived ? 'archived' : 'default'}
            />
          ) : (
            <div className="isi-conv-empty">
              <p className="text-sm font-medium text-[var(--admin-text)]">{emptyMessage}</p>
              <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{emptyHint}</p>
            </div>
          )
        ) : (
          items.map((item) => (
            <SupportConversationCard
              key={item.id}
              item={item}
              active={item.id === selectedId}
              onSelect={onSelect}
            />
          ))
        )}
      </nav>
    </aside>
  );
};

export default SupportConversationList;

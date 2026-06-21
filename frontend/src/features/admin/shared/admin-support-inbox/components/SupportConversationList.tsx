import { FunctionComponent, ReactNode, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import type { SupportConversationListItem } from '../types/supportInboxTypes';
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
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const showFilters = Boolean(filtersSlot);

  return (
    <aside className="isi-sidebar">
      <div className="isi-sidebar-head">
        <h2 className="isi-sidebar-title">{title}</h2>
        {showFilters ? (
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={`isi-filter-toggle ${filtersOpen || hasActiveFilters ? 'isi-filter-toggle--active' : ''}`}
            aria-expanded={filtersOpen}
            aria-label="Filtres"
          >
            <Filter className="size-4" strokeWidth={2} />
            {hasActiveFilters ? <span className="isi-filter-dot" /> : null}
          </button>
        ) : null}
      </div>

      <SupportSearchField
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
      />

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

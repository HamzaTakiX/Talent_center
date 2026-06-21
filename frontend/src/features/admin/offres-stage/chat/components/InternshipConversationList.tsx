import { FunctionComponent, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import type { FilterCounts, InboxFilters, InternshipConversation, PrimaryFilterCounts } from '../types/internshipChatTypes';
import InternshipFilterAccordion from './InternshipFilterAccordion';

function offerInitials(company: string, offerTitle: string): string {
  const src = (company || offerTitle).trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (src.slice(0, 2) || '??').toUpperCase();
}

type Props = {
  conversations: InternshipConversation[];
  selectedId: string;
  filters: InboxFilters;
  hasActiveFilters: boolean;
  filterCounts: FilterCounts;
  primaryFilterCounts: PrimaryFilterCounts;
  programOptions: string[];
  classOptions: string[];
  academicLevelOptions: string[];
  internshipTypeOptions: string[];
  loading: boolean;
  search: string;
  variant?: 'admin' | 'student';
  sidebarTitle?: string;
  searchPlaceholder?: string;
  onSetPrimary: (v: InboxFilters['primary']) => void;
  onToggleFilter: <K extends 'applicationStatuses' | 'internshipTypes' | 'programs' | 'academicLevels' | 'classes' | 'priorities' | 'tags'>(
    key: K,
    value: InboxFilters[K][number],
  ) => void;
  onClearFilters: () => void;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
};

const InternshipConversationList: FunctionComponent<Props> = ({
  conversations,
  selectedId,
  filters,
  hasActiveFilters,
  filterCounts,
  primaryFilterCounts,
  programOptions,
  classOptions,
  academicLevelOptions,
  internshipTypeOptions,
  loading,
  search,
  variant = 'admin',
  sidebarTitle = 'Conversations',
  searchPlaceholder = 'Rechercher une offre ou un étudiant…',
  onSetPrimary,
  onToggleFilter,
  onClearFilters,
  onSearchChange,
  onSelect,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isStudent = variant === 'student';

  return (
    <aside className="isi-sidebar">
      <div className="isi-sidebar-head">
        <h2 className="isi-sidebar-title">{sidebarTitle}</h2>
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
      </div>

      <div className="isi-search-wrap">
        <label className="admin-header-search-field isi-search-field">
          <Search className="admin-header-search-icon" strokeWidth={2} aria-hidden />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="admin-input admin-header-search-input isi-search-input"
            aria-label={searchPlaceholder}
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

      {filtersOpen ? (
        <InternshipFilterAccordion
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          filterCounts={filterCounts}
          primaryFilterCounts={primaryFilterCounts}
          programOptions={programOptions}
          classOptions={classOptions}
          academicLevelOptions={academicLevelOptions}
          internshipTypeOptions={internshipTypeOptions}
          onSetPrimary={onSetPrimary}
          onToggle={onToggleFilter}
          onClear={onClearFilters}
        />
      ) : null}

      <nav className="isi-conv-list" aria-label="Liste des conversations">
        {loading ? (
          <div className="isi-conv-empty">
            <p className="text-sm text-[var(--admin-text-muted)]">Chargement…</p>
          </div>
        ) : conversations.length === 0 ? (
          search.trim() ? (
            <div className="isi-conv-empty isi-conv-empty--search">
              <Search className="isi-empty-search-icon" strokeWidth={1.5} aria-hidden />
              <p className="isi-empty-search-title">Aucun résultat</p>
              <p className="isi-empty-search-desc">
                Aucune conversation pour «&nbsp;{search.trim()}&nbsp;»
              </p>
              <button type="button" onClick={() => onSearchChange('')} className="isi-empty-search-clear-btn">
                Effacer la recherche
              </button>
            </div>
          ) : (
            <div className="isi-conv-empty">
              <p className="text-sm font-medium text-[var(--admin-text)]">Aucune conversation</p>
              <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                Ajustez vos filtres ou votre recherche
              </p>
            </div>
          )
        ) : (
          conversations.map((conv) => {
            const active = conv.id === selectedId;
            const avatarLabel = isStudent
              ? offerInitials(conv.company, conv.offerTitle)
              : conv.studentInitials;
            const primaryName = isStudent ? conv.offerTitle : conv.studentName;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv.id)}
                className={`isi-conv-item ${active ? 'isi-conv-item--active' : ''}`}
              >
                <div className="isi-avatar">{avatarLabel}</div>
                <div className="isi-conv-body">
                  <div className="isi-conv-row">
                    <span className="isi-conv-name">{primaryName}</span>
                    <span className="isi-conv-time">{conv.timeLabel}</span>
                  </div>
                  {isStudent ? (
                    <p className="isi-conv-meta-line">
                      {conv.company}
                      {conv.internshipType !== 'Other' ? ` · ${conv.internshipType}` : ''}
                    </p>
                  ) : (
                    <p className="isi-conv-meta-line">
                      {conv.program}
                      {conv.className !== '—' ? ` · ${conv.className}` : ''}
                    </p>
                  )}
                  {!isStudent ? <p className="isi-conv-offer">{conv.offerTitle}</p> : null}
                  <p className="isi-conv-preview">{conv.lastMessage}</p>
                  <span className="isi-status-text">{conv.applicationStatus}</span>
                </div>
                {conv.unreadCount > 0 ? (
                  <span className="isi-unread">{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</span>
                ) : null}
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
};

export default InternshipConversationList;

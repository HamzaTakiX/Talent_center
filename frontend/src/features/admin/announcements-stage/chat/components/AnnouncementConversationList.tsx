import { FunctionComponent, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import type { StudentAcademicFilterCounts } from '../../../shared/chat-filters/studentAcademicChatFilterTypes';
import type { AnnouncementConversation, AnnouncementInboxFilters } from '../types/announcementChatTypes';
import AnnouncementFilterAccordion from './AnnouncementFilterAccordion';

type Props = {
  conversations: AnnouncementConversation[];
  selectedId: string;
  filters: AnnouncementInboxFilters;
  hasActiveFilters: boolean;
  filterCounts: StudentAcademicFilterCounts;
  programOptions: string[];
  classOptions: string[];
  academicLevelOptions: string[];
  search: string;
  onToggleFilter: <K extends 'categories' | 'statuses' | 'priorities'>(
    key: K,
    value: AnnouncementInboxFilters[K][number]
  ) => void;
  onToggleStudentAcademicFilter: (key: keyof import('../../../shared/chat-filters/studentAcademicChatFilterTypes').StudentAcademicChatFilters, value: string) => void;
  onToggleQuickFilter: (key: 'unread' | 'urgent' | 'archived') => void;
  onClearFilters: () => void;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
};

const AnnouncementConversationList: FunctionComponent<Props> = ({
  conversations,
  selectedId,
  filters,
  hasActiveFilters,
  filterCounts,
  programOptions,
  classOptions,
  academicLevelOptions,
  search,
  onToggleFilter,
  onToggleStudentAcademicFilter,
  onToggleQuickFilter,
  onClearFilters,
  onSearchChange,
  onSelect,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <aside className="isi-sidebar">
      <div className="isi-sidebar-head">
        <h2 className="isi-sidebar-title">Conversations</h2>
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
            placeholder="Rechercher une annonce…"
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

      {filtersOpen ? (
        <AnnouncementFilterAccordion
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          filterCounts={filterCounts}
          programOptions={programOptions}
          classOptions={classOptions}
          academicLevelOptions={academicLevelOptions}
          onToggle={onToggleFilter}
          onToggleStudentAcademic={onToggleStudentAcademicFilter}
          onToggleQuick={onToggleQuickFilter}
          onClear={onClearFilters}
        />
      ) : null}

      <nav className="isi-conv-list" aria-label="Liste des conversations">
        {conversations.length === 0 ? (
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
              <p className="text-sm font-medium text-[var(--admin-text)]">Aucune conversation</p>
              <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                Ajustez vos filtres ou votre recherche
              </p>
            </div>
          )
        ) : (
          conversations.map((conv) => {
            const active = conv.id === selectedId;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv.id)}
                className={`isi-conv-item ${active ? 'isi-conv-item--active' : ''}`}
              >
                <div className="isi-avatar">{conv.studentInitials}</div>
                <div className="isi-conv-body">
                  <div className="isi-conv-row">
                    <span className="isi-conv-name">{conv.studentName}</span>
                    <span className="isi-conv-time">{conv.timeLabel}</span>
                  </div>
                  <p className="isi-conv-meta-line">
                    {conv.program}
                    {conv.className !== '—' ? ` · ${conv.className}` : ''}
                  </p>
                  <p className="isi-conv-offer">{conv.announcementTitle}</p>
                  <p className="isi-conv-preview">{conv.lastMessage}</p>
                  <span className="isi-status-text">{conv.publishStatus}</span>
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

export default AnnouncementConversationList;

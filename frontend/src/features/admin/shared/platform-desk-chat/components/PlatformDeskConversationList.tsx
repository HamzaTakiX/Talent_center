import { FunctionComponent, useMemo, useState } from 'react';
import { Archive, Filter, MessageSquare, Search, X } from 'lucide-react';
import { useInternshipInboxCopy } from '../../../offres-stage/hooks/useOffersListLabels';
import InternshipSidebarEmptyState from '../../../offres-stage/chat/components/InternshipSidebarEmptyState';
import { InternshipChatSidebarSkeleton } from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import type { StudentAcademicFilterCounts } from '../../chat-filters/studentAcademicChatFilterTypes';
import DeskStudentFilterPanel from '../../chat-filters/DeskStudentFilterPanel';
import SupportQuickFilterBar from '../../admin-support-inbox/components/SupportQuickFilterBar';
import type {
  PlatformDeskConversation,
  PlatformDeskInboxFilters,
  PrimaryFilterCounts,
} from '../types/platformDeskChatTypes';

type Props = {
  conversations: PlatformDeskConversation[];
  loading?: boolean;
  loadError?: string | null;
  selectedId: string;
  filters: PlatformDeskInboxFilters;
  hasActiveFilters: boolean;
  filterCounts: StudentAcademicFilterCounts;
  primaryFilterCounts: PrimaryFilterCounts;
  programOptions: string[];
  classOptions: string[];
  academicLevelOptions: string[];
  search: string;
  searchPlaceholder: string;
  showAcademicFilters?: boolean;
  onSetPrimary: (v: PlatformDeskInboxFilters['primary']) => void;
  onToggleStudentAcademicFilter: (
    key: keyof import('../../chat-filters/studentAcademicChatFilterTypes').StudentAcademicChatFilters,
    value: string,
  ) => void;
  onToggleQuickFilter: (key: 'unread' | 'urgent') => void;
  onClearFilters: () => void;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
};

const PlatformDeskConversationList: FunctionComponent<Props> = ({
  conversations,
  loading = false,
  loadError,
  selectedId,
  filters,
  hasActiveFilters,
  filterCounts,
  primaryFilterCounts,
  programOptions,
  classOptions,
  academicLevelOptions,
  search,
  searchPlaceholder,
  showAcademicFilters = true,
  onSetPrimary,
  onToggleStudentAcademicFilter,
  onToggleQuickFilter,
  onClearFilters,
  onSearchChange,
  onSelect,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { t } = useInternshipInboxCopy();
  const viewingArchived = filters.primary === 'archived';

  const quickFilters = useMemo(
    () => ({ unread: filters.unread, urgent: filters.urgent }),
    [filters.unread, filters.urgent],
  );

  if (loading && conversations.length === 0) {
    return <InternshipChatSidebarSkeleton />;
  }

  return (
    <aside className="isi-sidebar">
      <div className="isi-sidebar-head">
        <div className="isi-sidebar-title-wrap">
          <MessageSquare className="isi-sidebar-title-icon" strokeWidth={2} aria-hidden />
          <h2 className="isi-sidebar-title">Conversations</h2>
        </div>

        <div className="isi-sidebar-actions">
          <button
            type="button"
            onClick={() => onSetPrimary(viewingArchived ? 'all' : 'archived')}
            className={`isi-filter-toggle ${viewingArchived ? 'isi-filter-toggle--active' : ''}`}
            aria-label={viewingArchived ? t('backToActiveConversations') : t('viewArchivedAria')}
            title={viewingArchived ? t('backToActiveConversations') : t('primaryChips.archived')}
          >
            <Archive className="size-4" strokeWidth={2} />
            {!viewingArchived && primaryFilterCounts.archived > 0 ? (
              <span className="isi-sidebar-action-badge">
                {primaryFilterCounts.archived > 99 ? '99+' : primaryFilterCounts.archived}
              </span>
            ) : null}
          </button>

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
        </div>
      </div>

      {loadError ? (
        <p className="isi-load-error px-4 py-2 text-sm text-[var(--admin-danger,#dc2626)]" role="alert">
          {loadError}
        </p>
      ) : null}

      {viewingArchived ? (
        <div className="isi-archived-strip">
          <Archive className="isi-archived-strip-icon" strokeWidth={2} aria-hidden />
          <span className="isi-archived-strip-label">{t('archivedBanner')}</span>
          <button type="button" onClick={() => onSetPrimary('all')} className="isi-archived-strip-back">
            {t('backToActiveConversations')}
          </button>
        </div>
      ) : null}

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

      {filtersOpen ? (
        showAcademicFilters ? (
          <DeskStudentFilterPanel
            quickFilters={quickFilters}
            studentFilters={{
              programs: filters.programs,
              academicLevels: filters.academicLevels,
              classes: filters.classes,
            }}
            hasActiveFilters={hasActiveFilters}
            filterCounts={filterCounts}
            programOptions={programOptions}
            classOptions={classOptions}
            academicLevelOptions={academicLevelOptions}
            onToggleQuick={onToggleQuickFilter}
            onToggleStudentAcademic={onToggleStudentAcademicFilter}
            onClear={onClearFilters}
            showQuickFilters
          />
        ) : (
          <div className="isi-filters-panel">
            <SupportQuickFilterBar
              filters={quickFilters}
              onToggle={onToggleQuickFilter}
              onClear={onClearFilters}
            />
          </div>
        )
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
              <button type="button" onClick={() => onSearchChange('')} className="isi-empty-search-clear-btn">
                Effacer la recherche
              </button>
            </div>
          ) : (
            <InternshipSidebarEmptyState
              title={viewingArchived ? t('noArchivedConversations') : t('noConversations')}
              description={
                viewingArchived ? t('noArchivedConversationsDesc') : t('noConversationsFilterHint')
              }
              variant={viewingArchived ? 'archived' : 'default'}
            />
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
                <InternshipStudentAvatar
                  url={conv.avatarUrl}
                  name={conv.displayName}
                  email={conv.email}
                  initials={conv.initials}
                  size="list"
                />
                <div className="isi-conv-body">
                  <div className="isi-conv-row">
                    <span className="isi-conv-name">{conv.displayName}</span>
                    {conv.timeLabel ? <span className="isi-conv-time">{conv.timeLabel}</span> : null}
                  </div>
                  {showAcademicFilters && conv.program && conv.program !== '—' ? (
                    <p className="isi-conv-offer">{conv.program}</p>
                  ) : null}
                  {!showAcademicFilters && conv.roleLabel ? (
                    <p className="isi-conv-offer">{conv.roleLabel}</p>
                  ) : null}
                  {conv.lastMessage ? <p className="isi-conv-preview">{conv.lastMessage}</p> : null}
                  {conv.workflowStatus ? (
                    <span className="isi-status-text">{conv.workflowStatus}</span>
                  ) : null}
                </div>
                {conv.unreadCount > 0 ? (
                  <span className="isi-unread">
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
};

export default PlatformDeskConversationList;

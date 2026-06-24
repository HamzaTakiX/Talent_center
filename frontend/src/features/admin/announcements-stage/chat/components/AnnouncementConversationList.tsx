import { FunctionComponent, useMemo, useState } from 'react';
import { Archive, Filter, Megaphone, MessageSquare, Search, X } from 'lucide-react';
import { useInternshipInboxCopy } from '../../../offres-stage/hooks/useOffersListLabels';
import InternshipSidebarEmptyState from '../../../offres-stage/chat/components/InternshipSidebarEmptyState';
import { InternshipChatSidebarSkeleton } from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import type { StudentAcademicFilterCounts } from '../../../shared/chat-filters/studentAcademicChatFilterTypes';
import type {
  AnnouncementConversation,
  AnnouncementInboxFilters,
  PrimaryFilterCounts,
} from '../types/announcementChatTypes';
import {
  groupAnnouncementConversationsByStudent,
  type AnnouncementStudentGroup,
} from '../utils/announcementChatDisplayUtils';
import AnnouncementFilterAccordion from './AnnouncementFilterAccordion';

type Props = {
  conversations: AnnouncementConversation[];
  loading?: boolean;
  loadError?: string | null;
  selectedId: string;
  filters: AnnouncementInboxFilters;
  hasActiveFilters: boolean;
  filterCounts: StudentAcademicFilterCounts;
  primaryFilterCounts: PrimaryFilterCounts;
  programOptions: string[];
  classOptions: string[];
  academicLevelOptions: string[];
  search: string;
  onSetPrimary: (v: AnnouncementInboxFilters['primary']) => void;
  onToggleFilter: <K extends 'categories' | 'statuses' | 'priorities'>(
    key: K,
    value: AnnouncementInboxFilters[K][number],
  ) => void;
  onToggleStudentAcademicFilter: (
    key: keyof import('../../../shared/chat-filters/studentAcademicChatFilterTypes').StudentAcademicChatFilters,
    value: string,
  ) => void;
  onToggleQuickFilter: (key: 'unread' | 'urgent') => void;
  onClearFilters: () => void;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
};

type AdminStudentGroupProps = {
  group: AnnouncementStudentGroup;
  selectedId: string;
  onSelect: (id: string) => void;
};

const AnnouncementThreadIcon: FunctionComponent = () => (
  <span className="isi-offer-thread-avatar-slot">
    <span className="isi-offer-avatar isi-offer-avatar--thread" aria-hidden>
      <Megaphone className="size-3 text-[var(--admin-text-muted)]" strokeWidth={2} />
    </span>
  </span>
);

const AdminStudentGroup: FunctionComponent<AdminStudentGroupProps> = ({ group, selectedId, onSelect }) => {
  const isSingle = group.conversations.length === 1;
  const soleConversation = isSingle ? group.conversations[0] : null;
  const hasActive = group.conversations.some((conv) => conv.id === selectedId);
  const singleActive = soleConversation?.id === selectedId;

  if (isSingle && soleConversation) {
    return (
      <button
        type="button"
        onClick={() => onSelect(soleConversation.id)}
        className={`isi-student-group isi-student-group--single ${singleActive ? 'isi-student-group--active' : ''}`}
      >
        <InternshipStudentAvatar
          url={group.studentAvatarUrl}
          name={group.studentName}
          email={group.studentEmail}
          initials={group.studentInitials}
          size="list"
        />
        <div className="isi-student-group-body">
          <div className="isi-student-group-row">
            <span className="isi-student-group-name">{group.studentName}</span>
            {soleConversation.timeLabel ? (
              <span className="isi-conv-time">{soleConversation.timeLabel}</span>
            ) : null}
            {soleConversation.unreadCount > 0 ? (
              <span className="isi-unread">
                {soleConversation.unreadCount > 99 ? '99+' : soleConversation.unreadCount}
              </span>
            ) : null}
          </div>
          {group.program && group.program !== '—' ? (
            <p className="isi-student-group-program">{group.program}</p>
          ) : null}
          {soleConversation.announcementTitle ? (
            <p className="isi-student-group-offer">{soleConversation.announcementTitle}</p>
          ) : null}
          {soleConversation.lastMessage ? (
            <p className="isi-conv-preview">{soleConversation.lastMessage}</p>
          ) : null}
          <span className="isi-status-text">{soleConversation.publishStatus}</span>
        </div>
      </button>
    );
  }

  return (
    <div className={`isi-student-group isi-student-group--multi ${hasActive ? 'isi-student-group--active' : ''}`}>
      <div className="isi-student-group-head">
        <InternshipStudentAvatar
          url={group.studentAvatarUrl}
          name={group.studentName}
          email={group.studentEmail}
          initials={group.studentInitials}
          size="list"
        />
        <div className="isi-student-group-body">
          <div className="isi-student-group-row">
            <span className="isi-student-group-name">{group.studentName}</span>
            {group.totalUnread > 0 ? (
              <span className="isi-unread">{group.totalUnread > 99 ? '99+' : group.totalUnread}</span>
            ) : null}
          </div>
          {group.program && group.program !== '—' ? (
            <p className="isi-student-group-program">{group.program}</p>
          ) : null}
          <p className="isi-student-group-count">
            {group.conversations.length} annonce{group.conversations.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="isi-student-group-offers" role="list">
        {group.conversations.map((conv) => {
          const active = conv.id === selectedId;
          return (
            <button
              key={conv.id}
              type="button"
              role="listitem"
              onClick={() => onSelect(conv.id)}
              className={`isi-offer-thread ${active ? 'isi-offer-thread--active' : ''}`}
            >
              <AnnouncementThreadIcon />
              <span className="isi-offer-thread-content">
                <span className="isi-offer-thread-title">{conv.announcementTitle}</span>
                {conv.unreadCount > 0 ? (
                  <span className="isi-offer-thread-unread">
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AnnouncementConversationList: FunctionComponent<Props> = ({
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
  onSetPrimary,
  onToggleFilter,
  onToggleStudentAcademicFilter,
  onToggleQuickFilter,
  onClearFilters,
  onSearchChange,
  onSelect,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { t } = useInternshipInboxCopy();
  const viewingArchived = filters.primary === 'archived';
  const adminGroups = useMemo(
    () => groupAnnouncementConversationsByStudent(conversations),
    [conversations],
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
          <div className="isi-student-groups">
            {adminGroups.map((group) => (
              <AdminStudentGroup
                key={group.key}
                group={group}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
};

export default AnnouncementConversationList;

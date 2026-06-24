import { FunctionComponent, useMemo, useState } from 'react';

import { Archive, Filter, MessageSquare, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { FilterCounts, InboxFilters, InternshipConversation, PrimaryFilterCounts } from '../types/internshipChatTypes';

import InternshipFilterAccordion from './InternshipFilterAccordion';

import { InternshipChatSidebarSkeleton } from './InternshipChatLoadingSkeletons';

import InternshipOfferAvatar from './InternshipOfferAvatar';

import InternshipStudentAvatar from './InternshipStudentAvatar';

import { groupConversationsByStudent, resolveConversationPreview } from '../utils/internshipChatDisplayUtils';
import { useInternshipInboxCopy } from '../../hooks/useOffersListLabels';
import InternshipSidebarEmptyState from './InternshipSidebarEmptyState';



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

  loadError?: string | null;

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



type AdminStudentGroupProps = {

  group: ReturnType<typeof groupConversationsByStudent>[number];

  selectedId: string;

  onSelect: (id: string) => void;

};



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

            {soleConversation.unreadCount > 0 ? (

              <span className="isi-unread">

                {soleConversation.unreadCount > 99 ? '99+' : soleConversation.unreadCount}

              </span>

            ) : null}

          </div>

          {group.program ? <p className="isi-student-group-program">{group.program}</p> : null}

          {soleConversation.offerTitle ? (
            <div className="isi-student-group-offer-row">
              <InternshipOfferAvatar
                url={soleConversation.companyLogoUrl}
                companyName={soleConversation.company}
                offerTitle={soleConversation.offerTitle}
                size="thread"
              />
              <p className="isi-student-group-offer">{soleConversation.offerTitle}</p>
            </div>
          ) : null}

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

          {group.program ? <p className="isi-student-group-program">{group.program}</p> : null}

          <p className="isi-student-group-count">

            {group.conversations.length} offres

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
              <span className="isi-offer-thread-avatar-slot">
                <InternshipOfferAvatar
                  url={conv.companyLogoUrl}
                  companyName={conv.company}
                  offerTitle={conv.offerTitle}
                  size="thread"
                />
              </span>
              <span className="isi-offer-thread-content">
                <span className="isi-offer-thread-title">{conv.offerTitle}</span>
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

  loadError,

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
  const { t } = useInternshipInboxCopy();
  const { t: tRoot } = useTranslation();
  const previewYouPrefix = isStudent
    ? tRoot('student.internshipOffers.chat.previewYou')
    : undefined;
  const viewingArchived = filters.primary === 'archived';
  const adminGroups = useMemo(

    () => (isStudent ? [] : groupConversationsByStudent(conversations)),

    [conversations, isStudent],

  );



  if (loading && conversations.length === 0) {

    return <InternshipChatSidebarSkeleton />;

  }



  return (

    <aside className="isi-sidebar">

      <div className="isi-sidebar-head">
        <div className="isi-sidebar-title-wrap">
          <MessageSquare className="isi-sidebar-title-icon" strokeWidth={2} aria-hidden />
          <h2 className="isi-sidebar-title">{sidebarTitle}</h2>
        </div>

        <div className="isi-sidebar-actions">
          {!isStudent ? (
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
          ) : null}

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

      {!isStudent && viewingArchived ? (
        <div className="isi-archived-strip">
          <Archive className="isi-archived-strip-icon" strokeWidth={2} aria-hidden />
          <span className="isi-archived-strip-label">{t('archivedBanner')}</span>
          <button
            type="button"
            onClick={() => onSetPrimary('all')}
            className="isi-archived-strip-back"
          >
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
              description={viewingArchived ? t('noArchivedConversationsDesc') : t('noConversationsFilterHint')}
              variant={viewingArchived ? 'archived' : 'default'}
            />
          )

        ) : isStudent ? (

          conversations.map((conv) => {
            const active = conv.id === selectedId;
            const preview = resolveConversationPreview(conv, { youPrefix: previewYouPrefix });
            return (

              <button

                key={conv.id}

                type="button"

                onClick={() => onSelect(conv.id)}

                className={`isi-conv-item isi-conv-item--offer ${active ? 'isi-conv-item--active' : ''}`}

              >

                <InternshipOfferAvatar

                  url={conv.companyLogoUrl}

                  companyName={conv.company}

                  offerTitle={conv.offerTitle}

                  size="list"

                />

                <div className="isi-conv-body">

                  <div className="isi-conv-row">

                    <span className="isi-conv-name">{conv.offerTitle}</span>

                    {conv.timeLabel ? (

                      <span className="isi-conv-time">{conv.timeLabel}</span>

                    ) : null}

                  </div>

                  <p className="isi-conv-company-label">{conv.company}</p>

                  {preview ? (
                    <p className="isi-conv-preview isi-conv-preview--offer">{preview}</p>
                  ) : null}
                </div>

                {conv.unreadCount > 0 ? (

                  <span className="isi-unread">{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</span>

                ) : null}

              </button>

            );

          })

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



export default InternshipConversationList;



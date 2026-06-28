import { FunctionComponent, useState } from 'react';
import { Archive, FileText, Search, X } from 'lucide-react';
import { useInternshipInboxCopy } from '../../../offres-stage/hooks/useOffersListLabels';
import InternshipSidebarEmptyState from '../../../offres-stage/chat/components/InternshipSidebarEmptyState';
import { InternshipChatSidebarSkeleton } from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import ChatSidebarHeader from '../../../../shared/chat-design-system/components/ChatSidebarHeader';
import ChatToolbarActions from '../../../../shared/chat-design-system/components/ChatToolbarActions';
import ChatUnreadBadge from '../../../../shared/chat-design-system/components/ChatUnreadBadge';
import type { StudentAcademicFilterCounts } from '../../../shared/chat-filters/studentAcademicChatFilterTypes';
import DocumentServiceChatIcon from '../../components/service-catalog/DocumentServiceChatIcon';
import type {
  DocumentConversation,
  DocumentInboxFilters,
  PrimaryFilterCounts,
} from '../types/documentChatTypes';
import DocumentFilterAccordion from './DocumentFilterAccordion';

type Props = {
  conversations: DocumentConversation[];
  loading?: boolean;
  loadError?: string | null;
  selectedId: string;
  filters: DocumentInboxFilters;
  primaryFilterCounts: PrimaryFilterCounts;
  hasActiveFilters: boolean;
  filterCounts: StudentAcademicFilterCounts;
  programOptions: string[];
  classOptions: string[];
  academicLevelOptions: string[];
  search: string;
  onSetPrimary: (value: DocumentInboxFilters['primary']) => void;
  onToggleFilter: <K extends 'categories' | 'statuses' | 'priorities'>(
    key: K,
    value: DocumentInboxFilters[K][number],
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

const DocumentConversationList: FunctionComponent<Props> = ({
  conversations,
  loading = false,
  loadError,
  selectedId,
  filters,
  primaryFilterCounts,
  hasActiveFilters,
  filterCounts,
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

  if (loading && conversations.length === 0) {
    return <InternshipChatSidebarSkeleton />;
  }

  return (
    <aside className="isi-sidebar">
      <ChatSidebarHeader
        title="Conversations documents"
        subtitle="Questions étudiants sur le catalogue"
        icon={FileText}
        actions={
          <ChatToolbarActions
            viewingArchived={viewingArchived}
            archivedCount={primaryFilterCounts.archived}
            hasActiveFilters={hasActiveFilters}
            filtersOpen={filtersOpen}
            onToggleArchive={() => onSetPrimary(viewingArchived ? 'all' : 'archived')}
            onToggleFilters={() => setFiltersOpen((v) => !v)}
          />
        }
      />

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
            placeholder="Rechercher un document ou un étudiant…"
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
        <DocumentFilterAccordion
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
            <InternshipSidebarEmptyState
              title={viewingArchived ? 'Aucune conversation archivée' : 'Aucune conversation'}
              description={
                viewingArchived
                  ? 'Les conversations archivées apparaîtront ici.'
                  : 'Les questions des étudiants sur les documents apparaîtront ici.'
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
                className={`isi-conv-item isi-conv-item--offer ${active ? 'isi-conv-item--active' : ''}`}
              >
                <DocumentServiceChatIcon
                  iconKey={conv.iconKey}
                  colorTheme={conv.colorTheme}
                  size="list"
                />
                <div className="isi-conv-body">
                  <div className="isi-conv-row">
                    <span className="isi-conv-name">{conv.documentTitle}</span>
                    {conv.timeLabel ? <span className="isi-conv-time">{conv.timeLabel}</span> : null}
                  </div>
                  <div className="isi-conv-row isi-conv-row--student">
                    <InternshipStudentAvatar
                      url={conv.studentAvatarUrl}
                      name={conv.studentName}
                      email={conv.studentEmail}
                      initials={conv.studentInitials}
                      size="list"
                    />
                    <span className="isi-conv-student-name">{conv.studentName}</span>
                  </div>
                  {conv.lastMessage ? <p className="isi-conv-preview isi-conv-preview--offer">{conv.lastMessage}</p> : null}
                </div>
                <ChatUnreadBadge count={conv.unreadCount} />
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
};

export default DocumentConversationList;

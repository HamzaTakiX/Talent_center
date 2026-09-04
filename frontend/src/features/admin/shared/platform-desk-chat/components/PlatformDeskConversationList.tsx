import { FunctionComponent, useMemo, useState } from 'react';
import { Archive, MessageSquare, Search, Shield, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInternshipInboxCopy } from '../../../offres-stage/hooks/useOffersListLabels';
import InternshipSidebarEmptyState from '../../../offres-stage/chat/components/InternshipSidebarEmptyState';
import { InternshipChatSidebarSkeleton } from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import SupportInboxSidebarBrandHeader from '../../admin-support-inbox/components/SupportInboxSidebarBrandHeader';
import ChatToolbarActions from '../../../../shared/chat-design-system/components/ChatToolbarActions';
import type { StudentAcademicFilterCounts } from '../../chat-filters/studentAcademicChatFilterTypes';
import DeskStudentFilterPanel from '../../chat-filters/DeskStudentFilterPanel';
import SupportQuickFilterBar from '../../admin-support-inbox/components/SupportQuickFilterBar';
import type {
  PlatformDeskConversation,
  PlatformDeskInboxFilters,
  PlatformDeskViewerRole,
  PrimaryFilterCounts,
} from '../types/platformDeskChatTypes';
import PlatformDeskSupportStatusBadge from './PlatformDeskSupportStatusBadge';
import { visibleSupportStatus } from '../utils/platformDeskSupportStatus';
import { resolveStudentPlatformDeskRoleLabel } from '../../../../student/support/chat/utils/platformDeskStudentLabels';

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
  sidebarTitle?: string;
  sidebarSubtitle?: string;
  sidebarIcon?: LucideIcon;
  showAcademicFilters?: boolean;
  viewerRole?: PlatformDeskViewerRole;
  showArchive?: boolean;
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
  sidebarTitle = 'Conversations',
  sidebarSubtitle,
  sidebarIcon: SidebarIcon = MessageSquare,
  showAcademicFilters = true,
  viewerRole = 'admin',
  showArchive = true,
  onSetPrimary,
  onToggleStudentAcademicFilter,
  onToggleQuickFilter,
  onClearFilters,
  onSearchChange,
  onSelect,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { t } = useInternshipInboxCopy();
  const { t: tStudent } = useTranslation();
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
      <SupportInboxSidebarBrandHeader
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        icon={SidebarIcon}
        actions={
          <ChatToolbarActions
            viewingArchived={viewingArchived}
            archivedCount={primaryFilterCounts.archived}
            hasActiveFilters={hasActiveFilters}
            filtersOpen={filtersOpen}
            showArchive={showArchive}
            onToggleArchive={
              showArchive ? () => onSetPrimary(viewingArchived ? 'all' : 'archived') : undefined
            }
            onToggleFilters={() => setFiltersOpen((v) => !v)}
          />
        }
      />

      {loadError ? (
        <p className="isi-load-error px-4 py-2 text-sm text-[var(--admin-danger,#dc2626)]" role="alert">
          {loadError}
        </p>
      ) : null}

      {showArchive && viewingArchived ? (
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
            const supportStatus = visibleSupportStatus(conv, viewerRole);
            const roleLabel =
              viewerRole === 'student'
                ? resolveStudentPlatformDeskRoleLabel(conv.roleLabel, tStudent)
                : conv.roleLabel;
            const useAdminDeskStyle = viewerRole === 'student' && !showAcademicFilters;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv.id)}
                className={[
                  'isi-conv-item',
                  useAdminDeskStyle ? 'isi-conv-item--admin-desk' : '',
                  active ? 'isi-conv-item--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <InternshipStudentAvatar
                  url={conv.avatarUrl}
                  name={conv.displayName}
                  email={conv.email}
                  initials={conv.initials}
                  size="list"
                />
                <div className="isi-conv-body">
                  {useAdminDeskStyle ? (
                    <>
                      <div className="isi-conv-row">
                        <span className="isi-conv-name">{conv.displayName}</span>
                        {conv.timeLabel ? <span className="isi-conv-time">{conv.timeLabel}</span> : null}
                      </div>
                      <div className="isi-conv-meta">
                        {roleLabel ? (
                          <span className="isi-conv-role-chip">
                            <Shield className="isi-conv-role-chip__icon" strokeWidth={2.25} aria-hidden />
                            {roleLabel}
                          </span>
                        ) : null}
                        {supportStatus ? (
                          <PlatformDeskSupportStatusBadge
                            status={supportStatus}
                            viewerRole={viewerRole}
                            inline
                          />
                        ) : null}
                      </div>
                      {conv.lastMessage ? <p className="isi-conv-preview">{conv.lastMessage}</p> : null}
                    </>
                  ) : (
                    <>
                      <div className="isi-conv-row">
                        <div className="isi-conv-name-row">
                          <span className="isi-conv-name">{conv.displayName}</span>
                          {supportStatus ? (
                            <PlatformDeskSupportStatusBadge
                              status={supportStatus}
                              viewerRole={viewerRole}
                              inline
                            />
                          ) : null}
                        </div>
                        {conv.timeLabel ? <span className="isi-conv-time">{conv.timeLabel}</span> : null}
                      </div>
                      {showAcademicFilters && conv.program && conv.program !== '—' ? (
                        <p className="isi-conv-offer">{conv.program}</p>
                      ) : null}
                      {!showAcademicFilters && roleLabel ? (
                        <p className="isi-conv-offer isi-conv-offer--admin-role">{roleLabel}</p>
                      ) : null}
                      {conv.lastMessage ? <p className="isi-conv-preview">{conv.lastMessage}</p> : null}
                    </>
                  )}
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

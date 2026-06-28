import { FunctionComponent } from 'react';
import { Archive, Filter } from 'lucide-react';
import { useInternshipInboxCopy } from '../../../admin/offres-stage/hooks/useOffersListLabels';

export type ChatToolbarActionsProps = {
  viewingArchived?: boolean;
  archivedCount?: number;
  hasActiveFilters?: boolean;
  filtersOpen?: boolean;
  showArchive?: boolean;
  showFilter?: boolean;
  onToggleArchive?: () => void;
  onToggleFilters?: () => void;
  archiveAriaLabel?: string;
  archiveTitle?: string;
  filterAriaLabel?: string;
};

const ChatToolbarActions: FunctionComponent<ChatToolbarActionsProps> = ({
  viewingArchived = false,
  archivedCount = 0,
  hasActiveFilters = false,
  filtersOpen = false,
  showArchive = true,
  showFilter = true,
  onToggleArchive,
  onToggleFilters,
  archiveAriaLabel,
  archiveTitle,
  filterAriaLabel,
}) => {
  const { t } = useInternshipInboxCopy();
  const resolvedArchiveAria =
    archiveAriaLabel ??
    (viewingArchived ? t('backToActiveConversations') : t('viewArchivedAria'));
  const resolvedArchiveTitle =
    archiveTitle ??
    (viewingArchived ? t('backToActiveConversations') : t('primaryChips.archived'));
  const resolvedFilterAria = filterAriaLabel ?? t('filters');

  return (
    <>
      {showArchive && onToggleArchive ? (
        <button
          type="button"
          onClick={onToggleArchive}
          className={`isi-filter-toggle ${viewingArchived ? 'isi-filter-toggle--active' : ''}`}
          aria-label={resolvedArchiveAria}
          title={resolvedArchiveTitle}
        >
          <Archive className="size-4" strokeWidth={2} />
          {!viewingArchived && archivedCount > 0 ? (
            <span className="isi-sidebar-action-badge">
              {archivedCount > 99 ? '99+' : archivedCount}
            </span>
          ) : null}
        </button>
      ) : null}

      {showFilter && onToggleFilters ? (
        <button
          type="button"
          onClick={onToggleFilters}
          className={`isi-filter-toggle ${filtersOpen || hasActiveFilters ? 'isi-filter-toggle--active' : ''}`}
          aria-expanded={filtersOpen}
          aria-label={resolvedFilterAria}
        >
          <Filter className="size-4" strokeWidth={2} />
          {hasActiveFilters ? <span className="isi-filter-dot" /> : null}
        </button>
      ) : null}
    </>
  );
};

export default ChatToolbarActions;

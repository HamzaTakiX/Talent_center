import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LayoutList, Plus, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AdminDeleteConfirmModal from '../../ui/AdminDeleteConfirmModal';
import AdminSearchInput from '../../ui/AdminSearchInput';
import AdminToolbarDeleteControl from '../../ui/AdminToolbarDeleteControl';
import AdminTagMultiSelect from '../../shared/forms/AdminTagMultiSelect';
import { AdminSectionSkeletonShell } from '../../ui/AdminSectionSkeleton';
import AdminPagination from '../../ui/AdminPagination';
import { fadeInUp } from '../../dashboard/ui/animations';
import {
  ANNOUNCEMENT_PRIORITY_OPTS,
  ANNOUNCEMENT_STATUS_OPTS,
  type AnnListFilters,
  hasActiveAnnFilters,
} from '../constants/announcementListFilters';
import { useAnnouncementBulkDelete } from '../hooks/useAnnouncementBulkDelete';
import { useAnnouncementTypes } from '../hooks/useAnnouncements';
import type { AnnouncementListItem } from '../types/announcement';
import AnnouncementCard from './AnnouncementCard';
import AnnouncementsPremiumEmpty from './AnnouncementsPremiumEmpty';

interface Props {
  items: AnnouncementListItem[];
  filters: AnnListFilters;
  onFiltersChange: (next: AnnListFilters) => void;
  loading?: boolean;
  total?: number;
  page?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onDeleted?: () => void | Promise<void>;
}

const AnnouncementsFeedSection: FunctionComponent<Props> = ({
  items,
  filters,
  onFiltersChange,
  loading,
  total = 0,
  page = 1,
  totalPages = 1,
  pageSize = 8,
  onPageChange = () => undefined,
  onDeleted,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeTypes, typesByCode, loading: typesLoading } = useAnnouncementTypes();

  const statusOptions = useMemo(
    () =>
      ANNOUNCEMENT_STATUS_OPTS.map((s) => ({
        value: s,
        label: t(`admin.announcementsModule.status.${s}`, { defaultValue: s }),
      })),
    [t],
  );

  const priorityOptions = useMemo(
    () =>
      ANNOUNCEMENT_PRIORITY_OPTS.map((p) => ({
        value: p,
        label: t(`admin.announcementsModule.form.priorities.${p}`, { defaultValue: p }),
      })),
    [t],
  );

  const typeOptions = useMemo(
    () =>
      activeTypes.map((item) => ({
        value: item.code,
        label: item.nameLocalized || item.name,
      })),
    [activeTypes],
  );

  const hasFilters = hasActiveAnnFilters(filters);
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const {
    selectionMode,
    selection,
    deleteOpen,
    deleteTitle,
    deleteDescription,
    enterSelectionMode,
    exitSelectionMode,
    confirmDelete,
    closeDeleteDialog,
    runDelete,
  } = useAnnouncementBulkDelete(itemIds, async () => {
    await onDeleted?.();
  });

  const patchFilters = (patch: Partial<AnnListFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  const clearFilters = () => onFiltersChange({});

  return (
    <motion.section {...fadeInUp} className="admin-ann-feed" aria-labelledby="ann-feed-title">
      <AdminDeleteConfirmModal
        open={deleteOpen}
        onClose={closeDeleteDialog}
        onConfirm={runDelete}
        title={deleteTitle}
        description={deleteDescription}
      />

      <div className="admin-ann-feed__hero">
        <div className="admin-ann-feed__hero-top">
          <div className="admin-ann-feed__title-block">
            <span className="admin-ann-feed__icon-wrap" aria-hidden>
              <LayoutList className="h-[1.125rem] w-[1.125rem] text-[var(--admin-brand)]" />
            </span>
            <div className="admin-ann-feed__titles">
              <div className="admin-ann-feed__title-row">
                <h3 id="ann-feed-title" className="admin-ann-feed__title">
                  {t('admin.announcementsModule.feed.title')}
                </h3>
                <span className="admin-ann-feed__count">{total}</span>
              </div>
              <p className="admin-ann-feed__subtitle">
                {t('admin.announcementsModule.feed.subtitle')}
              </p>
            </div>
          </div>

          <div className="admin-ann-feed__hero-actions">
            <AdminToolbarDeleteControl
              selectionMode={selectionMode}
              selectedCount={selection.selectedCount}
              onEnterSelectionMode={enterSelectionMode}
              onExitSelectionMode={exitSelectionMode}
              onConfirmDelete={confirmDelete}
            />
            {hasFilters ? (
              <button type="button" className="admin-ann-feed__clear" onClick={clearFilters}>
                <X className="h-3.5 w-3.5" aria-hidden />
                {t('admin.announcementsModule.filters.clear')}
              </button>
            ) : null}
            <button
              type="button"
              className="admin-btn-primary admin-ann-feed__create inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
              onClick={() => navigate('/admin/announcements/create')}
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t('admin.announcementsModule.empty.cta')}
            </button>
          </div>
        </div>

        <div className="admin-ann-feed__toolbar">
          <AdminSearchInput
            value={filters.search ?? ''}
            onChange={(e) => patchFilters({ search: e.target.value })}
            onClear={() => patchFilters({ search: '' })}
            placeholder={t('admin.search.announcements')}
            aria-label={t('admin.search.announcements')}
          />
        </div>

        <div className="admin-ann-feed__filters-zone">
          <div className="admin-ann-feed__filters-head">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--admin-brand)]" aria-hidden />
            <span>{t('admin.announcementsModule.feed.filtersLabel')}</span>
          </div>

          <div className="admin-ann-feed__filters">
          <AdminTagMultiSelect
            id="ann-feed-statuses"
            label={t('admin.announcementsModule.filters.status')}
            values={filters.statuses ?? []}
            options={statusOptions}
            onChange={(statuses) => patchFilters({ statuses: statuses.length ? statuses : undefined })}
            searchable
            placeholder={t('admin.announcementsModule.filters.allStatuses')}
          />
          <AdminTagMultiSelect
            id="ann-feed-priorities"
            label={t('admin.announcementsModule.filters.priority')}
            values={filters.priorities ?? []}
            options={priorityOptions}
            onChange={(priorities) =>
              patchFilters({ priorities: priorities.length ? priorities : undefined })
            }
            searchable
            placeholder={t('admin.announcementsModule.filters.allPriorities')}
          />
          <AdminTagMultiSelect
            id="ann-feed-types"
            label={t('admin.announcementsModule.filters.type')}
            values={filters.types ?? []}
            options={typeOptions}
            onChange={(nextTypes) =>
              patchFilters({ types: nextTypes.length ? nextTypes : undefined })
            }
            loading={typesLoading}
            searchable
            placeholder={t('admin.announcementsModule.filters.allTypes')}
          />
          </div>
        </div>
      </div>

      {selectionMode && items.length > 0 ? (
        <div className="admin-ann-feed__selection-bar">
          <label className="admin-ann-feed__select-all">
            <input
              type="checkbox"
              className="admin-ann-card__checkbox"
              checked={selection.allOnPageSelected}
              ref={(el) => {
                if (el) el.indeterminate = selection.someOnPageSelected;
              }}
              onChange={selection.toggleAllOnPage}
              aria-label={t('admin.announcementsModule.actions.selectAllPage', {
                defaultValue: 'Tout sélectionner sur cette page',
              })}
            />
            <span>{t('admin.announcementsModule.actions.selectAllPage')}</span>
          </label>
          <span className="admin-ann-feed__selection-count">
            {t('admin.announcementsModule.actions.selectedCount', {
              count: selection.selectedCount,
              defaultValue: '{{count}} sélectionnée(s)',
            })}
          </span>
        </div>
      ) : null}

      {loading ? (
        <AdminSectionSkeletonShell className="admin-ann-card-grid">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="admin-shimmer admin-ann-skeleton-card" aria-hidden />
          ))}
        </AdminSectionSkeletonShell>
      ) : items.length === 0 ? (
        <AnnouncementsPremiumEmpty
          variant={hasFilters ? 'search' : 'list'}
          onAction={() => navigate('/admin/announcements/create')}
        />
      ) : (
        <div className="admin-ann-card-grid">
          {items.map((item, index) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              typeMeta={typesByCode.get(item.typeCode) ?? null}
              index={index}
              onClick={() => navigate(`/admin/announcements/${item.id}`)}
              onDeleted={onDeleted}
              selectionMode={selectionMode}
              selected={selection.isSelected(item.id)}
              onToggleSelect={() => selection.toggleRow(item.id)}
            />
          ))}
        </div>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
        itemLabel={t('admin.announcementsModule.feed.paginationLabel', {
          defaultValue: 'publications',
        })}
      />
    </motion.section>
  );
};

export default AnnouncementsFeedSection;

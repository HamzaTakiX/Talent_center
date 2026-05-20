import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SmartAssignmentEncadrantCard } from '../../../api/types';
import { useAdminSearchPlaceholder } from '../../../i18n/useAdminCopy';
import AdminSearchInput from '../../../ui/AdminSearchInput';
import AdminSelectField from '../../../ui/AdminSelectField';
import AdminPagination from '../../../ui/AdminPagination';
import {
  encadrantFilterOptions,
  filterEncadrantCards,
  sortEncadrantsByWorkload,
  type EncadrantCardsFilter,
} from './encadrantFilterUtils';
import AdminSectionEmptyState from '../../../ui/AdminSectionEmptyState';
import { SmartAssignmentWorkloadSkeleton } from './SmartAssignmentSectionSkeleton';

const WORKLOAD_PER_PAGE = 10;

interface SmartAssignmentWorkloadChartProps {
  encadrants: SmartAssignmentEncadrantCard[];
  excludedIds: Set<number>;
  loading?: boolean;
}

const SmartAssignmentWorkloadChart: FunctionComponent<SmartAssignmentWorkloadChartProps> = ({
  encadrants,
  excludedIds,
  loading = false,
}) => {
  const { t } = useTranslation();
  const searchPh = useAdminSearchPlaceholder('encadrants');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EncadrantCardsFilter>('all');
  const [page, setPage] = useState(1);

  const filterOptions = useMemo(() => encadrantFilterOptions(t), [t]);

  const filteredEncadrants = useMemo(
    () =>
      sortEncadrantsByWorkload(
        filterEncadrantCards(encadrants, { query, statusFilter, excludedIds, t })
      ),
    [encadrants, query, statusFilter, excludedIds, t]
  );

  const totalPages = Math.max(1, Math.ceil(filteredEncadrants.length / WORKLOAD_PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, encadrants.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * WORKLOAD_PER_PAGE;
    return filteredEncadrants.slice(start, start + WORKLOAD_PER_PAGE);
  }, [filteredEncadrants, page]);

  return (
    <section
      className={`admin-module-panel sa-section-panel admin-section-panel rounded-xl p-5 shadow-sm${loading ? ' sa-section-panel--loading admin-section-panel--loading' : ''}`}
      aria-busy={loading}
    >
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--admin-text)]">
            {t('admin.smartAssignment.charts.workloadTitle')}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--admin-text-muted)]">
            {t('admin.smartAssignment.charts.workloadSubtitle')} ·{' '}
            {t('admin.smartAssignment.charts.workloadCount', {
              count: filteredEncadrants.length,
              total: encadrants.length,
            })}
          </p>
        </div>

        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
          role="toolbar"
          aria-label={t('admin.smartAssignment.charts.workloadFiltersAria')}
        >
          <AdminSearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder={searchPh}
            containerClassName="min-w-0 flex-1 sm:max-w-md"
          />
          <AdminSelectField
            value={statusFilter}
            options={filterOptions}
            onChange={(v) => setStatusFilter(v as EncadrantCardsFilter)}
            aria-label={t('admin.smartAssignment.encadrants.filterAria')}
            wrapperClassName="w-full sm:w-[220px]"
          />
        </div>
      </div>

      <div
        className="sa-section-panel__content mt-4 space-y-3"
        role="img"
        aria-label={t('admin.smartAssignment.charts.workloadAria')}
      >
        {loading && encadrants.length === 0 ? (
          <SmartAssignmentWorkloadSkeleton rows={WORKLOAD_PER_PAGE} />
        ) : pageItems.length === 0 ? (
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="chart"
            title={t('admin.smartAssignment.encadrants.emptyFilters')}
            description={t('admin.empty.tryAdjusting')}
          />
        ) : (
          pageItems.map((enc) => {
            const pct = enc.max_capacity
              ? Math.min(100, (enc.current_load / enc.max_capacity) * 100)
              : enc.current_load * 10;
            const color = enc.is_overloaded
              ? '#ef4444'
              : pct > 85
                ? '#f59e0b'
                : 'var(--admin-brand)';

            return (
              <div key={enc.encadrant_profile_id}>
                <div className="mb-1 flex justify-between gap-2 text-xs">
                  <span className="truncate font-medium text-[var(--admin-text)]">
                    {enc.full_name}
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--admin-text-muted)]">
                    {enc.current_load}/{enc.max_capacity || '∞'}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--admin-border)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, pct)}%`, background: color }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading ? (
        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={filteredEncadrants.length}
          pageSize={WORKLOAD_PER_PAGE}
          onPageChange={setPage}
          itemLabel={t('admin.smartAssignment.charts.workloadPaginationLabel')}
        />
      ) : null}
    </section>
  );
};

export default SmartAssignmentWorkloadChart;

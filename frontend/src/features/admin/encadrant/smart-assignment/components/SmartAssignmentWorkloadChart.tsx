import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import type { SmartAssignmentEncadrantCard } from '../../../api/types';
import { useAdminSearchPlaceholder } from '../../../i18n/useAdminCopy';
import { getAdminUserInitials } from '../../../dashboard/utils/adminUserDisplay';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import { resolveMediaUrl } from '../../../../../shared/api/mediaUrl';
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
import SmartAssignmentSectionHeader from './SmartAssignmentSectionHeader';
import { SmartAssignmentWorkloadSkeleton } from './SmartAssignmentSectionSkeleton';
import { getEncadrantLoadBarColor } from '../utils/workloadBarUtils';
import '../styles/admin-smart-assignment-manual-assign.css';

const WORKLOAD_PER_PAGE = 10;

interface SmartAssignmentWorkloadChartProps {
  encadrants: SmartAssignmentEncadrantCard[];
  excludedIds: Set<number>;
  loading?: boolean;
  onSelectEncadrant?: (encadrant: SmartAssignmentEncadrantCard) => void;
}

const SmartAssignmentWorkloadChart: FunctionComponent<SmartAssignmentWorkloadChartProps> = ({
  encadrants,
  excludedIds,
  loading = false,
  onSelectEncadrant,
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

  const hasSourceData = encadrants.length > 0;
  const showFilters = hasSourceData;

  return (
    <section
      className={`admin-module-panel sa-section-panel admin-section-panel rounded-xl p-5 shadow-sm${loading ? ' sa-section-panel--loading admin-section-panel--loading' : ''}`}
      aria-busy={loading}
    >
      <div className="flex flex-col gap-4">
        <SmartAssignmentSectionHeader
          icon={BarChart3}
          title={t('admin.smartAssignment.charts.workloadTitle')}
          subtitle={`${t('admin.smartAssignment.charts.workloadSubtitle')} · ${t(
            'admin.smartAssignment.charts.workloadCount',
            {
              count: filteredEncadrants.length,
              total: encadrants.length,
            },
          )}`}
        />

        {showFilters ? (
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
        ) : null}
      </div>

      <div
        className="sa-section-panel__content mt-4"
        role="img"
        aria-label={t('admin.smartAssignment.charts.workloadAria')}
      >
        {loading && encadrants.length === 0 ? (
          <SmartAssignmentWorkloadSkeleton rows={WORKLOAD_PER_PAGE} />
        ) : pageItems.length === 0 ? (
          <AdminSectionEmptyState
            variant="inline"
            iconPreset={hasSourceData ? 'search' : 'chart'}
            title={
              hasSourceData
                ? t('admin.smartAssignment.encadrants.emptyFilters')
                : t('admin.smartAssignment.encadrants.emptyNone')
            }
            description={
              hasSourceData
                ? t('admin.empty.tryAdjusting')
                : t('admin.smartAssignment.encadrants.emptyNoneHint')
            }
          />
        ) : (
          pageItems.map((enc) => {
            const pct = enc.max_capacity
              ? Math.min(100, (enc.current_load / enc.max_capacity) * 100)
              : enc.current_load * 10;
            const color = getEncadrantLoadBarColor({
              loadPct: pct,
              isOverloaded: enc.is_overloaded,
              currentLoad: enc.current_load,
              maxCapacity: enc.max_capacity,
            });

            const rowClassName = `sa-workload-row${onSelectEncadrant ? ' sa-workload-row--interactive' : ''}`;

            if (onSelectEncadrant) {
              return (
                <button
                  key={enc.encadrant_profile_id}
                  type="button"
                  className={`${rowClassName} w-full text-start`}
                  onClick={() => onSelectEncadrant(enc)}
                  aria-label={t('admin.smartAssignment.manualAssign.openFor', { name: enc.full_name })}
                >
                  <div className="sa-workload-row__meta">
                    <div className="sa-workload-row__identity">
                      <InternshipStudentAvatar
                        url={resolveMediaUrl(enc.avatar_url)}
                        name={enc.full_name}
                        email={enc.email}
                        initials={getAdminUserInitials(enc.full_name, enc.email)}
                        size="list"
                      />
                      <span className="sa-workload-row__name">{enc.full_name}</span>
                    </div>
                    <span className="sa-workload-row__count">
                      {enc.current_load}/{enc.max_capacity || '∞'}
                    </span>
                  </div>
                  <div className="sa-workload-row__track">
                    <div
                      className="sa-workload-row__fill"
                      style={{ width: `${Math.min(100, pct)}%`, background: color }}
                    />
                  </div>
                </button>
              );
            }

            return (
              <div key={enc.encadrant_profile_id} className={rowClassName}>
                <div className="sa-workload-row__meta">
                  <div className="sa-workload-row__identity">
                    <InternshipStudentAvatar
                      url={resolveMediaUrl(enc.avatar_url)}
                      name={enc.full_name}
                      email={enc.email}
                      initials={getAdminUserInitials(enc.full_name, enc.email)}
                      size="list"
                    />
                    <span className="sa-workload-row__name">{enc.full_name}</span>
                  </div>
                  <span className="sa-workload-row__count">
                    {enc.current_load}/{enc.max_capacity || '∞'}
                  </span>
                </div>
                <div className="sa-workload-row__track">
                  <div
                    className="sa-workload-row__fill"
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

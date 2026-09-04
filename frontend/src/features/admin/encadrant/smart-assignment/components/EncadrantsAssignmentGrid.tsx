import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import type { SmartAssignmentEncadrantCard } from '../../../api/types';
import { useAdminSearchPlaceholder } from '../../../i18n/useAdminCopy';
import AdminSearchInput from '../../../ui/AdminSearchInput';
import AdminSelectField from '../../../ui/AdminSelectField';
import AdminPagination from '../../../ui/AdminPagination';
import EncadrantAssignmentCard from './EncadrantAssignmentCard';
import AdminSectionEmptyState from '../../../ui/AdminSectionEmptyState';
import SmartAssignmentSectionHeader from './SmartAssignmentSectionHeader';
import { SmartAssignmentEncadrantsGridSkeleton } from './SmartAssignmentSectionSkeleton';
import {
  encadrantFilterOptions,
  filterEncadrantCards,
  type EncadrantCardsFilter,
} from './encadrantFilterUtils';

const CARDS_PER_PAGE = 6;

interface EncadrantsAssignmentGridProps {
  encadrants: SmartAssignmentEncadrantCard[];
  excludedIds: Set<number>;
  loading?: boolean;
  onToggleExclude: (encadrantProfileId: number) => void;
  onToggleLock?: (assignmentId: number, locked: boolean) => void;
}

const EncadrantsAssignmentGrid: FunctionComponent<EncadrantsAssignmentGridProps> = ({
  encadrants,
  excludedIds,
  loading = false,
  onToggleExclude,
  onToggleLock,
}) => {
  const { t } = useTranslation();
  const searchPh = useAdminSearchPlaceholder('encadrants');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EncadrantCardsFilter>('all');
  const [page, setPage] = useState(1);

  const filterOptions = useMemo(() => encadrantFilterOptions(t), [t]);

  const filteredEncadrants = useMemo(
    () => filterEncadrantCards(encadrants, { query, statusFilter, excludedIds, t }),
    [encadrants, query, statusFilter, excludedIds, t]
  );

  const totalPages = Math.max(1, Math.ceil(filteredEncadrants.length / CARDS_PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, encadrants.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * CARDS_PER_PAGE;
    return filteredEncadrants.slice(start, start + CARDS_PER_PAGE);
  }, [filteredEncadrants, page]);

  const hasSourceData = encadrants.length > 0;
  const showFilters = hasSourceData;

  return (
    <section
      className={`admin-module-panel sa-section-panel admin-section-panel rounded-xl shadow-sm${loading ? ' sa-section-panel--loading admin-section-panel--loading' : ''}`}
      aria-busy={loading}
    >
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <SmartAssignmentSectionHeader
          icon={Users}
          title={t('admin.smartAssignment.encadrants.sectionTitle')}
          subtitle={t('admin.smartAssignment.encadrants.sectionSubtitle', {
            count: filteredEncadrants.length,
            total: encadrants.length,
          })}
        />
        {showFilters ? (
          <div
            className="flex flex-col gap-3 lg:flex-row lg:items-center"
            role="toolbar"
            aria-label={t('admin.smartAssignment.encadrants.filtersAria')}
          >
            <AdminSearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
              placeholder={searchPh}
              containerClassName="min-w-0 flex-1 lg:max-w-md"
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

      <div className="sa-section-panel__content border-t border-[var(--admin-border)] px-4 py-5 sm:px-6">
        {loading && encadrants.length === 0 ? (
          <SmartAssignmentEncadrantsGridSkeleton count={CARDS_PER_PAGE} />
        ) : pageItems.length === 0 ? (
          <AdminSectionEmptyState
            variant="inline"
            iconPreset={hasSourceData ? 'search' : 'users'}
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
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {pageItems.map((enc) => (
              <EncadrantAssignmentCard
                key={enc.encadrant_profile_id}
                encadrant={enc}
                excluded={excludedIds.has(enc.encadrant_profile_id)}
                onToggleExclude={onToggleExclude}
                onToggleLock={onToggleLock}
              />
            ))}
          </div>
        )}

        {!loading ? (
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredEncadrants.length}
            pageSize={CARDS_PER_PAGE}
            onPageChange={setPage}
            itemLabel={t('admin.smartAssignment.encadrants.paginationLabel')}
          />
        ) : null}
      </div>
    </section>
  );
};

export default EncadrantsAssignmentGrid;

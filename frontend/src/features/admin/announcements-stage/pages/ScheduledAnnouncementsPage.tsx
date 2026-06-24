import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Clock, CalendarDays, Timer, SlidersHorizontal, X } from 'lucide-react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminModulePageSkeleton from '../../ui/AdminModulePageSkeleton';
import AdminBackButton from '../../ui/AdminBackButton';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminKpiStatCard from '../../ui/AdminKpiStatCard';
import AdminSearchInput from '../../ui/AdminSearchInput';
import AdminPagination from '../../ui/AdminPagination';
import AdminSelect from '../../account/components/AdminSelect';
import { AdminSectionSkeletonShell } from '../../ui/AdminSectionSkeleton';
import ScheduledAnnouncementsTable from '../components/ScheduledAnnouncementsTable';
import {
  hasActiveScheduledFilters,
  scheduledFiltersToListParams,
  type ScheduledListFilters,
} from '../constants/scheduledListFilters';
import { useAnnouncementsList, useScheduledAnnouncementsDashboard } from '../hooks/useAnnouncements';
import { formatListDate, formatListTime } from '../utils/scheduleUtils';
import '../styles/admin-announcements.css';

const PAGE_SIZE = 12;

const ScheduledAnnouncementsPage: FunctionComponent = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const backLabel = useAdminBackLabel('announcements');
  const locale = i18n.language?.startsWith('ar') ? 'ar-MA' : i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR';
  const [filters, setFilters] = useState<ScheduledListFilters>({ statuses: ['SCHEDULED'] });
  const [page, setPage] = useState(1);
  const { data: scheduledDash, loading: dashLoading, refresh: refreshDash } = useScheduledAnnouncementsDashboard();

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const listParams = useMemo(
    () => ({
      page,
      page_size: PAGE_SIZE,
      ...scheduledFiltersToListParams(filters),
    }),
    [filters, page],
  );

  const {
    items,
    total,
    page: currentPage,
    total_pages,
    loading: listLoading,
    refresh: refreshList,
  } = useAnnouncementsList(listParams);

  const refreshAll = async () => {
    await Promise.all([refreshList(), refreshDash()]);
  };

  const statusOptions = [
    { value: 'SCHEDULED', label: t('admin.announcementsModule.status.SCHEDULED') },
    { value: 'PUBLISHED', label: t('admin.announcementsModule.status.PUBLISHED') },
    { value: 'DRAFT', label: t('admin.announcementsModule.status.DRAFT') },
  ];

  const dateRangeOptions = [
    { value: 'all', label: t('admin.announcementsModule.scheduled.dateRange.all') },
    { value: 'today', label: t('admin.announcementsModule.scheduled.dateRange.today') },
    { value: 'week', label: t('admin.announcementsModule.scheduled.dateRange.week') },
    { value: 'month', label: t('admin.announcementsModule.scheduled.dateRange.month') },
    { value: 'custom', label: t('admin.announcementsModule.scheduled.dateRange.custom') },
  ];

  const hasFilters = hasActiveScheduledFilters(filters);

  const clearFilters = () => setFilters({ statuses: ['SCHEDULED'] });

  if (dashLoading && !scheduledDash) {
    return (
      <AdminModulePageShell width="wide">
        <AdminModulePageSkeleton />
      </AdminModulePageShell>
    );
  }

  const next = scheduledDash?.nextPublication;

  return (
    <AdminModulePageShell width="wide">
      <div className="admin-ann-workspace" data-admin-search-id="announcements-scheduled">
        <AdminBackButton onClick={() => navigate('/admin/announcements')} label={backLabel} />

        <header
          className="admin-ann-hero admin-ann-hero--compact admin-ann-hero--scheduled"
          aria-labelledby="ann-scheduled-title"
        >
          <div className="admin-ann-hero__glow" aria-hidden />
          <div className="admin-ann-hero__content">
            <div className="admin-ann-hero__badge admin-ann-hero__badge--scheduled">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden />
              <span>{t('admin.announcementsModule.nav.scheduled')}</span>
            </div>
            <h1 id="ann-scheduled-title" className="admin-ann-hero__title">
              {t('admin.announcementsModule.scheduled.title')}
            </h1>
            <p className="admin-ann-hero__subtitle">
              {t('admin.announcementsModule.scheduled.subtitle')}
            </p>
          </div>
        </header>

        <div className="admin-ann-kpi-strip admin-ann-kpi-strip--scheduled">
          <AdminKpiStatCard
            label={t('admin.announcementsModule.scheduled.kpi.scheduled')}
            value={String(scheduledDash?.scheduledCount ?? 0)}
            icon={CalendarClock}
            accent="#6366f1"
            accentBg="color-mix(in srgb, #6366f1 12%, var(--admin-bg-elevated))"
            index={0}
          />
          <AdminKpiStatCard
            label={t('admin.announcementsModule.scheduled.kpi.today')}
            value={String(scheduledDash?.publishingTodayCount ?? 0)}
            icon={Timer}
            accent="#ea580c"
            accentBg="color-mix(in srgb, #ea580c 12%, var(--admin-bg-elevated))"
            index={1}
          />
          <AdminKpiStatCard
            label={t('admin.announcementsModule.scheduled.kpi.week')}
            value={String(scheduledDash?.publishingThisWeekCount ?? 0)}
            icon={CalendarDays}
            accent="#2563eb"
            accentBg="color-mix(in srgb, #2563eb 12%, var(--admin-bg-elevated))"
            index={2}
          />
          <AdminKpiStatCard
            label={t('admin.announcementsModule.scheduled.kpi.next')}
            value={
              next?.publish_start_at
                ? `${formatListDate(next.publish_start_at, locale)} ${formatListTime(next.publish_start_at, undefined, locale)}`
                : '—'
            }
            icon={Clock}
            accent="#16a34a"
            accentBg="color-mix(in srgb, #16a34a 12%, var(--admin-bg-elevated))"
            index={3}
          />
        </div>

        <section className="admin-ann-feed admin-ann-feed--scheduled" aria-labelledby="ann-scheduled-list-title">
          <div className="admin-ann-feed__hero">
            <div className="admin-ann-feed__hero-top">
              <div className="admin-ann-feed__title-block">
                <span className="admin-ann-feed__icon-wrap admin-ann-feed__icon-wrap--scheduled" aria-hidden>
                  <CalendarClock className="h-[1.125rem] w-[1.125rem] text-[var(--admin-brand)]" />
                </span>
                <div className="admin-ann-feed__titles">
                  <div className="admin-ann-feed__title-row">
                    <h2 id="ann-scheduled-list-title" className="admin-ann-feed__title">
                      {t('admin.announcementsModule.scheduled.listTitle')}
                    </h2>
                    <span className="admin-ann-feed__count">{total}</span>
                  </div>
                  <p className="admin-ann-feed__subtitle">
                    {t('admin.announcementsModule.scheduled.listSubtitle')}
                  </p>
                </div>
              </div>

              {hasFilters ? (
                <div className="admin-ann-feed__hero-actions">
                  <button type="button" className="admin-ann-feed__clear" onClick={clearFilters}>
                    <X className="h-3.5 w-3.5" aria-hidden />
                    {t('admin.announcementsModule.filters.clear')}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="admin-ann-feed__toolbar">
              <AdminSearchInput
                value={filters.search ?? ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                onClear={() => setFilters((prev) => ({ ...prev, search: undefined }))}
                placeholder={t('admin.announcementsModule.scheduled.searchPlaceholder')}
                aria-label={t('admin.announcementsModule.scheduled.searchPlaceholder')}
                loading={listLoading}
              />
            </div>

            <div className="admin-ann-feed__filters-zone">
              <div className="admin-ann-feed__filters-head">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--admin-brand)]" aria-hidden />
                <span>{t('admin.announcementsModule.feed.filtersLabel')}</span>
              </div>

              <div className="admin-ann-feed__filters">
                <AdminSelect
                  id="scheduled-status-filter"
                  label={t('admin.announcementsModule.filters.status')}
                  value={filters.statuses?.[0] ?? 'SCHEDULED'}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, statuses: value ? [value] : ['SCHEDULED'] }))
                  }
                  options={[{ value: '', label: t('admin.announcementsModule.filters.allStatuses') }, ...statusOptions]}
                />
                <AdminSelect
                  id="scheduled-date-filter"
                  label={t('admin.announcementsModule.scheduled.dateRange.label')}
                  value={filters.dateRange ?? 'all'}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: (value || 'all') as ScheduledListFilters['dateRange'],
                    }))
                  }
                  options={dateRangeOptions}
                />
              </div>

              {filters.dateRange === 'custom' ? (
                <div className="admin-ann-scheduled-custom-range">
                  <label className="admin-ann-scheduled-custom-range__field">
                    <span>{t('admin.announcementsModule.scheduled.dateRange.from')}</span>
                    <input
                      type="date"
                      className="admin-ann-scheduled-custom-range__input"
                      value={filters.publishStartFrom ?? ''}
                      onChange={(e) => setFilters((prev) => ({ ...prev, publishStartFrom: e.target.value }))}
                    />
                  </label>
                  <label className="admin-ann-scheduled-custom-range__field">
                    <span>{t('admin.announcementsModule.scheduled.dateRange.to')}</span>
                    <input
                      type="date"
                      className="admin-ann-scheduled-custom-range__input"
                      value={filters.publishStartTo ?? ''}
                      onChange={(e) => setFilters((prev) => ({ ...prev, publishStartTo: e.target.value }))}
                    />
                  </label>
                </div>
              ) : null}
            </div>
          </div>

          {listLoading && items.length === 0 ? (
            <AdminSectionSkeletonShell className="admin-ann-scheduled-table-skeleton">
              <div className="admin-shimmer admin-ann-scheduled-table-skeleton__row" aria-hidden />
              <div className="admin-shimmer admin-ann-scheduled-table-skeleton__row" aria-hidden />
              <div className="admin-shimmer admin-ann-scheduled-table-skeleton__row" aria-hidden />
            </AdminSectionSkeletonShell>
          ) : (
            <>
              <ScheduledAnnouncementsTable items={items} onChanged={refreshAll} hasFilters={hasFilters} />
              <AdminPagination
                page={currentPage}
                totalPages={total_pages}
                totalItems={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                loading={listLoading}
                itemLabel={t('admin.announcementsModule.feed.paginationLabel')}
              />
            </>
          )}
        </section>
      </div>
    </AdminModulePageShell>
  );
};

export default ScheduledAnnouncementsPage;

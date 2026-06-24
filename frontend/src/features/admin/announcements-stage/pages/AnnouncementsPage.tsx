import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminModulePageSkeleton from '../../ui/AdminModulePageSkeleton';
import AnnouncementsOverviewHeader from '../components/AnnouncementsOverviewHeader';
import AnnouncementsKpiStrip from '../components/AnnouncementsKpiStrip';
import AnnouncementsAnalyticsPanel from '../components/AnnouncementsAnalyticsPanel';
import AnnouncementsInsightsPanel from '../components/AnnouncementsInsightsPanel';
import AnnouncementsFeedSection from '../components/AnnouncementsFeedSection';
import AnnouncementsNavStrip from '../components/AnnouncementsNavStrip';
import { annFiltersToListParams, type AnnListFilters } from '../constants/announcementListFilters';
import { useAnnouncementsDashboard, useAnnouncementsList } from '../hooks/useAnnouncements';
import type { AnnouncementListParams } from '../types/announcement';
import '../styles/admin-announcements.css';

const FEED_PAGE_SIZE = 8;

const AnnouncementsPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AnnListFilters>({});
  const [page, setPage] = useState(1);
  const { data: dashboard, loading: dashLoading, refresh: refreshDashboard } = useAnnouncementsDashboard();

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const listParams = useMemo<AnnouncementListParams>(
    () => ({
      page,
      page_size: FEED_PAGE_SIZE,
      ...annFiltersToListParams(filters),
    }),
    [filters, page],
  );

  const {
    items,
    total,
    page: currentPage,
    page_size,
    total_pages,
    loading: listLoading,
    refresh: refreshList,
  } = useAnnouncementsList(listParams);

  const handleAnnouncementDeleted = useCallback(async () => {
    const wasLastOnPage = items.length === 1 && page > 1;
    await Promise.all([refreshList(), refreshDashboard()]);
    if (wasLastOnPage) {
      setPage((current) => Math.max(1, current - 1));
    }
  }, [items.length, page, refreshDashboard, refreshList]);

  const handleKpiNavigate = useCallback(
    (key: string) => {
      if (key === 'drafts') setFilters((f) => ({ ...f, statuses: ['DRAFT'] }));
      else if (key === 'scheduled') navigate('/admin/announcements/scheduled');
      else if (key === 'urgent') setFilters((f) => ({ ...f, priorities: ['URGENT'] }));
      else if (key === 'active') setFilters((f) => ({ ...f, statuses: ['PUBLISHED'] }));
      else navigate('/admin/announcements/all');
    },
    [navigate],
  );

  if (dashLoading && !dashboard) {
    return (
      <AdminModulePageShell width="wide">
        <AdminModulePageSkeleton />
      </AdminModulePageShell>
    );
  }

  const summary = dashboard?.summary;
  const engagement = dashboard?.engagement ?? {
    views: 0,
    clicks: 0,
    saves: 0,
    engagementRate: 0,
    clickThroughRate: 0,
  };

  return (
    <AdminModulePageShell width="wide">
      <div className="admin-ann-workspace" data-admin-search-id="announcements-hub">
        <AnnouncementsOverviewHeader
          summary={summary ?? null}
          engagement={engagement}
          loading={dashLoading}
        />

        <AnnouncementsKpiStrip
          summary={summary ?? null}
          engagement={engagement}
          loading={dashLoading}
          onNavigate={handleKpiNavigate}
        />

        <AnnouncementsNavStrip />

        <AnnouncementsFeedSection
          items={items}
          filters={filters}
          onFiltersChange={setFilters}
          loading={listLoading}
          total={total}
          page={currentPage}
          totalPages={total_pages}
          pageSize={page_size}
          onPageChange={setPage}
          onDeleted={handleAnnouncementDeleted}
        />

        <section className="admin-ann-ops-section" aria-label="Analytics overview">
        <div className="admin-ann-ops-grid">
          {dashboard ? (
            <div className="admin-ann-ops-cell">
              <AnnouncementsAnalyticsPanel
                typeDistribution={dashboard.typeDistribution}
                engagement={engagement}
                loading={dashLoading}
              />
            </div>
          ) : null}
          <div className="admin-ann-ops-cell">
            <AnnouncementsInsightsPanel insights={dashboard?.insights ?? []} previewLimit={7} />
          </div>
        </div>
        </section>
      </div>
    </AdminModulePageShell>
  );
};

export default AnnouncementsPage;

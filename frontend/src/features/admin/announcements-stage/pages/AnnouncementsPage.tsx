import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminModulePageSkeleton from '../../ui/AdminModulePageSkeleton';
import AnnouncementsOverviewHeader from '../components/AnnouncementsOverviewHeader';
import AnnouncementsKpiStrip from '../components/AnnouncementsKpiStrip';
import AnnouncementsAnalyticsPanel from '../components/AnnouncementsAnalyticsPanel';
import AnnouncementsInsightsPanel from '../components/AnnouncementsInsightsPanel';
import AnnouncementsFiltersBar, { type AnnListFilters } from '../components/AnnouncementsFiltersBar';
import AnnouncementsFeedSection from '../components/AnnouncementsFeedSection';
import AnnouncementsNavStrip from '../components/AnnouncementsNavStrip';
import { useAnnouncementsDashboard, useAnnouncementsList } from '../hooks/useAnnouncements';
import type { AnnouncementListParams } from '../types/announcement';
import '../styles/admin-announcements.css';

const AnnouncementsPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AnnListFilters>({});
  const { data: dashboard, loading: dashLoading } = useAnnouncementsDashboard();

  const listParams = useMemo<AnnouncementListParams>(
    () => ({
      page: 1,
      page_size: 12,
      search: filters.search || undefined,
      status: filters.status,
      priority: filters.priority,
      type: filters.type,
      internship_only: filters.internship_only,
    }),
    [filters],
  );

  const { items, total, loading: listLoading } = useAnnouncementsList(listParams);

  const hasSearch = Boolean(
    filters.search?.trim() ||
      filters.status ||
      filters.priority ||
      filters.type ||
      filters.internship_only,
  );

  const handleKpiNavigate = useCallback(
    (key: string) => {
      if (key === 'internships') {
        navigate('/admin/announcements/internships');
        return;
      }
      if (key === 'drafts') setFilters((f) => ({ ...f, status: 'DRAFT' }));
      else if (key === 'urgent') setFilters((f) => ({ ...f, priority: 'URGENT' }));
      else if (key === 'active') setFilters((f) => ({ ...f, status: 'PUBLISHED' }));
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

        <AnnouncementsFiltersBar filters={filters} onChange={setFilters} />

        <AnnouncementsFeedSection
          items={items}
          loading={listLoading}
          total={total}
          hasSearch={hasSearch}
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
            <AnnouncementsInsightsPanel insights={dashboard?.insights ?? []} />
          </div>
        </div>
        </section>
      </div>
    </AdminModulePageShell>
  );
};

export default AnnouncementsPage;

import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../ui';
import AdminModulePageSkeleton from '../../ui/AdminModulePageSkeleton';
import AnnouncementsAnalyticsPanel from '../components/AnnouncementsAnalyticsPanel';
import AnnouncementsPremiumEmpty from '../components/AnnouncementsPremiumEmpty';
import { adminAnnouncementsApi } from '../../api/announcements';
import type { AnnouncementDashboardData } from '../types/announcement';
import '../styles/admin-announcements.css';

const AnnouncementsAnalyticsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<AnnouncementDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAnnouncementsApi
      .analytics()
      .then((d) => setData(d as unknown as AnnouncementDashboardData))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const engagement = useMemo(
    () =>
      data?.engagement ?? {
        views: 0,
        clicks: 0,
        saves: 0,
        engagementRate: 0,
        clickThroughRate: 0,
      },
    [data],
  );

  return (
    <AdminListPageShell onBack={() => navigate('/admin/announcements')} backTo="announcements">
      <div className="admin-ann-workspace">
        <header className="admin-ann-hero admin-ann-hero--compact">
          <h1 className="admin-ann-hero__title">{t('admin.announcementsModule.analytics.title')}</h1>
          <p className="admin-ann-hero__subtitle">{t('admin.announcementsModule.analytics.subtitle')}</p>
        </header>

        {loading ? (
          <AdminModulePageSkeleton />
        ) : data ? (
          <AnnouncementsAnalyticsPanel
            typeDistribution={data.typeDistribution ?? []}
            engagement={engagement}
          />
        ) : (
          <AnnouncementsPremiumEmpty variant="analytics" />
        )}
      </div>
    </AdminListPageShell>
  );
};

export default AnnouncementsAnalyticsPage;

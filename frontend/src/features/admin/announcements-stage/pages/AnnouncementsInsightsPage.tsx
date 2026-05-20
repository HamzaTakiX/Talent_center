import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../ui';
import AnnouncementsInsightsPanel, { type AnnInsight } from '../components/AnnouncementsInsightsPanel';
import AnnouncementsNavStrip from '../components/AnnouncementsNavStrip';
import { adminAnnouncementsApi } from '../../api/announcements';
import '../styles/admin-announcements.css';

const AnnouncementsInsightsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<AnnInsight[]>([]);

  useEffect(() => {
    adminAnnouncementsApi.insights().then((d) => setInsights((d as AnnInsight[]) ?? []));
  }, []);

  return (
    <AdminListPageShell onBack={() => navigate('/admin/announcements')} backTo="announcements">
      <div className="admin-ann-workspace">
        <header className="admin-ann-hero admin-ann-hero--compact">
          <h1 className="admin-ann-hero__title">{t('admin.announcementsModule.insights.title')}</h1>
          <p className="admin-ann-hero__subtitle">{t('admin.announcementsModule.insights.subtitle')}</p>
        </header>
        <AnnouncementsNavStrip />
        <AnnouncementsInsightsPanel insights={insights} />
      </div>
    </AdminListPageShell>
  );
};

export default AnnouncementsInsightsPage;

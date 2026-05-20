import { FunctionComponent, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../ui';
import AnnouncementsNavStrip from '../components/AnnouncementsNavStrip';
import AnnouncementsPremiumEmpty from '../components/AnnouncementsPremiumEmpty';
import EngagementChartsSection from '../components/engagement/EngagementChartsSection';
import EngagementFilterBar from '../components/engagement/EngagementFilterBar';
import EngagementInsightsRow from '../components/engagement/EngagementInsightsRow';
import EngagementIntelligenceHero from '../components/engagement/EngagementIntelligenceHero';
import EngagementKpiGrid from '../components/engagement/EngagementKpiGrid';
import EngagementPageSkeleton from '../components/engagement/EngagementPageSkeleton';
import EngagementTopTable from '../components/engagement/EngagementTopTable';
import { useEngagementDashboard } from '../hooks/useEngagementDashboard';
import {
  DEFAULT_ENGAGEMENT_FILTERS,
  type EngagementFilters,
} from '../types/engagementDashboard';
import '../styles/admin-announcements.css';

const AnnouncementsEngagementPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EngagementFilters>(DEFAULT_ENGAGEMENT_FILTERS);
  const { data, insights, loading, error } = useEngagementDashboard();

  return (
    <AdminListPageShell onBack={() => navigate('/admin/announcements')} backTo="announcements">
      <motion.div className="admin-ann-workspace admin-eng-workspace">
        {loading && !data ? (
          <EngagementPageSkeleton />
        ) : error || !data ? (
          <>
            <header className="admin-ann-hero admin-ann-hero--compact">
              <h1 className="admin-ann-hero__title">
                {t('admin.announcementsModule.engagement.title')}
              </h1>
              <p className="admin-ann-hero__subtitle">
                {t('admin.announcementsModule.engagement.subtitle')}
              </p>
            </header>
            <AnnouncementsPremiumEmpty variant="analytics" />
          </>
        ) : (
          <>
            <EngagementIntelligenceHero data={data} loading={loading} />
            <AnnouncementsNavStrip />
            <EngagementFilterBar filters={filters} onChange={setFilters} />
            <EngagementKpiGrid data={data} loading={loading} />
            <EngagementChartsSection data={data} loading={loading} />
            <EngagementInsightsRow data={data} apiInsights={insights} />
            <EngagementTopTable rows={data.topByEngagement} loading={loading} />
          </>
        )}
      </motion.div>
    </AdminListPageShell>
  );
};

export default AnnouncementsEngagementPage;

import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminDonutChart from '../../ui/charts/AdminDonutChart';
import { AdminChartDonutSkeleton } from '../../ui/AdminSectionSkeleton';
import type { AnnouncementDashboardData } from '../types/announcement';
import { fadeInUp } from '../../dashboard/ui/animations';
import AnnouncementsPanelEmpty from './AnnouncementsPanelEmpty';

interface Props {
  typeDistribution: AnnouncementDashboardData['typeDistribution'];
  engagement: AnnouncementDashboardData['engagement'];
  loading?: boolean;
}

const AnnouncementsAnalyticsPanel: FunctionComponent<Props> = ({
  typeDistribution,
  engagement,
  loading,
}) => {
  const { t } = useTranslation();

  const segments = useMemo(
    () =>
      typeDistribution.map((d, i) => ({
        key: d.code,
        label: d.name,
        value: d.count,
        color: ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2'][i % 5],
      })),
    [typeDistribution],
  );

  const maxViews = Math.max(engagement.views, 1);
  const barItems = [
    {
      label: t('admin.announcementsModule.analytics.views'),
      value: engagement.views,
      pct: (engagement.views / maxViews) * 100,
    },
    {
      label: t('admin.announcementsModule.analytics.clicks'),
      value: engagement.clicks,
      pct: (engagement.clicks / maxViews) * 100,
    },
    {
      label: t('admin.announcementsModule.analytics.saves'),
      value: engagement.saves,
      pct: (engagement.saves / maxViews) * 100,
    },
  ];

  const chartTitle = t('admin.announcementsModule.analytics.typeMixTitle');
  const chartAria = t('admin.announcementsModule.analytics.typeMixAria');

  return (
    <motion.section {...fadeInUp} className="admin-ann-analytics" aria-labelledby="ann-analytics-title">
      <div className="admin-ann-analytics__head">
        <BarChart3 className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
        <h3 id="ann-analytics-title" className="admin-ann-panel-title">
          {t('admin.announcementsModule.analytics.panelTitle')}
        </h3>
      </div>

      <div className="admin-ann-analytics__bars">
        {barItems.map((b) => (
          <motion.div key={b.label} className="admin-ann-bar-row">
            <span className="text-[var(--admin-text-muted)]">{b.label}</span>
            <span className="font-semibold text-[var(--admin-text)]">{b.value}</span>
            <div className="admin-ann-bar-row__track">
              <motion.div
                className="admin-ann-bar-row__fill"
                initial={{ width: 0 }}
                animate={{ width: `${b.pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <p className="admin-ann-analytics__chart-label">{chartTitle}</p>
      <div className="admin-ann-panel-body admin-ann-panel-body--chart">
        {loading ? (
          <AdminChartDonutSkeleton legendItems={4} />
        ) : segments.length > 0 ? (
          <AdminDonutChart segments={segments} ariaLabel={chartAria} premiumGradients />
        ) : (
          <AnnouncementsPanelEmpty variant="chart" />
        )}
      </div>
    </motion.section>
  );
};

export default AnnouncementsAnalyticsPanel;

import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AdminDonutChart from '../../ui/charts/AdminDonutChart';
import AdminModulePanel from '../../ui/AdminModulePanel';
import type { AnnouncementDashboardData } from '../types/announcement';

interface Props {
  typeDistribution: AnnouncementDashboardData['typeDistribution'];
  engagement: AnnouncementDashboardData['engagement'];
}

const AnnouncementsHubCharts: FunctionComponent<Props> = ({ typeDistribution, engagement }) => {
  const { t } = useTranslation();
  const donutData = typeDistribution.map((d, i) => ({
    key: d.code,
    label: d.name,
    value: d.count,
    color: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8', '#1e40af'][i % 6],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AdminModulePanel className="p-4">
        <h3 className="text-sm font-semibold text-[var(--admin-text)] mb-4">
          {t('admin.charts.announcements-type-mix')}
        </h3>
        {donutData.length > 0 ? (
          <AdminDonutChart segments={donutData} ariaLabel={t('admin.charts.announcements-type-mix')} />
        ) : (
          <p className="text-sm text-[var(--admin-text-muted)]">{t('admin.announcementsModule.empty.title')}</p>
        )}
      </AdminModulePanel>
      <AdminModulePanel className="p-4">
        <h3 className="text-sm font-semibold text-[var(--admin-text)] mb-4">
          {t('admin.announcementsModule.engagement.title')}
        </h3>
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between border-b border-[var(--admin-border)] pb-2">
            <span className="text-[var(--admin-text-muted)]">CTR</span>
            <span className="font-medium text-[var(--admin-brand)]">{engagement.clickThroughRate}%</span>
          </li>
          <li className="flex justify-between border-b border-[var(--admin-border)] pb-2">
            <span className="text-[var(--admin-text-muted)]">{t('admin.announcementsModule.kpi.engagement')}</span>
            <span className="font-medium">{engagement.engagementRate}%</span>
          </li>
          <li className="flex justify-between">
            <span className="text-[var(--admin-text-muted)]">{t('admin.announcementsModule.kpi.views')}</span>
            <span className="font-medium">{engagement.views}</span>
          </li>
        </ul>
      </AdminModulePanel>
    </div>
  );
};

export default AnnouncementsHubCharts;

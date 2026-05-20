import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import AdminKpiGrid from '../../ui/AdminKpiGrid';
import AnnouncementStatCard from './AnnouncementStatCard';
import type { AnnouncementDashboardData } from '../types/announcement';

const P = 'admin.announcementsModule.kpi';

interface Props {
  data: AnnouncementDashboardData['summary'] & { engagementRate?: number };
  onStatClick: (key: string) => void;
}

const AnnouncementsHubStats: FunctionComponent<Props> = ({ data, onStatClick }) => {
  const { t } = useTranslation();
  const cards = [
    { key: 'active', label: t(`${P}.active`), value: data.activeCount, icon: 'Megaphone' as const },
    { key: 'expiring', label: t(`${P}.expiring`), value: data.expiringCount, icon: 'Bell' as const },
    { key: 'internships', label: t(`${P}.internships`), value: data.internshipOffersCount, icon: 'Bell' as const },
    { key: 'urgent', label: t(`${P}.urgent`), value: data.urgentCount, icon: 'Bell' as const },
    { key: 'engagement', label: t(`${P}.engagement`), value: `${data.engagementRate ?? 0}%`, icon: 'TrendingUp' as const },
    { key: 'views', label: t(`${P}.views`), value: data.totalViews, icon: 'Users' as const },
  ];
  return (
    <AdminKpiGrid columns={3}>
      {cards.map((c, i) => (
        <AnnouncementStatCard
          key={c.key}
          label={c.label}
          value={String(c.value)}
          icon={c.icon}
          index={i}
          onClick={() => onStatClick(c.key)}
        />
      ))}
    </AdminKpiGrid>
  );
};

export default AnnouncementsHubStats;

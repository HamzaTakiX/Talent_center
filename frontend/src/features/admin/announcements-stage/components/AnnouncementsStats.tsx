import { FunctionComponent } from 'react';
import { announcementsStats } from '../data/announcementsMockData';
import AnnouncementStatCard from './AnnouncementStatCard';
import AdminKpiGrid from '../../ui/AdminKpiGrid';

interface AnnouncementsStatsProps {
  onStatCardClick: (statKey: string) => void;
}

const AnnouncementsStats: FunctionComponent<AnnouncementsStatsProps> = ({ onStatCardClick }) => (
  <AdminKpiGrid columns={4}>
    {announcementsStats.map((stat, index) => (
      <AnnouncementStatCard
        key={stat.labelKey ?? stat.label}
        label={stat.label}
        labelKey={stat.labelKey}
        value={stat.value}
        icon={stat.icon}
        index={index}
        onClick={() => onStatCardClick(stat.statKey ?? stat.labelKey ?? stat.label)}
      />
    ))}
  </AdminKpiGrid>
);

export default AnnouncementsStats;

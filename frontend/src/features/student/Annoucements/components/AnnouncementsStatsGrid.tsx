import { FunctionComponent, useMemo } from 'react';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import {
  announcementsStatColorMap,
  announcementsStatIconMap,
  announcementsStats,
} from '../data/announcementsMock';

const AnnouncementsStatsGrid: FunctionComponent = () => {
  const items = useMemo(
    () =>
      announcementsStats.map((stat) => ({
        id: stat.iconKey,
        label: stat.label,
        value: stat.value,
        icon: announcementsStatIconMap[stat.iconKey],
        iconBgClass: announcementsStatColorMap[stat.iconKey],
      })),
    []
  );

  return (
    <div id="student-announcements-stats" className="min-w-0">
      <PlatformKpiStrip items={items} columns={3} ariaLabel="Announcements statistics" />
    </div>
  );
};

export default AnnouncementsStatsGrid;

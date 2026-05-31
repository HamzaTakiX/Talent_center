import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import {
  announcementsStatColorMap,
  announcementsStatIconMap,
  announcementsStats,
} from '../data/announcementsMock';

const statLabelKeyMap = {
  total: 'total',
  interviews: 'interviewInvitations',
  unread: 'unread',
} as const;

const AnnouncementsStatsGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      announcementsStats.map((stat) => ({
        id: stat.iconKey,
        label: t(`student.announcements.stats.${statLabelKeyMap[stat.iconKey]}`),
        value: stat.value,
        icon: announcementsStatIconMap[stat.iconKey],
        iconBgClass: announcementsStatColorMap[stat.iconKey],
      })),
    [t]
  );

  return (
    <div id="student-announcements-stats" className="min-w-0">
      <PlatformKpiStrip items={items} columns={3} ariaLabel={t('student.announcements.statsAria')} />
    </div>
  );
};

export default AnnouncementsStatsGrid;

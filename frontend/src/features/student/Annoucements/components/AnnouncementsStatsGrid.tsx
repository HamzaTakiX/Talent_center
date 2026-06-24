import { FunctionComponent, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import { AdminKpiStripSkeleton } from '../../../admin/ui/AdminSectionSkeleton';
import { STUDENT_ANNOUNCEMENTS_SAVED_PATH } from '../saved/constants/routes';
import {
  announcementsStatColorMap,
  announcementsStatIconMap,
} from '../data/announcementsMock';
import type { AnnouncementsStatIconKey, StudentAnnouncementsStats } from '../types';

interface AnnouncementsStatsGridProps {
  stats: StudentAnnouncementsStats;
  loading?: boolean;
}

const STAT_KEYS: AnnouncementsStatIconKey[] = ['total', 'saved', 'recent', 'unread'];

const statLabelKeyMap: Record<AnnouncementsStatIconKey, string> = {
  total: 'total',
  saved: 'savedAnnouncements',
  recent: 'recentAnnouncements',
  unread: 'unread',
};

const AnnouncementsStatsGrid: FunctionComponent<AnnouncementsStatsGridProps> = ({
  stats,
  loading = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const openSavedPage = useCallback(() => {
    navigate(STUDENT_ANNOUNCEMENTS_SAVED_PATH);
  }, [navigate]);

  const items = useMemo(
    () =>
      STAT_KEYS.map((key) => ({
        id: key,
        label: t(`student.announcements.stats.${statLabelKeyMap[key]}`),
        value: String(stats[key]),
        icon: announcementsStatIconMap[key],
        iconBgClass: announcementsStatColorMap[key],
        onClick: key === 'saved' ? openSavedPage : undefined,
      })),
    [openSavedPage, stats, t],
  );

  if (loading) {
    return (
      <div id="student-announcements-stats" className="min-w-0">
        <AdminKpiStripSkeleton count={4} />
      </div>
    );
  }

  return (
    <div id="student-announcements-stats" className="min-w-0">
      <PlatformKpiStrip items={items} columns={4} ariaLabel={t('student.announcements.statsAria')} />
    </div>
  );
};

export default AnnouncementsStatsGrid;

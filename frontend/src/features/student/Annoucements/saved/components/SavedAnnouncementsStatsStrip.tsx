import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, Heart } from 'lucide-react';
import PlatformKpiStrip from '../../../../../design-system/PlatformKpiStrip';
import { AdminKpiStripSkeleton } from '../../../../admin/ui/AdminSectionSkeleton';
import type { FullAnnouncementItem } from '../../types';

interface SavedAnnouncementsStatsStripProps {
  items: FullAnnouncementItem[];
  loading?: boolean;
}

const SavedAnnouncementsStatsStrip: FunctionComponent<SavedAnnouncementsStatsStripProps> = ({
  items,
  loading = false,
}) => {
  const { t } = useTranslation();

  const counts = useMemo(
    () => ({
      total: items.length,
      saved: items.filter((item) => item.isSaved).length,
      favorited: items.filter((item) => item.isFavorited).length,
    }),
    [items],
  );

  const stripItems = useMemo(
    () => [
      {
        id: 'total',
        label: t('student.announcements.savedPageStats.total'),
        value: String(counts.total),
        icon: Heart,
        iconBgClass: 'bg-[#2b7fff]',
      },
      {
        id: 'saved',
        label: t('student.announcements.savedPageStats.saved'),
        value: String(counts.saved),
        icon: Bookmark,
        iconBgClass: 'bg-[#22c55e]',
      },
      {
        id: 'favorited',
        label: t('student.announcements.savedPageStats.favorited'),
        value: String(counts.favorited),
        icon: Heart,
        iconBgClass: 'bg-[#ec4899]',
      },
    ],
    [counts.favorited, counts.saved, counts.total, t],
  );

  if (loading) {
    return (
      <div className="min-w-0">
        <AdminKpiStripSkeleton count={3} />
      </div>
    );
  }

  return (
    <PlatformKpiStrip
      items={stripItems}
      columns={3}
      ariaLabel={t('student.announcements.savedPageStats.aria')}
    />
  );
};

export default SavedAnnouncementsStatsStrip;

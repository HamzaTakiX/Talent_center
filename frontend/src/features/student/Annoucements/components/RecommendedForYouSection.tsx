import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import type { FullAnnouncementItem } from '../types';
import FullAnnouncementCard from './FullAnnouncementCard';

interface RecommendedForYouSectionProps {
  items: FullAnnouncementItem[];
}

const RecommendedForYouSection: FunctionComponent<RecommendedForYouSectionProps> = ({ items }) => {
  const { t } = useTranslation();

  if (items.length === 0) return null;

  return (
    <section aria-label={t('student.announcements.recommendedTitle')} className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <Sparkles className="size-5 shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
        <h2 className="m-0 text-lg font-semibold leading-7 text-[var(--admin-text)] sm:text-xl">
          {t('student.announcements.recommendedTitle')}
        </h2>
      </div>

      <div className="student-announcement-card-grid grid w-full min-w-0 max-w-full grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 lg:gap-5">
        {items.map((item) => (
          <FullAnnouncementCard key={item.id} item={item} variant="recommended" />
        ))}
      </div>
    </section>
  );
};

export default RecommendedForYouSection;

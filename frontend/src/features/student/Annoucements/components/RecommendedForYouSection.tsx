import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import type { FullAnnouncementItem } from '../types';
import { STUDENT_ICON_CHIP_INFO } from '../../design-system/studentSemanticStyles';
import FullAnnouncementCard from './FullAnnouncementCard';
import StudentAnnouncementsFeedSkeleton from './StudentAnnouncementsFeedSkeleton';

interface RecommendedForYouSectionProps {
  items: FullAnnouncementItem[];
  loading?: boolean;
}

const RecommendedForYouSection: FunctionComponent<RecommendedForYouSectionProps> = ({
  items,
  loading = false,
}) => {
  const { t } = useTranslation();

  if (!loading && items.length === 0) return null;

  return (
    <section
      id="student-recommended-announcements"
      aria-label={t('student.announcements.recommendedAria')}
      className="student-ann-recommended-panel admin-module-panel flex w-full min-w-0 max-w-full flex-col items-stretch gap-4 overflow-x-clip p-4 text-left font-inter text-[var(--admin-text)] max-[429px]:gap-3 max-[429px]:p-3.5 sm:gap-5 sm:p-5"
    >
      <header className="student-ann-recommended-panel__header flex w-full min-w-0 max-w-full flex-col gap-1.5 sm:gap-2">
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 sm:gap-2.5">
          <span className={`flex h-8 w-8 rounded-[10px] ${STUDENT_ICON_CHIP_INFO}`}>
            <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </span>
          <h2 className="m-0 min-w-0 break-words text-lg font-semibold leading-snug tracking-tight text-[var(--admin-text)] sm:truncate sm:leading-normal sm:text-xl">
            {t('student.announcements.recommendedTitle')}
          </h2>
        </div>
        <p className="m-0 max-w-2xl text-sm leading-relaxed text-[var(--admin-text-muted)]">
          {t('student.announcements.recommendedSubtitle')}
        </p>
      </header>

      <div className="student-ann-recommended-panel__body min-w-0">
        {loading ? (
          <StudentAnnouncementsFeedSkeleton count={4} variant="grid" />
        ) : (
          <div className="student-announcement-card-grid student-ann-recommended-grid w-full min-w-0 max-w-full">
            {items.map((item) => (
              <FullAnnouncementCard key={item.id} item={item} variant="recommended" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedForYouSection;

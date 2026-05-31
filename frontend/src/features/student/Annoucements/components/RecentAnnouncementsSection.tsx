import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { recentAnnouncements } from '../data/announcementsMock';
import { STUDENT_ANNOUNCEMENTS_ALL_PATH } from '../constants/routes';
import { ANNOUNCEMENTS_VIEW_ALL_BTN } from '../constants/announcementsStyles';
import AnnouncementCard from './AnnouncementCard';

const RecentAnnouncementsSection: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section
      id="student-recent-announcements"
      aria-label={t('student.announcements.recentTitle')}
      className="flex w-full min-w-0 flex-col gap-4"
    >
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="m-0 text-lg font-semibold leading-7 text-[var(--admin-text)] sm:text-xl">
          {t('student.announcements.recentTitle')}
        </h2>
        <button
          type="button"
          className={ANNOUNCEMENTS_VIEW_ALL_BTN}
          onClick={() => navigate(STUDENT_ANNOUNCEMENTS_ALL_PATH)}
        >
          {t('student.announcements.viewAll')}
          <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-3.5">
        {recentAnnouncements.map((item) => (
          <AnnouncementCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default RecentAnnouncementsSection;

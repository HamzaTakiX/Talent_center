import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { recentAnnouncements } from '../data/announcementsMock';
import { STUDENT_ANNOUNCEMENTS_ALL_PATH } from '../constants/routes';
import { ANNOUNCEMENTS_VIEW_ALL_BTN } from '../constants/announcementsStyles';
import AnnouncementCard from './AnnouncementCard';

const RecentAnnouncementsSection: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <section
      id="student-recent-announcements"
      aria-label="Recent Announcements"
      className="flex w-full min-w-0 flex-col gap-4"
    >
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="m-0 text-lg font-semibold leading-7 text-[var(--admin-text)] sm:text-xl">
          Recent Announcements
        </h2>
        <button
          type="button"
          className={ANNOUNCEMENTS_VIEW_ALL_BTN}
          onClick={() => navigate(STUDENT_ANNOUNCEMENTS_ALL_PATH)}
        >
          View All Announcements
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

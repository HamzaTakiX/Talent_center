import { FunctionComponent } from 'react';
import StudentLayout from '../../components/StudentLayout';
import AnnouncementsStatsGrid from '../components/AnnouncementsStatsGrid';
import RecentAnnouncementsSection from '../components/RecentAnnouncementsSection';
import { ANNOUNCEMENTS_PAGE_ROOT } from '../constants/announcementsLayout';

const AnnouncementsPage: FunctionComponent = () => {
  return (
    <StudentLayout headerTitle="Announcements" headerSubtitle="Digital Talent Center">
      <div id="student-announcements-root" className={ANNOUNCEMENTS_PAGE_ROOT}>
        <section aria-label="Announcement statistics" className="min-w-0">
          <AnnouncementsStatsGrid />
        </section>

        <RecentAnnouncementsSection />
      </div>
    </StudentLayout>
  );
};

export default AnnouncementsPage;

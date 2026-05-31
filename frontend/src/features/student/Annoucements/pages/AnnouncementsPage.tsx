import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../components/StudentLayout';
import AnnouncementsStatsGrid from '../components/AnnouncementsStatsGrid';
import RecentAnnouncementsSection from '../components/RecentAnnouncementsSection';
import { ANNOUNCEMENTS_PAGE_ROOT } from '../constants/announcementsLayout';

const AnnouncementsPage: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <StudentLayout>
      <div id="student-announcements-root" className={ANNOUNCEMENTS_PAGE_ROOT}>
        <section aria-label={t('student.announcements.statsAria')} className="min-w-0">
          <AnnouncementsStatsGrid />
        </section>

        <RecentAnnouncementsSection />
      </div>
    </StudentLayout>
  );
};

export default AnnouncementsPage;

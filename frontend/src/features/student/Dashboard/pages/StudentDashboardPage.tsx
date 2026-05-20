import { FunctionComponent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import StudentLayout from '../../components/StudentLayout';
import { STUDENT_PAGE_CONTAINER } from '../constants/studentDashboardStyles';
import { staggerContainer } from '../../../admin/dashboard/ui/animations';
import StudentDashboardPageHero from '../components/StudentDashboardPageHero';
import StudentDashboardStatsGrid from '../components/StudentDashboardStatsGrid';
import StudentDashboardAnalytics from '../components/StudentDashboardAnalytics';
import StudentSmartAlertsCard from '../components/cards/StudentSmartAlertsCard';
import StudentRecommendedOffersCard from '../components/cards/StudentRecommendedOffersCard';
import StudentAnnouncementsCard from '../components/cards/StudentAnnouncementsCard';
import StudentProgressCard from '../components/cards/StudentProgressCard';
import StudentRecentActivityCard from '../components/cards/StudentRecentActivityCard';
import StudentDashboardPageSkeleton from '../components/StudentDashboardSkeleton';

const StudentDashboardPage: FunctionComponent = () => {
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setIsHydrating(false), 280);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <StudentLayout>
      {isHydrating ? (
        <StudentDashboardPageSkeleton />
      ) : (
        <motion.div
          id="student-root"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className={STUDENT_PAGE_CONTAINER}
        >
          <StudentDashboardPageHero />

          <StudentDashboardStatsGrid />

          <StudentDashboardAnalytics />

          <div className="student-dashboard-main-grid">
            <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
              <StudentSmartAlertsCard />
              <StudentRecommendedOffersCard />
              <StudentAnnouncementsCard />
            </div>

            <aside className="student-dashboard-sidebar-stack">
              <StudentProgressCard />
              <StudentRecentActivityCard />
            </aside>
          </div>
        </motion.div>
      )}
    </StudentLayout>
  );
};

export default StudentDashboardPage;

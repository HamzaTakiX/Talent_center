import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import StudentLayout from '../../components/StudentLayout';
import { staggerContainer } from '../../../admin/dashboard/ui/animations';
import { STUDENT_PAGE_CONTAINER } from '../constants/studentDashboardStyles';
import { StudentDashboardProvider, useStudentDashboardContext } from '../context/StudentDashboardContext';
import StudentDashboardPageHero from '../components/StudentDashboardPageHero';
import StudentDashboardStatsGrid from '../components/StudentDashboardStatsGrid';
import TaskProgressSection from '../../Encadrant/task/components/TaskProgressSection';
import StudentDashboardAnalytics from '../components/StudentDashboardAnalytics';
import StudentSmartAlertsCard from '../components/cards/StudentSmartAlertsCard';
import StudentRecommendedOffersCard from '../components/cards/StudentRecommendedOffersCard';
import StudentProgressCard from '../components/cards/StudentProgressCard';
import StudentRecentActivityCard from '../components/cards/StudentRecentActivityCard';
import StudentDashboardPageSkeleton from '../components/StudentDashboardSkeleton';
import StudentDashboardLoadError from '../components/StudentDashboardLoadError';

const StudentDashboardContent: FunctionComponent = () => {
  const { loading, error, refresh } = useStudentDashboardContext();

  if (loading) {
    return <StudentDashboardPageSkeleton />;
  }

  return (
    <motion.div
      id="student-root"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={STUDENT_PAGE_CONTAINER}
    >
      {error ? (
        <StudentDashboardLoadError message={error} onRetry={refresh} />
      ) : null}

      <StudentDashboardPageHero />
      <StudentDashboardStatsGrid />
      <TaskProgressSection />
      <StudentDashboardAnalytics />

      <div className="student-dashboard-main-grid">
        <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
          <StudentSmartAlertsCard />
          <StudentRecommendedOffersCard />
        </div>

        <aside className="student-dashboard-sidebar-stack">
          <StudentProgressCard />
          <StudentRecentActivityCard />
        </aside>
      </div>
    </motion.div>
  );
};

const StudentDashboardPage: FunctionComponent = () => (
  <StudentLayout>
    <StudentDashboardProvider>
      <StudentDashboardContent />
    </StudentDashboardProvider>
  </StudentLayout>
);

export default StudentDashboardPage;

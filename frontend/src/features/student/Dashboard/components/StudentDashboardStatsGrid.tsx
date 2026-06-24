import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { staggerContainer } from '../../../admin/dashboard/ui/animations';
import StudentDashboardStatCard from './StudentDashboardStatCard';
import { useStudentDashboardContext } from '../context/StudentDashboardContext';

const StudentDashboardStatsGrid: FunctionComponent = () => {
  const { t } = useTranslation();
  const { data } = useStudentDashboardContext();

  return (
    <motion.section
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      id="student-stats"
      aria-label={t('student.dashboard.stats.aria')}
      className="admin-stats-panel overflow-hidden rounded-admin-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-admin-sm"
    >
      <motion.div className="admin-stats-grid admin-stats-grid--5">
        {data.stats.map((stat, index) => (
          <StudentDashboardStatCard
            key={stat.labelKey}
            stat={stat}
            index={index}
            onClick={() => {
              /* placeholder — futures sous-routes */
            }}
          />
        ))}
      </motion.div>
    </motion.section>
  );
};

export default StudentDashboardStatsGrid;

import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentDashboardStatCard from './StudentDashboardStatCard';
import { useStudentDashboardContext } from '../context/StudentDashboardContext';

const StudentDashboardStatsGrid: FunctionComponent = () => {
  const { t } = useTranslation();
  const { data } = useStudentDashboardContext();
  const totalSent = Number(data.stats.find((stat) => stat.iconKey === 'sent')?.value ?? 0);

  return (
    <section
      id="student-stats"
      aria-label={t('student.dashboard.stats.aria')}
      className="student-task-platform min-w-0"
    >
      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-5 sm:gap-4">
        {data.stats.map((stat, index) => {
          const value = Number(stat.value);
          const ratio =
            stat.iconKey === 'sent' || totalSent <= 0 || Number.isNaN(value)
              ? null
              : Math.round((value / totalSent) * 100);

          return (
            <StudentDashboardStatCard
              key={stat.labelKey}
              stat={stat}
              index={index}
              ratio={ratio}
            />
          );
        })}
      </div>
    </section>
  );
};

export default StudentDashboardStatsGrid;

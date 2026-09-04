import { CSSProperties, FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { StudentStatItem } from '../data/studentDashboardMock';
import { studentStatIconMap } from '../data/studentDashboardMock';
import { easePremium } from '../../../admin/dashboard/ui/animations';
import { TASK_GLASS_CARD } from '../../Encadrant/task/constants/taskLayout';

interface StudentDashboardStatCardProps {
  stat: StudentStatItem;
  index?: number;
  ratio?: number | null;
}

const StudentDashboardStatCard: FunctionComponent<StudentDashboardStatCardProps> = ({
  stat,
  index = 0,
  ratio = null,
}) => {
  const { t } = useTranslation();
  const Icon = studentStatIconMap[stat.iconKey];
  const title = t(`student.dashboard.stats.${stat.labelKey}`);
  const piePercent = ratio != null ? Math.min(100, Math.max(0, ratio)) : null;
  const shareLabel =
    piePercent != null ? t('student.dashboard.stats.share', { value: piePercent }) : '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: easePremium }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${TASK_GLASS_CARD} student-task-glass student-task-kpi${piePercent != null ? ' student-task-kpi--rate' : ''}`}
    >
      <div className="student-task-kpi__body">
        <div className="student-task-kpi__top">
          <div className="student-task-kpi__head">
            <span className="student-task-kpi__icon">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="student-task-kpi__title">{title}</p>
          </div>
        </div>
        <p className="m-0 text-2xl font-bold text-[var(--admin-text)]">{stat.value}</p>
        {piePercent != null ? (
          <span className="student-task-kpi__badge student-task-kpi__badge--flat">{shareLabel}</span>
        ) : null}
      </div>
      {piePercent != null ? (
        <div
          className="student-task-kpi__pie"
          style={{ '--pie-p': piePercent, '--pie-base': piePercent, '--pie-end': piePercent } as CSSProperties}
          role="img"
          aria-label={shareLabel}
        >
          <span className="student-task-kpi__pie-inner">{piePercent}%</span>
        </div>
      ) : null}
    </motion.article>
  );
};

export default StudentDashboardStatCard;

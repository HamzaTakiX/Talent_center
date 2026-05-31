import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  AlertTriangle,
  Percent,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../../admin/dashboard/ui/animations';
import { taskPlatformKpis } from '../data/taskPlatformMock';
import { TASK_GLASS_CARD } from '../constants/taskLayout';

const icons = {
  total: ListTodo,
  completed: CheckCircle2,
  pending: Clock,
  overdue: AlertTriangle,
  completionRate: Percent,
} as const;

const TaskStatsGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-5 sm:gap-4">
      {taskPlatformKpis.map((kpi, index) => {
        const Icon = icons[kpi.id as keyof typeof icons];
        const max = Math.max(...kpi.sparkline, 1);
        const trendClass =
          kpi.trend > 0 ? 'text-[#22c55e]' : kpi.trend < 0 ? 'text-[#f87171]' : 'text-[var(--admin-text-muted)]';
        const TrendIcon = kpi.trend > 0 ? TrendingUp : kpi.trend < 0 ? TrendingDown : Minus;

        return (
          <motion.article
            key={kpi.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: easePremium }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`${TASK_GLASS_CARD} student-task-glass student-task-kpi`}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="m-0 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                {t(`student.encadrant.task.platform.kpi.${kpi.id}`)}
              </p>
              <p className="m-0 mt-0.5 text-2xl font-bold text-[var(--admin-text)]">{kpi.value}</p>
            </div>
            <p className={`m-0 inline-flex items-center gap-1 text-xs font-semibold ${trendClass}`}>
              <TrendIcon className="h-3.5 w-3.5" aria-hidden />
              {t('student.encadrant.task.platform.kpi.trend', { value: Math.abs(kpi.trend) })}
            </p>
            <div className="student-task-kpi__spark" aria-hidden>
              {kpi.sparkline.map((v, i) => (
                <span
                  key={`${kpi.id}-s-${i}`}
                  className="student-task-kpi__bar"
                  style={{ height: `${(v / max) * 100}%` }}
                />
              ))}
            </div>
          </motion.article>
        );
      })}
    </div>
  );
};

export default TaskStatsGrid;

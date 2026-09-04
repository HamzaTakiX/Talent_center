import { CSSProperties, FunctionComponent } from 'react';
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

function parsePercentValue(value: string): number | null {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*%$/);
  if (!match) return null;
  return Math.min(100, Math.max(0, Number(match[1])));
}

const TaskStatsGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-5 sm:gap-4">
      {taskPlatformKpis.map((kpi, index) => {
        const Icon = icons[kpi.id as keyof typeof icons];
        const trendTone = kpi.trend > 0 ? 'up' : kpi.trend < 0 ? 'down' : 'flat';
        const TrendIcon = kpi.trend > 0 ? TrendingUp : kpi.trend < 0 ? TrendingDown : Minus;
        const trendLabel = t('student.encadrant.task.platform.kpi.trend', { value: Math.abs(kpi.trend) });
        const piePercent =
          kpi.id === 'completionRate' ? parsePercentValue(kpi.value) : (kpi.ratio ?? null);
        const pieGain = piePercent != null && kpi.trend > 0 ? Math.min(kpi.trend, piePercent) : 0;
        const pieLoss = piePercent != null && kpi.trend < 0 ? Math.min(Math.abs(kpi.trend), 100 - piePercent) : 0;
        const pieBase = piePercent != null ? Math.max(0, piePercent - pieGain) : 0;
        const pieEnd = piePercent != null ? Math.min(100, piePercent + pieLoss) : 0;
        const title = t(`student.encadrant.task.platform.kpi.${kpi.id}`);
        const pieLabel =
          piePercent != null
            ? kpi.id === 'completionRate'
              ? `${title} ${piePercent}%`
              : t('student.encadrant.task.platform.kpi.share', { value: piePercent })
            : '';

        return (
          <motion.article
            key={kpi.id}
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
              <p className="m-0 text-2xl font-bold text-[var(--admin-text)]">{kpi.value}</p>
              <span className={`student-task-kpi__badge student-task-kpi__badge--${trendTone}`}>
                <TrendIcon className="h-2.5 w-2.5 shrink-0" strokeWidth={2.4} aria-hidden />
                {trendLabel}
              </span>
            </div>
            {piePercent != null ? (
              <div
                className={`student-task-kpi__pie${pieGain > 0 ? ' student-task-kpi__pie--gain' : ''}${pieLoss > 0 ? ' student-task-kpi__pie--loss' : ''}`}
                style={
                  {
                    '--pie-p': piePercent,
                    '--pie-base': pieBase,
                    '--pie-end': pieEnd,
                  } as CSSProperties
                }
                role="img"
                aria-label={pieLabel}
              >
                <span className="student-task-kpi__pie-inner">{piePercent}%</span>
              </div>
            ) : null}
          </motion.article>
        );
      })}
    </div>
  );
};

export default TaskStatsGrid;

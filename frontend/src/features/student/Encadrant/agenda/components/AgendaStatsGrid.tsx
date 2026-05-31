import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, ListTodo, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../../admin/dashboard/ui/animations';
import { agendaPlatformStats } from '../data/agendaPlatformMock';
import { AGENDA_GLASS_CARD } from '../constants/agendaLayout';

const statIcons = {
  meetings: Calendar,
  tasks: ListTodo,
  deadlines: Clock,
  completed: CheckCircle2,
} as const;

const AgendaStatsGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4 sm:gap-4">
      {agendaPlatformStats.map((stat, index) => {
        const Icon = statIcons[stat.iconKey];
        const trendClass =
          stat.trend > 0
            ? 'student-agenda-stat__trend--up'
            : stat.trend < 0
              ? 'student-agenda-stat__trend--down'
              : 'student-agenda-stat__trend--flat';
        const TrendIcon = stat.trend > 0 ? TrendingUp : stat.trend < 0 ? TrendingDown : Minus;

        return (
          <motion.article
            key={stat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4, ease: easePremium }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`${AGENDA_GLASS_CARD} student-agenda-stat student-agenda-glass`}
          >
            <span className="student-agenda-stat__icon">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="m-0 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                {t(`student.encadrant.agenda.platform.stats.${stat.id}`)}
              </p>
              <p className="student-agenda-stat__value m-0 mt-1">{stat.value}</p>
            </div>
            <p className={`m-0 inline-flex items-center gap-1 text-xs font-semibold ${trendClass}`}>
              <TrendIcon className="h-3.5 w-3.5" aria-hidden />
              {t('student.encadrant.agenda.platform.stats.trend', { value: Math.abs(stat.trend) })}
            </p>
          </motion.article>
        );
      })}
    </div>
  );
};

export default AgendaStatsGrid;

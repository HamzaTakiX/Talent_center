import { FunctionComponent } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { taskPriorityAlerts } from '../data/taskPlatformMock';
import { TASK_GLASS_CARD } from '../constants/taskLayout';

const alertIcons = {
  danger: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
} as const;

const TaskPriorityAlerts: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${TASK_GLASS_CARD} student-task-glass`}>
      <div className="student-task-section-head">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.task.platform.alerts.title')}
        </h2>
      </div>
      <div className="grid gap-2 p-4 sm:grid-cols-2 sm:p-5">
        {taskPriorityAlerts.map((alert, index) => {
          const Icon = alertIcons[alert.severity];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`student-task-alert student-task-alert--${alert.severity}`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              <div className="min-w-0">
                <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">{t(alert.titleKey)}</p>
                <p className="m-0 mt-0.5 text-xs text-[var(--admin-text-muted)]">{t(alert.messageKey)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

export default TaskPriorityAlerts;

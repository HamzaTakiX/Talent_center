import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { taskProgressMetrics } from '../data/taskPlatformMock';
import { TASK_GLASS_CARD } from '../constants/taskLayout';

const TaskProgressSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const overall = taskProgressMetrics[0];

  return (
    <motion.section {...fadeInUp} className={`${TASK_GLASS_CARD} student-task-glass`}>
      <div className="student-task-section-head">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.task.globalProgress')}
        </h2>
        <p className="m-0 text-sm text-[var(--admin-text-muted)]">{t('student.encadrant.task.subtitle')}</p>
      </div>
      <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:p-5">
        <div
          className="student-task-progress-ring mx-auto sm:mx-0"
          style={{ '--ring-p': overall.progress } as React.CSSProperties}
        >
          <span className="student-task-progress-ring__inner">{overall.progress}%</span>
        </div>
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          {taskProgressMetrics.slice(1).map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3"
            >
              <div className="mb-2 flex justify-between gap-2 text-sm">
                <span className="font-medium text-[var(--admin-text)]">{t(metric.labelKey)}</span>
                <span className="font-bold text-[var(--admin-brand)]">{metric.progress}%</span>
              </div>
              <div className="student-agenda-progress-bar">
                <motion.div
                  className="student-agenda-progress-bar__fill"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${metric.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default TaskProgressSection;

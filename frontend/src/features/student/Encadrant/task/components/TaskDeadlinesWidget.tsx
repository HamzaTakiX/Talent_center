import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import { taskDeadlineItems } from '../data/taskPlatformMock';
import { TASK_GLASS_CARD } from '../constants/taskLayout';

const TaskDeadlinesWidget: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${TASK_GLASS_CARD} student-task-glass min-w-0`}>
      <div className="student-task-section-head">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.task.platform.deadlines.title')}
        </h2>
      </div>
      <div className="p-4 sm:p-5">
        {taskDeadlineItems.length === 0 ? (
          <StudentSearchEmptyState
            titleKey="student.encadrant.task.platform.empty.deadlinesTitle"
            descriptionKey="student.encadrant.task.platform.empty.deadlinesDesc"
            variant="inline"
          />
        ) : (
          taskDeadlineItems.map((item) => (
            <div key={item.id} className="student-agenda-deadline-row mb-2">
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">{t(item.titleKey)}</p>
                <p className="m-0 mt-0.5 text-xs text-[var(--admin-text-muted)]">
                  {item.dueAt} · {t('student.encadrant.task.platform.remaining', { days: item.daysRemaining })}
                </p>
              </div>
              <span className={`text-xs font-bold uppercase student-task-risk--${item.risk}`}>
                {t(`student.encadrant.task.platform.risk.${item.risk}`)}
              </span>
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
};

export default TaskDeadlinesWidget;

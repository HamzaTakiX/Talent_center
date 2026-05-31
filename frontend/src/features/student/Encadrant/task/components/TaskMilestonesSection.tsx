import { FunctionComponent } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { taskMilestones } from '../data/taskPlatformMock';
import { TASK_GLASS_CARD } from '../constants/taskLayout';

const TaskMilestonesSection: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${TASK_GLASS_CARD} student-task-glass student-agenda-journey`}>
      <div className="student-task-section-head !border-0">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.task.platform.milestones.title')}
        </h2>
      </div>
      <div className="student-agenda-journey__track px-4 pb-5 sm:px-5">
        {taskMilestones.map((step, index) => (
          <div key={step.id} className="student-agenda-journey__step">
            <div className="student-agenda-journey__rail">
              <span className={`student-agenda-journey__marker student-agenda-journey__marker--${step.status}`}>
                {step.status === 'completed' ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1}
              </span>
              {index < taskMilestones.length - 1 ? <span className="student-agenda-journey__line" aria-hidden /> : null}
            </div>
            <div>
              <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">{t(step.labelKey)}</p>
              {step.dateKey ? (
                <p className="m-0 mt-0.5 text-xs text-[var(--admin-text-muted)]">{t(step.dateKey)}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default TaskMilestonesSection;

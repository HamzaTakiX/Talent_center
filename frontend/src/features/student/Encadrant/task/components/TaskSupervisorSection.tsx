import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { Check, Eye, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import { TASK_GLASS_CARD, TASK_GHOST_BTN } from '../constants/taskLayout';
import type { StudentPlatformTask } from '../types';

interface TaskSupervisorSectionProps {
  tasks: StudentPlatformTask[];
  onSelectTask: (id: string) => void;
}

const TaskSupervisorSection: FunctionComponent<TaskSupervisorSectionProps> = ({
  tasks,
  onSelectTask,
}) => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${TASK_GLASS_CARD} student-task-glass`}>
      <div className="student-task-section-head">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.task.platform.supervisor.title')}
        </h2>
      </div>
      <div className="student-agenda-table-wrap">
        {tasks.length === 0 ? (
          <div className="p-5">
            <StudentSearchEmptyState
              titleKey="student.encadrant.task.platform.empty.tasksTitle"
              descriptionKey="student.encadrant.task.platform.empty.tasksDesc"
              variant="inline"
            />
          </div>
        ) : (
          <table className="student-agenda-table">
            <thead>
              <tr>
                <th>{t('student.encadrant.task.platform.supervisor.columns.task')}</th>
                <th>{t('student.encadrant.task.platform.supervisor.columns.assignedBy')}</th>
                <th>{t('student.encadrant.task.platform.supervisor.columns.assignedAt')}</th>
                <th>{t('student.encadrant.task.platform.supervisor.columns.due')}</th>
                <th>{t('student.encadrant.task.platform.supervisor.columns.feedback')}</th>
                <th>{t('student.encadrant.task.platform.supervisor.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="font-medium">{t(task.titleKey)}</td>
                  <td>{task.assignedByKey ? t(task.assignedByKey) : '—'}</td>
                  <td>{task.assignedAt ?? '—'}</td>
                  <td>{task.dueAt}</td>
                  <td>{task.feedbackStatusKey ? t(task.feedbackStatusKey) : '—'}</td>
                  <td>
                    <div className="flex flex-wrap justify-center gap-1">
                      <button type="button" className={TASK_GHOST_BTN} onClick={() => onSelectTask(task.id)}>
                        <Eye className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button type="button" className={TASK_GHOST_BTN}>
                        <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button type="button" className={TASK_GHOST_BTN}>
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.section>
  );
};

export default TaskSupervisorSection;

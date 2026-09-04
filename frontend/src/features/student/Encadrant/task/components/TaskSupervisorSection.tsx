import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ClipboardList, Eye, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { studentSupervisionTaskChatPath } from '../../../../shared/contextual-chat/utils/supervisionEntityChat';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import AdminPagination from '../../../../admin/ui/AdminPagination';
import { useAdminPagination } from '../../../../admin/shared/hooks/useAdminPagination';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import { TASK_GLASS_CARD, TASK_GHOST_BTN } from '../constants/taskLayout';
import { getTaskAssignee } from '../data/taskAssignees';
import type { StudentPlatformTask } from '../types';
import TaskAssigneeChip from './TaskAssigneeChip';

interface TaskSupervisorSectionProps {
  tasks: StudentPlatformTask[];
  onSelectTask: (id: string) => void;
}

type FeedbackTone = 'pending' | 'approved' | 'revision';

function feedbackTone(key?: string): FeedbackTone | null {
  if (!key) return null;
  if (key.endsWith('.revision')) return 'revision';
  if (key.endsWith('.approved')) return 'approved';
  if (key.endsWith('.pending')) return 'pending';
  return null;
}

const SUPERVISOR_PAGE_SIZE = 5;

const TaskSupervisorSection: FunctionComponent<TaskSupervisorSectionProps> = ({
  tasks,
  onSelectTask,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { page, setPage, paginatedItems, totalItems, totalPages, pageSize } = useAdminPagination(
    tasks,
    SUPERVISOR_PAGE_SIZE,
  );
  const leadAssignee = getTaskAssignee(
    tasks[0]?.assignedByKey ?? tasks[0]?.supervisorKey,
  );

  return (
    <motion.section {...fadeInUp} className={`${TASK_GLASS_CARD} student-task-glass student-task-supervisor`}>
      <header className="student-task-supervisor-head">
        <span className="student-task-supervisor-head-accent" aria-hidden />
        <div className="student-task-supervisor-head-main">
          <span className="student-task-supervisor-icon" aria-hidden>
            <ClipboardList className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="student-task-supervisor-eyebrow">
              {t('student.encadrant.task.platform.supervisor.eyebrow')}
            </p>
            <h2 className="student-task-supervisor-title">
              {t('student.encadrant.task.platform.supervisor.title')}
            </h2>
            <p className="student-task-supervisor-subtitle">
              {t('student.encadrant.task.platform.supervisor.subtitle')}
            </p>
          </div>
        </div>
        <div className="student-task-supervisor-head-aside">
          {tasks.length > 0 ? (
            <TaskAssigneeChip assignee={leadAssignee} compact showLabel={false} />
          ) : null}
          <span className="student-task-supervisor-count">
            <strong>{tasks.length}</strong>
            <span>{t('student.encadrant.task.platform.supervisor.countLabel')}</span>
          </span>
        </div>
      </header>

      <div className="student-task-supervisor-body">
        {tasks.length === 0 ? (
          <StudentSearchEmptyState
            titleKey="student.encadrant.task.platform.empty.tasksTitle"
            descriptionKey="student.encadrant.task.platform.empty.tasksDesc"
            variant="inline"
          />
        ) : (
          <div className="student-task-supervisor-scroll">
            <table className="student-task-supervisor-table">
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
                {paginatedItems.map((task) => {
                  const tone = feedbackTone(task.feedbackStatusKey);
                  const dueUrgent = task.daysRemaining <= 3;

                  return (
                    <tr key={task.id} className="student-task-supervisor-row">
                      <td className="student-task-supervisor-cell-task">
                        <button
                          type="button"
                          className="student-task-supervisor-task-link"
                          onClick={() => onSelectTask(task.id)}
                        >
                          {t(task.titleKey)}
                        </button>
                      </td>
                      <td>
                        {task.assignedByKey || task.supervisorKey ? (
                          <TaskAssigneeChip
                            assignee={getTaskAssignee(task.assignedByKey ?? task.supervisorKey)}
                            compact
                            showLabel={false}
                          />
                        ) : (
                          <span className="student-task-supervisor-muted">—</span>
                        )}
                      </td>
                      <td className="student-task-supervisor-date">{task.assignedAt ?? '—'}</td>
                      <td>
                        <span
                          className={`student-task-supervisor-due ${dueUrgent ? 'is-urgent' : ''}`}
                        >
                          <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                          {task.dueAt}
                        </span>
                      </td>
                      <td>
                        {tone ? (
                          <span className={`student-task-supervisor-feedback student-task-supervisor-feedback-${tone}`}>
                            {t(task.feedbackStatusKey!)}
                          </span>
                        ) : (
                          <span className="student-task-supervisor-muted">—</span>
                        )}
                      </td>
                      <td>
                        <div className="student-task-supervisor-actions">
                          <button
                            type="button"
                            className={`${TASK_GHOST_BTN} student-task-supervisor-action-btn`}
                            onClick={() => onSelectTask(task.id)}
                            aria-label={t('student.encadrant.task.platform.supervisor.actions.view')}
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <button
                            type="button"
                            className={`${TASK_GHOST_BTN} student-task-supervisor-action-btn`}
                            onClick={() =>
                              navigate(
                                studentSupervisionTaskChatPath(
                                  task.id,
                                  t(task.titleKey),
                                  [
                                    t(`student.encadrant.task.platform.status.${task.status}`),
                                    task.dueAt,
                                  ]
                                    .filter(Boolean)
                                    .join(' · '),
                                ),
                              )
                            }
                            aria-label={t('student.encadrant.task.platform.supervisor.actions.comment')}
                          >
                            <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setPage}
              itemLabel={t('student.encadrant.task.platform.supervisor.paginationItems')}
            />
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default TaskSupervisorSection;

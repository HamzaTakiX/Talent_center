import { FunctionComponent, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  History,
  MessageSquare,
  Paperclip,
  Plus,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { taskDetailActivity } from '../data/taskPlatformMock';
import type { StudentPlatformTask } from '../types';
import { getTaskAssignee } from '../data/taskAssignees';
import TaskAssigneeChip from './TaskAssigneeChip';
import TaskChatSection from './TaskChatSection';

interface TaskDetailDrawerProps {
  task: StudentPlatformTask | null;
  onClose: () => void;
}

const activityIcons = [Plus, TrendingUp, MessageSquare];

const TaskDetailDrawer: FunctionComponent<TaskDetailDrawerProps> = ({ task, onClose }) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!task) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [task, onClose]);

  return (
    <AnimatePresence>
      {task ? (
        <>
          <motion.div
            className="student-task-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="student-task-drawer"
            data-category={task.category}
            data-priority={task.priority}
            data-status={task.status}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-task-drawer-title"
          >
            <span className="student-task-drawer-accent" aria-hidden />

            <div className="student-task-drawer-top">
              <span className="student-task-drawer-category">
                {t(`student.encadrant.task.platform.categories.${task.category}`)}
              </span>
              <button
                type="button"
                className="student-task-drawer-close"
                onClick={onClose}
                aria-label={t('student.encadrant.task.platform.close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2 id="student-task-drawer-title" className="student-task-drawer-title">
              {t(task.titleKey)}
            </h2>
            <p className="student-task-drawer-desc">{t(task.descriptionKey)}</p>

            <div className="student-task-drawer-tags">
              <span className={`admin-badge student-task-priority--${task.priority}`}>
                {t(`student.encadrant.task.platform.priorities.${task.priority}`)}
              </span>
              <span className={`admin-badge student-task-status--${task.status}`}>
                {t(`student.encadrant.task.platform.status.${task.status}`)}
              </span>
            </div>

            <section className="student-task-drawer-progress" aria-label={t('student.encadrant.task.platform.drawer.progress')}>
              <div
                className="student-task-drawer-ring"
                style={{ '--ring-p': task.progress } as React.CSSProperties}
              >
                <span className="student-task-drawer-ring-inner">{task.progress}%</span>
              </div>
              <div className="student-task-drawer-progress-copy">
                <div className="student-task-drawer-progress-head">
                  <span>{t('student.encadrant.task.platform.drawer.progress')}</span>
                  <strong>{task.progress}%</strong>
                </div>
                <div
                  className="student-task-drawer-progress-track"
                  role="progressbar"
                  aria-valuenow={task.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <motion.div
                    className="student-task-drawer-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress}%` }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            </section>

            <div className="student-task-drawer-meta">
              <div className={`student-task-drawer-meta-card ${task.daysRemaining <= 3 ? 'is-urgent' : ''}`}>
                <Calendar className="h-4 w-4" aria-hidden />
                <div>
                  <span>{t('student.encadrant.task.platform.drawer.due')}</span>
                  <strong>{task.dueAt}</strong>
                  <em>{t('student.encadrant.task.platform.remaining', { days: task.daysRemaining })}</em>
                </div>
              </div>
              <div className="student-task-drawer-meta-card">
                <User className="h-4 w-4" aria-hidden />
                <div>
                  <span>{t('student.encadrant.task.platform.drawer.supervisor')}</span>
                  <TaskAssigneeChip
                    assignee={getTaskAssignee(task.assignedByKey ?? task.supervisorKey)}
                    compact
                    showLabel={false}
                  />
                </div>
              </div>
            </div>

            <section className="student-task-drawer-block">
              <h3>
                <Paperclip className="h-4 w-4" aria-hidden />
                {t('student.encadrant.task.platform.drawer.attachments')}
              </h3>
              <div className="student-task-drawer-empty">
                <span className="student-task-drawer-empty-icon" aria-hidden>
                  <Paperclip className="h-5 w-5" />
                </span>
                <p>{t('student.encadrant.task.platform.drawer.attachmentsHint')}</p>
              </div>
            </section>

            <TaskChatSection
              taskId={task.id}
              taskTitle={t(task.titleKey)}
              taskSubtitle={[
                t(`student.encadrant.task.platform.status.${task.status}`),
                task.dueAt,
              ]
                .filter(Boolean)
                .join(' · ')}
              assignee={getTaskAssignee(task.assignedByKey ?? task.supervisorKey)}
            />

            <section className="student-task-drawer-block student-task-drawer-activity">
              <h3>
                <History className="h-4 w-4" aria-hidden />
                {t('student.encadrant.task.platform.drawer.activity')}
              </h3>
              <ol className="student-task-drawer-timeline">
                {taskDetailActivity.map((item, index) => {
                  const Icon = activityIcons[index] ?? History;
                  return (
                    <li key={item.id} className="student-task-drawer-timeline-item">
                      <span className="student-task-drawer-timeline-rail" aria-hidden>
                        <span className="student-task-drawer-timeline-dot">
                          <Icon className="h-3 w-3" />
                        </span>
                        {index < taskDetailActivity.length - 1 ? (
                          <span className="student-task-drawer-timeline-line" />
                        ) : null}
                      </span>
                      <div className="student-task-drawer-timeline-card">
                        <p>{t(item.messageKey)}</p>
                        <time>{t(item.timeKey)}</time>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default TaskDetailDrawer;

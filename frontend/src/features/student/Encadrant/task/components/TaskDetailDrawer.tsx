import { FunctionComponent, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Paperclip, MessageSquare, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { taskDetailActivity } from '../data/taskPlatformMock';
import type { StudentPlatformTask } from '../types';
import { TASK_CATEGORY_CLASS } from '../constants/taskCategories';

interface TaskDetailDrawerProps {
  task: StudentPlatformTask | null;
  onClose: () => void;
}

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <span className={`text-xs font-bold uppercase ${TASK_CATEGORY_CLASS[task.category]}`}>
                  {t(`student.encadrant.task.platform.categories.${task.category}`)}
                </span>
                <h2 className="m-0 mt-1 text-lg font-bold text-[var(--admin-text)]">{t(task.titleKey)}</h2>
              </div>
              <button type="button" className="admin-icon-btn" onClick={onClose} aria-label={t('student.encadrant.task.platform.close')}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-[var(--admin-text-secondary)]">{t(task.descriptionKey)}</p>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--admin-text-muted)]">{t('student.encadrant.task.platform.drawer.due')}</dt>
                <dd className="m-0 font-medium">{task.dueAt}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--admin-text-muted)]">{t('student.encadrant.task.platform.drawer.supervisor')}</dt>
                <dd className="m-0 font-medium">{t(task.supervisorKey)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--admin-text-muted)]">{t('student.encadrant.task.platform.drawer.progress')}</dt>
                <dd className="m-0 font-medium text-[var(--admin-brand)]">{task.progress}%</dd>
              </div>
            </dl>
            <section className="mt-6">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Paperclip className="h-4 w-4" aria-hidden />
                {t('student.encadrant.task.platform.drawer.attachments')}
              </h3>
              <p className="text-xs text-[var(--admin-text-muted)]">{t('student.encadrant.task.platform.drawer.attachmentsHint')}</p>
            </section>
            <section className="mt-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="h-4 w-4" aria-hidden />
                {t('student.encadrant.task.platform.drawer.comments')}
              </h3>
              <p className="text-xs text-[var(--admin-text-muted)]">{t('student.encadrant.task.platform.drawer.commentsHint')}</p>
            </section>
            <section className="mt-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <History className="h-4 w-4" aria-hidden />
                {t('student.encadrant.task.platform.drawer.activity')}
              </h3>
              <ul className="m-0 list-none space-y-2 p-0">
                {taskDetailActivity.map((a) => (
                  <li key={a.id} className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-xs">
                    <p className="m-0 font-medium text-[var(--admin-text)]">{t(a.messageKey)}</p>
                    <p className="m-0 mt-0.5 text-[var(--admin-text-muted)]">{t(a.timeKey)}</p>
                  </li>
                ))}
              </ul>
            </section>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default TaskDetailDrawer;

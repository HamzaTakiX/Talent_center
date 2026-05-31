import { FunctionComponent } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import { taskNotifications } from '../data/taskPlatformMock';
import { TASK_GLASS_CARD } from '../constants/taskLayout';

const TaskNotificationsPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${TASK_GLASS_CARD} student-task-glass min-w-0`}>
      <div className="student-task-section-head">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[var(--admin-brand)]" aria-hidden />
          <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
            {t('student.encadrant.task.platform.notifications.title')}
          </h2>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        {taskNotifications.length === 0 ? (
          <StudentSearchEmptyState
            titleKey="student.encadrant.task.platform.empty.notificationsTitle"
            descriptionKey="student.encadrant.task.platform.empty.notificationsDesc"
            variant="inline"
          />
        ) : (
          taskNotifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="student-agenda-notif"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]">
                <Bell className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="m-0 text-sm font-medium text-[var(--admin-text)]">{t(n.messageKey)}</p>
                <p className="m-0 mt-0.5 text-xs text-[var(--admin-text-muted)]">{t(n.timeKey)}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.section>
  );
};

export default TaskNotificationsPanel;

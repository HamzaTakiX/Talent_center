import { FunctionComponent } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { workspaceNotifications } from '../data/workspacePlatformMock';
import { WORKSPACE_GLASS_CARD } from '../constants/workspaceLayout';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';

const WorkspaceNotificationsPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${WORKSPACE_GLASS_CARD} student-workspace-glass min-w-0`}>
      <div className="student-workspace-section-head">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[var(--admin-brand)]" aria-hidden />
          <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
            {t('student.encadrant.workspace.platform.notifications.title')}
          </h2>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        {workspaceNotifications.length === 0 ? (
          <StudentSearchEmptyState titleKey="student.encadrant.workspace.platform.empty.notificationsTitle" descriptionKey="student.encadrant.workspace.platform.empty.notificationsDesc" variant="inline" />
        ) : (
          workspaceNotifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="student-agenda-notif mb-2"
            >
              <Bell className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" aria-hidden />
              <div>
                <p className="m-0 text-sm font-medium text-[var(--admin-text)]">{t(n.messageKey)}</p>
                <p className="m-0 text-xs text-[var(--admin-text-muted)]">{t(n.timeKey)}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.section>
  );
};

export default WorkspaceNotificationsPanel;

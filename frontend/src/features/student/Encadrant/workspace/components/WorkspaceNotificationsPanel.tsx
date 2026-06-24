import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import NotificationFeedPanel from '../../../../shared/notifications/components/NotificationFeedPanel';
import { WORKSPACE_GLASS_CARD } from '../constants/workspaceLayout';

const WorkspaceNotificationsPanel: FunctionComponent = () => (
  <motion.section {...fadeInUp} className={`${WORKSPACE_GLASS_CARD} student-workspace-glass min-w-0`}>
    <div className="p-4 sm:p-5">
      <NotificationFeedPanel
        className="min-w-0"
        titleKey="student.encadrant.workspace.platform.notifications.title"
        category="supervision"
        limit={6}
        emptyTitleKey="student.encadrant.workspace.platform.empty.notificationsTitle"
        emptyDescriptionKey="student.encadrant.workspace.platform.empty.notificationsDesc"
      />
    </div>
  </motion.section>
);

export default WorkspaceNotificationsPanel;

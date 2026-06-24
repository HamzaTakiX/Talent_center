import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import NotificationFeedPanel from '../../../../shared/notifications/components/NotificationFeedPanel';
import { TASK_GLASS_CARD } from '../constants/taskLayout';

const TaskNotificationsPanel: FunctionComponent = () => (
  <motion.section {...fadeInUp} className={`${TASK_GLASS_CARD} student-task-glass min-w-0`}>
    <div className="p-4 sm:p-5">
      <NotificationFeedPanel
        className="min-w-0"
        titleKey="student.encadrant.task.platform.notifications.title"
        category="supervision"
        limit={6}
        emptyTitleKey="student.encadrant.task.platform.empty.notificationsTitle"
        emptyDescriptionKey="student.encadrant.task.platform.empty.notificationsDesc"
      />
    </div>
  </motion.section>
);

export default TaskNotificationsPanel;

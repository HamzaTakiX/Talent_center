import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import NotificationFeedPanel from '../../../../shared/notifications/components/NotificationFeedPanel';
import { AGENDA_GLASS_CARD } from '../constants/agendaLayout';

const AgendaNotificationsPanel: FunctionComponent = () => (
  <motion.section {...fadeInUp} className={`${AGENDA_GLASS_CARD} student-agenda-glass min-w-0`}>
    <div className="p-4 sm:p-5">
      <NotificationFeedPanel
        className="min-w-0"
        titleKey="student.encadrant.agenda.platform.notifications.title"
        category="supervision"
        limit={6}
        emptyTitleKey="student.encadrant.agenda.platform.empty.notificationsTitle"
        emptyDescriptionKey="student.encadrant.agenda.platform.empty.notificationsDesc"
      />
    </div>
  </motion.section>
);

export default AgendaNotificationsPanel;

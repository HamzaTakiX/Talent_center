import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Clock, MessageSquare, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import { agendaNotifications } from '../data/agendaPlatformMock';
import { AGENDA_GLASS_CARD } from '../constants/agendaLayout';

const notifIcons = {
  meeting: Calendar,
  deadline: Clock,
  message: MessageSquare,
  evaluation: GraduationCap,
} as const;

const AgendaNotificationsPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${AGENDA_GLASS_CARD} student-agenda-glass min-w-0`}>
      <div className="student-agenda-section-head">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
          <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
            {t('student.encadrant.agenda.platform.notifications.title')}
          </h2>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        {agendaNotifications.length === 0 ? (
          <StudentSearchEmptyState
            titleKey="student.encadrant.agenda.platform.empty.notificationsTitle"
            descriptionKey="student.encadrant.agenda.platform.empty.notificationsDesc"
            variant="inline"
          />
        ) : (
          agendaNotifications.map((notif, index) => {
            const Icon = notifIcons[notif.type];
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="student-agenda-notif"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="m-0 text-sm font-medium text-[var(--admin-text)]">{t(notif.messageKey)}</p>
                  <p className="m-0 mt-0.5 text-xs text-[var(--admin-text-muted)]">{t(notif.timeKey)}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.section>
  );
};

export default AgendaNotificationsPanel;

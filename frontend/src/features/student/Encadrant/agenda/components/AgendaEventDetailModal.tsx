import { FunctionComponent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Bell, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AgendaPlatformEvent } from '../types';
import { AGENDA_CATEGORY_CLASS } from '../constants/eventCategories';
import { AGENDA_PRIMARY_BTN, AGENDA_GHOST_BTN } from '../constants/agendaLayout';
import { getAgendaLocale } from '../utils/calendarLocale';

interface AgendaEventDetailModalProps {
  event: AgendaPlatformEvent | null;
  onClose: () => void;
}

const AgendaEventDetailModal: FunctionComponent<AgendaEventDetailModalProps> = ({
  event,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const locale = getAgendaLocale(i18n.language);

  useEffect(() => {
    if (!event) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          className="student-agenda-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="student-agenda-modal"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="agenda-event-modal-title"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span
                  className={`admin-badge mb-2 ${AGENDA_CATEGORY_CLASS[event.category]} !bg-transparent !border !border-current`}
                >
                  {t(`student.encadrant.agenda.platform.categories.${event.category}`)}
                </span>
                <h2 id="agenda-event-modal-title" className="m-0 text-lg font-bold text-[var(--admin-text)]">
                  {t(event.titleKey)}
                </h2>
              </div>
              <button type="button" className="admin-icon-btn shrink-0" onClick={onClose} aria-label={t('student.encadrant.agenda.platform.close')}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="m-0 text-sm text-[var(--admin-text-secondary)]">{t(event.descriptionKey)}</p>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--admin-text-muted)]">{t('student.encadrant.agenda.platform.modal.date')}</dt>
                <dd className="m-0 font-medium text-[var(--admin-text)]">
                  {new Date(event.startAt).toLocaleString(locale, {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--admin-text-muted)]">{t('student.encadrant.agenda.platform.modal.organizer')}</dt>
                <dd className="m-0 font-medium text-[var(--admin-text)]">{t(event.organizerKey)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--admin-text-muted)]">{t('student.encadrant.agenda.platform.modal.status')}</dt>
                <dd className="m-0">
                  <span className={`admin-badge student-agenda-status--${event.status}`}>
                    {t(`student.encadrant.agenda.platform.status.${event.status}`)}
                  </span>
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              {event.showJoin ? (
                <button type="button" className={AGENDA_PRIMARY_BTN}>
                  <Video className="h-4 w-4" aria-hidden />
                  {t('student.encadrant.agenda.joinMeeting')}
                </button>
              ) : null}
              <button type="button" className={AGENDA_GHOST_BTN}>
                <Eye className="h-3.5 w-3.5" aria-hidden />
                {t('student.encadrant.agenda.platform.actions.viewDetails')}
              </button>
              <button type="button" className={AGENDA_GHOST_BTN}>
                <Bell className="h-3.5 w-3.5" aria-hidden />
                {t('student.encadrant.agenda.platform.actions.addReminder')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AgendaEventDetailModal;

import { FunctionComponent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, MapPin, Pencil, Trash2, Video, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AgendaInvitationResponse, AgendaPlatformEvent } from '../types';
import { AGENDA_CATEGORY_CLASS } from '../constants/eventCategories';
import { AGENDA_PRIMARY_BTN, AGENDA_GHOST_BTN } from '../constants/agendaLayout';
import { AgendaMeetingJoinButton } from '../../../../shared/meeting-room';
import { getAgendaLocale } from '../utils/calendarLocale';
import type { AgendaMutationResult } from '../hooks/useAgendaPlatform';

interface AgendaEventDetailModalProps {
  event: AgendaPlatformEvent | null;
  onClose: () => void;
  onEdit?: (event: AgendaPlatformEvent) => void;
  onDelete?: (event: AgendaPlatformEvent) => Promise<AgendaMutationResult>;
  onRespond?: (
    eventId: string,
    value: Extract<AgendaInvitationResponse, 'ACCEPTED' | 'DECLINED' | 'TENTATIVE'>,
  ) => Promise<AgendaMutationResult>;
}

const AgendaEventDetailModal: FunctionComponent<AgendaEventDetailModalProps> = ({
  event,
  onClose,
  onEdit,
  onDelete,
  onRespond,
}) => {
  const { t, i18n } = useTranslation();
  const locale = getAgendaLocale(i18n.language);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!event) return undefined;
    setError(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [event, onClose]);

  const run = async (action: () => Promise<AgendaMutationResult>) => {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (result.ok) {
      onClose();
      return;
    }
    setError(result.error?.message ?? t('student.encadrant.agenda.platform.errors.update'));
  };

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
                  className={`admin-badge mb-2 ${AGENDA_CATEGORY_CLASS[event.category] ?? ''} !bg-transparent !border !border-current`}
                >
                  {t(`student.encadrant.agenda.platform.categories.${event.category}`)}
                </span>
                <h2 id="agenda-event-modal-title" className="m-0 text-lg font-bold text-[var(--admin-text)]">
                  {event.title}
                </h2>
              </div>
              <button type="button" className="admin-icon-btn shrink-0" onClick={onClose} aria-label={t('student.encadrant.agenda.platform.close')}>
                <X className="h-4 w-4" />
              </button>
            </div>
            {event.description ? (
              <p className="m-0 text-sm text-[var(--admin-text-secondary)]">{event.description}</p>
            ) : null}
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--admin-text-muted)]">{t('student.encadrant.agenda.platform.modal.date')}</dt>
                <dd className="m-0 font-medium text-[var(--admin-text)]">
                  {new Date(event.startAt).toLocaleString(locale, {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                  {' – '}
                  {new Date(event.endAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                </dd>
              </div>
              {event.organizerName ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--admin-text-muted)]">{t('student.encadrant.agenda.platform.modal.organizer')}</dt>
                  <dd className="m-0 font-medium text-[var(--admin-text)]">{event.organizerName}</dd>
                </div>
              ) : null}
              {event.location ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--admin-text-muted)]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {t('student.encadrant.agenda.platform.form.location')}
                    </span>
                  </dt>
                  <dd className="m-0 font-medium text-[var(--admin-text)]">{event.location}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--admin-text-muted)]">{t('student.encadrant.agenda.platform.modal.status')}</dt>
                <dd className="m-0">
                  <span className={`admin-badge student-agenda-status--${event.status}`}>
                    {t(`student.encadrant.agenda.platform.status.${event.status}`)}
                  </span>
                </dd>
              </div>
              {event.relatedInternship ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--admin-text-muted)]">{t('student.encadrant.agenda.platform.modal.internship')}</dt>
                  <dd className="m-0 font-medium text-[var(--admin-text)]">
                    {event.relatedInternship.academicYear}
                  </dd>
                </div>
              ) : null}
            </dl>
            {event.participants.length > 0 ? (
              <ul className="mt-4 m-0 list-none p-0 text-sm">
                {event.participants.map((person) => (
                  <li key={person.userId} className="flex justify-between gap-2 py-1">
                    <span className="text-[var(--admin-text)]">{person.name || person.email}</span>
                    <span className="text-[var(--admin-text-muted)]">
                      {t(`student.encadrant.agenda.platform.status.${
                        person.response === 'ACCEPTED'
                          ? 'confirmed'
                          : person.response === 'DECLINED'
                            ? 'cancelled'
                            : 'pending'
                      }`)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {error ? (
              <p className="agenda-form__error mt-3" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              {event.showJoin ? (
                <AgendaMeetingJoinButton
                  portal="student"
                  mode="video"
                  meetingId={event.meetingId}
                  startAt={event.startAt}
                  title={event.title}
                  className={AGENDA_PRIMARY_BTN}
                >
                  <Video className="h-4 w-4" aria-hidden />
                  {t('student.encadrant.agenda.joinMeeting')}
                </AgendaMeetingJoinButton>
              ) : null}
              {event.canRespond ? (
                <>
                  <button
                    type="button"
                    className={AGENDA_GHOST_BTN}
                    disabled={busy}
                    onClick={() => void run(() => onRespond?.(event.id, 'ACCEPTED') ?? Promise.resolve({ ok: true }))}
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    {t('student.encadrant.agenda.platform.actions.accept')}
                  </button>
                  <button
                    type="button"
                    className={AGENDA_GHOST_BTN}
                    disabled={busy}
                    onClick={() => void run(() => onRespond?.(event.id, 'TENTATIVE') ?? Promise.resolve({ ok: true }))}
                  >
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {t('student.encadrant.agenda.platform.actions.tentative')}
                  </button>
                  <button
                    type="button"
                    className={AGENDA_GHOST_BTN}
                    disabled={busy}
                    onClick={() => void run(() => onRespond?.(event.id, 'DECLINED') ?? Promise.resolve({ ok: true }))}
                  >
                    {t('student.encadrant.agenda.platform.actions.decline')}
                  </button>
                </>
              ) : null}
              {event.canEdit ? (
                <>
                  <button
                    type="button"
                    className={AGENDA_GHOST_BTN}
                    onClick={() => onEdit?.(event)}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    {t('student.encadrant.agenda.platform.form.editTitle')}
                  </button>
                  <button
                    type="button"
                    className={AGENDA_GHOST_BTN}
                    disabled={busy}
                    onClick={() => void run(() => onDelete?.(event) ?? Promise.resolve({ ok: true }))}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    {t('student.encadrant.agenda.platform.actions.delete')}
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AgendaEventDetailModal;

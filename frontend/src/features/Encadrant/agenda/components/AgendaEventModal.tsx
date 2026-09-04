import { FunctionComponent, ReactNode, useEffect } from 'react';
import {
  Calendar,
  Clock,
  LucideIcon,
  MapPin,
  User,
  Video,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AGENDA_MODAL_BODY,
  AGENDA_MODAL_DETAILS_GRID,
  AGENDA_MODAL_FOOTER,
  AGENDA_MODAL_OVERLAY,
  AGENDA_MODAL_PANEL,
  AGENDA_MODAL_PRIMARY_ACTION,
} from '../constants/agendaLayout';
import { AgendaMeetingJoinButton, MeetingStatusBadge } from '../../../shared/meeting-room';
import { useEncadrantStudentProfileId } from '../../../shared/meeting-room/hooks/useEncadrantStudentProfileId';
import type { AgendaMeetingEvent } from '../types';

interface AgendaEventModalProps {
  event: AgendaMeetingEvent | null;
  onClose: () => void;
}

const DetailItem: FunctionComponent<{
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}> = ({ icon: Icon, label, children }) => (
  <div className="flex min-w-0 gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--admin-bg)] text-[var(--admin-text-secondary)]">
      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
    </div>
    <div className="min-w-0 flex-1">
      <p className="m-0 text-xs font-medium leading-4 text-[var(--admin-text-secondary)]">{label}</p>
      <div className="mt-0.5 text-sm font-medium leading-5 text-[var(--admin-text)]">{children}</div>
    </div>
  </div>
);

const AgendaEventModal: FunctionComponent<AgendaEventModalProps> = ({ event, onClose }) => {
  const { t } = useTranslation();
  const studentProfileId = useEncadrantStudentProfileId(event?.student);

  useEffect(() => {
    if (!event) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [event, onClose]);

  if (!event) return null;

  const LocationIcon = event.type === 'online' ? Video : MapPin;

  return (
    <div
      className={AGENDA_MODAL_OVERLAY}
      role="dialog"
      aria-modal="true"
      aria-labelledby="agenda-event-modal-title"
      onClick={onClose}
    >
      <div className={AGENDA_MODAL_PANEL} onClick={(e) => e.stopPropagation()}>
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-solid border-[var(--admin-border)] px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0 flex-1 pe-2">
            <h2
              id="agenda-event-modal-title"
              className="m-0 text-lg font-semibold leading-7 text-[var(--admin-text)] sm:text-xl"
            >
              {event.modalTitle}
            </h2>
            <p className="m-0 mt-1 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
              {t('encadrant.agenda.meetingWith', { name: event.student })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('encadrant.common.close')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--admin-text-secondary)] transition-colors hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text)]"
          >
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        </header>

        <div className={AGENDA_MODAL_BODY}>
          <div className={`${AGENDA_MODAL_DETAILS_GRID} pb-5`}>
            <DetailItem icon={Calendar} label={t('encadrant.agenda.modal.date')}>
              {event.fullDateLabel}
            </DetailItem>
            <DetailItem icon={Clock} label={t('encadrant.agenda.modal.timeDuration')}>
              {event.time} ({event.duration})
            </DetailItem>
            <DetailItem icon={LocationIcon} label={t('encadrant.agenda.modal.location')}>
              {event.locationLabel}
            </DetailItem>
            <DetailItem icon={User} label={t('encadrant.agenda.modal.status')}>
              <MeetingStatusBadge status={event.status} />
            </DetailItem>
          </div>

          <div className="border-t border-solid border-[var(--admin-border)] pt-5">
            <h3 className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)]">
              {t('encadrant.agenda.modal.description')}
            </h3>
            <p className="m-0 mt-2 text-sm font-normal leading-relaxed text-[var(--admin-text-secondary)]">
              {event.description}
            </p>
          </div>
        </div>

        <footer className={AGENDA_MODAL_FOOTER}>
          {event.showJoinMeeting && (
            <AgendaMeetingJoinButton
              portal="encadrant"
              mode="video"
              meetingId={event.meetingId}
              studentDisplayName={event.student}
              startAt={event.plannedStart}
              studentProfileId={studentProfileId}
              title={event.modalTitle}
              className={AGENDA_MODAL_PRIMARY_ACTION}
            >
              <Video className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {t('encadrant.agenda.joinMeeting')}
            </AgendaMeetingJoinButton>
          )}
        </footer>
      </div>
    </div>
  );
};

export default AgendaEventModal;

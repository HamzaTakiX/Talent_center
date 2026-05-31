import { FunctionComponent, ReactNode, useEffect } from 'react';
import {
  Calendar,
  Check,
  Clock,
  LucideIcon,
  MapPin,
  Pencil,
  Trash2,
  User,
  Video,
  X,
} from 'lucide-react';
import {
  AGENDA_MODAL_BODY,
  AGENDA_MODAL_DETAILS_GRID,
  AGENDA_MODAL_FOOTER,
  AGENDA_MODAL_OVERLAY,
  AGENDA_MODAL_PANEL,
  AGENDA_MODAL_PRIMARY_ACTION,
  AGENDA_MODAL_SECONDARY_ACTION,
} from '../constants/agendaLayout';
import { AGENDA_STATUS_BADGE, AGENDA_STATUS_LABEL } from '../constants/agendaStyles';
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
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f4f4f5] text-[#525252]">
      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
    </div>
    <div className="min-w-0 flex-1">
      <p className="m-0 text-xs font-medium leading-4 text-[#717182]">{label}</p>
      <div className="mt-0.5 text-sm font-medium leading-5 text-[#171717]">{children}</div>
    </div>
  </div>
);

const AgendaEventModal: FunctionComponent<AgendaEventModalProps> = ({ event, onClose }) => {
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
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-solid border-[rgba(0,0,0,0.06)] px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0 flex-1 pr-2">
            <h2
              id="agenda-event-modal-title"
              className="m-0 text-lg font-semibold leading-7 text-[#171717] sm:text-xl"
            >
              {event.modalTitle}
            </h2>
            <p className="m-0 mt-1 text-sm font-normal leading-5 text-[#717182]">
              Meeting with {event.student}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#717182] transition-colors hover:bg-[#f4f4f5] hover:text-[#171717]"
          >
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        </header>

        <div className={AGENDA_MODAL_BODY}>
          <div className={`${AGENDA_MODAL_DETAILS_GRID} pb-5`}>
            <DetailItem icon={Calendar} label="Date">
              {event.fullDateLabel}
            </DetailItem>
            <DetailItem icon={Clock} label="Time & Duration">
              {event.time} ({event.duration})
            </DetailItem>
            <DetailItem icon={LocationIcon} label="Location">
              {event.locationLabel}
            </DetailItem>
            <DetailItem icon={User} label="Status">
              <span
                className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-4 ${AGENDA_STATUS_BADGE[event.status]}`}
              >
                {AGENDA_STATUS_LABEL[event.status]}
              </span>
            </DetailItem>
          </div>

          <div className="border-t border-solid border-[rgba(0,0,0,0.06)] pt-5">
            <h3 className="m-0 text-sm font-semibold leading-5 text-[#171717]">Description</h3>
            <p className="m-0 mt-2 text-sm font-normal leading-relaxed text-[#525252]">
              {event.description}
            </p>
          </div>
        </div>

        <footer className={AGENDA_MODAL_FOOTER}>
          {event.showJoinMeeting && (
            <button type="button" className={AGENDA_MODAL_PRIMARY_ACTION}>
              <Video className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              Join Meeting
            </button>
          )}
          <button type="button" className={AGENDA_MODAL_SECONDARY_ACTION}>
            <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Edit
          </button>
          <button type="button" className={AGENDA_MODAL_SECONDARY_ACTION}>
            <Check className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Mark as Done
          </button>
          <button type="button" className={AGENDA_MODAL_SECONDARY_ACTION}>
            <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AgendaEventModal;

import { FunctionComponent } from 'react';
import { FileText, MapPin, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AGENDA_EVENT_CARD_BTN } from '../constants/agendaLayout';
import { AGENDA_EVENT_STYLES } from '../constants/agendaStyles';
import type { AgendaMeetingEvent } from '../types';

interface AgendaEventCardProps {
  event: AgendaMeetingEvent;
  onClick?: () => void;
}

const AgendaEventCard: FunctionComponent<AgendaEventCardProps> = ({ event, onClick }) => {
  const { t } = useTranslation();
  const styles = AGENDA_EVENT_STYLES[event.type];
  const DurationIcon = event.type === 'online' ? Video : MapPin;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${AGENDA_EVENT_CARD_BTN} ${styles.card}`}
      aria-label={t('encadrant.agenda.meetingWith', { name: `${event.title} · ${event.student}` })}
    >
      <FileText
        className="pointer-events-none absolute end-2 top-2 h-3.5 w-3.5 text-[var(--admin-text-muted)]"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="pointer-events-none pe-4 text-xs font-semibold tabular-nums leading-4 text-[var(--admin-text)]">
        {event.time}
      </span>
      <span className="pointer-events-none text-sm font-semibold leading-5 text-[var(--admin-text)]">
        {event.student}
      </span>
      <span className="pointer-events-none text-xs font-normal leading-4 text-[var(--admin-text-secondary)]">
        {event.title}
      </span>
      <span
        className={`pointer-events-none inline-flex items-center gap-1 text-xs font-medium leading-4 ${styles.duration}`}
      >
        <DurationIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
        {event.duration}
      </span>
    </button>
  );
};

export default AgendaEventCard;

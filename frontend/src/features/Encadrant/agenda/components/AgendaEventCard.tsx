import { FunctionComponent } from 'react';
import { FileText, MapPin, Video } from 'lucide-react';
import { AGENDA_EVENT_CARD_BTN } from '../constants/agendaLayout';
import { AGENDA_EVENT_STYLES } from '../constants/agendaStyles';
import type { AgendaMeetingEvent } from '../types';

interface AgendaEventCardProps {
  event: AgendaMeetingEvent;
  onClick?: () => void;
}

const AgendaEventCard: FunctionComponent<AgendaEventCardProps> = ({ event, onClick }) => {
  const styles = AGENDA_EVENT_STYLES[event.type];
  const DurationIcon = event.type === 'online' ? Video : MapPin;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${AGENDA_EVENT_CARD_BTN} ${styles.card}`}
      aria-label={`${event.title} with ${event.student} at ${event.time}`}
    >
      <FileText
        className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-[#9ca3af]"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="pointer-events-none pr-4 text-xs font-semibold tabular-nums leading-4 text-[#171717]">
        {event.time}
      </span>
      <span className="pointer-events-none text-sm font-semibold leading-5 text-[#171717]">
        {event.student}
      </span>
      <span className="pointer-events-none text-xs font-normal leading-4 text-[#525252]">
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

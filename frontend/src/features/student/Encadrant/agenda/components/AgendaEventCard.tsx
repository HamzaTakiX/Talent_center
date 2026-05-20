import { FunctionComponent } from 'react';
import { AlertCircle, Calendar, Clock, Users, Video } from 'lucide-react';
import type { AgendaEventItem } from '../types';
import { AGENDA_PRIMARY_BTN } from '../constants/agendaLayout';

interface AgendaEventCardProps {
  event: AgendaEventItem;
}

const priorityBadgeClass = {
  high: 'bg-red-50 text-red-700',
  medium: 'bg-orange-50 text-orange-700',
} as const;

const priorityLabel = {
  high: 'Priorité haute',
  medium: 'Priorité moyenne',
} as const;

const iconWrapByKind = {
  meeting: 'bg-[#eff6ff] text-[#2563eb]',
  deadline: 'bg-red-50 text-red-600',
  evaluation: 'bg-[#f3e8ff] text-[#9333ea]',
} as const;

const AgendaEventCard: FunctionComponent<AgendaEventCardProps> = ({ event }) => {
  const Icon =
    event.kind === 'meeting' ? Video : event.kind === 'deadline' ? AlertCircle : Users;

  return (
    <article className="relative flex min-w-0 flex-col gap-3 rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3.5 sm:flex-row sm:items-start sm:gap-4 sm:p-4">
      {event.priority ? (
        <span
          className={`absolute right-3 top-3 inline-flex rounded-full px-2.5 py-1 font-inter text-xs font-semibold leading-4 sm:right-4 sm:top-4 ${priorityBadgeClass[event.priority]}`}
        >
          {priorityLabel[event.priority]}
        </span>
      ) : null}

      <div className="flex min-w-0 flex-1 items-start gap-3 sm:pr-28">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${iconWrapByKind[event.kind]}`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 pr-2">
          <h3 className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)] sm:text-base">{event.title}</h3>
          <p className="m-0 mt-0.5 text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">{event.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-5 text-[var(--admin-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
              {event.dateLabel}
            </span>
            {event.timeLabel ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                {event.timeLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {event.actionLabel ? (
        <button type="button" className={`${AGENDA_PRIMARY_BTN} w-full shrink-0 sm:mt-8 sm:w-auto`}>
          <Video className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {event.actionLabel}
        </button>
      ) : null}
    </article>
  );
};

export default AgendaEventCard;

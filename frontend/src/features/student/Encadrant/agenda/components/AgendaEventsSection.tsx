import { FunctionComponent } from 'react';
import { agendaEventsCountLabel, agendaUpcomingEvents } from '../data/agendaMock';
import { AGENDA_SURFACE_CARD } from '../constants/agendaLayout';
import AgendaEventCard from './AgendaEventCard';

const AgendaEventsSection: FunctionComponent = () => (
  <section aria-label="Événements à venir" className={`${AGENDA_SURFACE_CARD} min-w-0`}>
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">
      <h2 className="m-0 font-inter text-lg font-bold leading-7 text-[var(--admin-text)]">Événements à venir</h2>
      <span className="inline-flex rounded-full border border-solid border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-2.5 py-1 font-inter text-xs font-medium leading-4 text-[#4b5563]">
        {agendaEventsCountLabel}
      </span>
    </div>

    <div className="flex flex-col gap-3 p-4 sm:gap-3.5 sm:p-5">
      {agendaUpcomingEvents.map((event) => (
        <AgendaEventCard key={event.id} event={event} />
      ))}
    </div>
  </section>
);

export default AgendaEventsSection;

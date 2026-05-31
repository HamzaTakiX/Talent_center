import { FunctionComponent, useMemo } from 'react';
import { AGENDA_LIST, AGENDA_LIST_DAY_GROUP } from '../constants/agendaLayout';
import { agendaMeetingsMock, agendaWeekDaysMock } from '../data';
import type { AgendaMeetingEvent } from '../types';
import AgendaEventCard from './AgendaEventCard';

interface AgendaListViewProps {
  searchQuery: string;
}

function filterEvents(events: AgendaMeetingEvent[], query: string): AgendaMeetingEvent[] {
  const q = query.trim().toLowerCase();
  if (!q) return events;
  return events.filter(
    (e) =>
      e.student.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.time.includes(q)
  );
}

const AgendaListView: FunctionComponent<AgendaListViewProps> = ({ searchQuery }) => {
  const filtered = useMemo(() => filterEvents(agendaMeetingsMock, searchQuery), [searchQuery]);

  const grouped = useMemo(() => {
    return agendaWeekDaysMock
      .map((day) => ({
        day,
        events: filtered.filter((e) => e.dayKey === day.key),
      }))
      .filter((g) => g.events.length > 0);
  }, [filtered]);

  if (grouped.length === 0) {
    return (
      <p className="m-0 py-8 text-center text-sm font-medium text-[#717182]">
        No meetings match your search.
      </p>
    );
  }

  return (
    <div className={AGENDA_LIST}>
      {grouped.map(({ day, events }) => (
        <section key={day.key} className={AGENDA_LIST_DAY_GROUP}>
          <h3 className="m-0 text-sm font-semibold leading-5 text-[#171717]">
            {day.dayShort} {day.dayNum}
          </h3>
          <div className="flex flex-col gap-2">
            {events.map((event) => (
              <AgendaEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default AgendaListView;

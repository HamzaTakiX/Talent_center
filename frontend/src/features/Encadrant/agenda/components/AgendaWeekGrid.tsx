import { FunctionComponent, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  AGENDA_ADD_DAY_BTN,
  AGENDA_DAY_BODY,
  AGENDA_DAY_COLUMN,
  AGENDA_DAY_COLUMN_HIGHLIGHT,
  AGENDA_DAY_HEADER,
  AGENDA_WEEK_GRID,
  AGENDA_WEEK_SCROLL,
} from '../constants/agendaLayout';
import { agendaMeetingsMock, agendaWeekDaysMock } from '../data';
import type { AgendaMeetingEvent, AgendaWeekDay } from '../types';
import AgendaEventCard from './AgendaEventCard';
import AgendaEventModal from './AgendaEventModal';

interface AgendaWeekGridProps {
  searchQuery: string;
}

function filterEvents(events: AgendaMeetingEvent[], query: string): AgendaMeetingEvent[] {
  const q = query.trim().toLowerCase();
  if (!q) return events;
  return events.filter(
    (e) =>
      e.student.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.modalTitle.toLowerCase().includes(q) ||
      e.time.includes(q)
  );
}

const DayColumn: FunctionComponent<{
  day: AgendaWeekDay;
  events: AgendaMeetingEvent[];
  onEventClick: (event: AgendaMeetingEvent) => void;
}> = ({ day, events, onEventClick }) => (
  <div className={`${AGENDA_DAY_COLUMN} ${day.highlighted ? AGENDA_DAY_COLUMN_HIGHLIGHT : ''}`}>
    <div className={AGENDA_DAY_HEADER}>
      <div className="flex min-w-0 flex-col">
        <span
          className={`text-[11px] font-medium uppercase leading-4 ${day.highlighted ? 'text-[#2563eb]' : 'text-[#717182]'}`}
        >
          {day.dayShort}
        </span>
        <span
          className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums ${
            day.highlighted ? 'bg-[#3b82f6] text-white' : 'text-[#171717]'
          }`}
        >
          {day.dayNum}
        </span>
      </div>
      <button type="button" className={AGENDA_ADD_DAY_BTN} aria-label={`Add meeting on ${day.dayShort} ${day.dayNum}`}>
        <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
    <div className={AGENDA_DAY_BODY}>
      {events.map((event) => (
        <AgendaEventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
      ))}
    </div>
  </div>
);

const AgendaWeekGrid: FunctionComponent<AgendaWeekGridProps> = ({ searchQuery }) => {
  const [selectedEvent, setSelectedEvent] = useState<AgendaMeetingEvent | null>(null);

  const filtered = useMemo(() => filterEvents(agendaMeetingsMock, searchQuery), [searchQuery]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, AgendaMeetingEvent[]> = {};
    for (const day of agendaWeekDaysMock) {
      map[day.key] = [];
    }
    for (const event of filtered) {
      if (map[event.dayKey]) {
        map[event.dayKey].push(event);
      }
    }
    return map;
  }, [filtered]);

  return (
    <>
      <div className={AGENDA_WEEK_SCROLL}>
        <div className={AGENDA_WEEK_GRID}>
          {agendaWeekDaysMock.map((day) => (
            <DayColumn
              key={day.key}
              day={day}
              events={eventsByDay[day.key] ?? []}
              onEventClick={setSelectedEvent}
            />
          ))}
        </div>
      </div>
      <AgendaEventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
};

export default AgendaWeekGrid;

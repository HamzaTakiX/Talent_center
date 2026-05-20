import { FunctionComponent, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { agendaCalendarConfig, agendaLegendItems } from '../data/agendaMock';
import { AGENDA_SURFACE_CARD } from '../constants/agendaLayout';
import { buildCalendarGrid, CALENDAR_WEEKDAYS } from '../utils/buildCalendarGrid';

const AgendaCalendarCard: FunctionComponent = () => {
  const { monthLabel, year, monthIndex } = agendaCalendarConfig;
  const [selectedDay, setSelectedDay] = useState(agendaCalendarConfig.selectedDay);

  const weeks = useMemo(() => buildCalendarGrid(year, monthIndex), [year, monthIndex]);

  return (
    <section aria-label="Calendrier" className={`${AGENDA_SURFACE_CARD} min-w-0`}>
      <div className="border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">
        <h2 className="m-0 font-inter text-lg font-bold leading-7 text-[var(--admin-text)]">Calendrier</h2>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-5">
        <div className="rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-bg-elevated)] hover:text-[var(--admin-text)]"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <span className="font-inter text-sm font-semibold leading-5 text-[var(--admin-text)] sm:text-base">
              {monthLabel} {year}
            </span>
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-bg-elevated)] hover:text-[var(--admin-text)]"
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {CALENDAR_WEEKDAYS.map((day) => (
              <span
                key={day}
                className="py-1 text-center font-inter text-[11px] font-medium leading-4 text-[var(--admin-text-muted)] sm:text-xs"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {weeks.flat().map((day, index) => {
              if (day === null) {
                return <span key={`empty-${index}`} className="aspect-square" aria-hidden />;
              }
              const isSelected = day === selectedDay;
              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-lg font-inter text-[13px] font-medium leading-none transition-colors sm:text-sm ${
                    isSelected
                      ? 'bg-[#030213] text-white'
                      : 'text-[var(--admin-text)] hover:bg-[var(--admin-bg-elevated)]'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`${day} ${monthLabel} ${year}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="m-0 mb-3 font-inter text-sm font-semibold leading-5 text-[var(--admin-text)]">Légende</h3>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {agendaLegendItems.map((item) => (
              <li key={item.id} className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dotClassName}`} aria-hidden />
                <span className="font-inter text-sm leading-5 text-[#4b5563]">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AgendaCalendarCard;

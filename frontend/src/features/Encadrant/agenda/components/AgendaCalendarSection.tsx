import { FunctionComponent, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, LayoutGrid, List, Search } from 'lucide-react';
import {
  AGENDA_FILTER_BTN,
  AGENDA_MONTH_NAV,
  AGENDA_MONTH_NAV_BTN,
  AGENDA_SEARCH_INPUT,
  AGENDA_SEARCH_ROW,
  AGENDA_SEARCH_WRAP,
  AGENDA_SECTION_CARD,
  AGENDA_TOOLBAR_ROW,
  AGENDA_VIEW_TOGGLE,
  AGENDA_VIEW_TOGGLE_BTN,
  AGENDA_VIEW_TOGGLE_BTN_ACTIVE,
  AGENDA_VIEW_TOGGLE_BTN_INACTIVE,
} from '../constants/agendaLayout';
import { agendaMonthLabel } from '../data';
import type { AgendaViewMode } from '../types';
import AgendaListView from './AgendaListView';
import AgendaWeekGrid from './AgendaWeekGrid';

const AgendaCalendarSection: FunctionComponent = () => {
  const [viewMode, setViewMode] = useState<AgendaViewMode>('week');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className={AGENDA_SECTION_CARD} aria-label="Calendar">
      <div className={AGENDA_TOOLBAR_ROW}>
        <div className={AGENDA_VIEW_TOGGLE} role="group" aria-label="Calendar view">
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`${AGENDA_VIEW_TOGGLE_BTN} ${
              viewMode === 'week' ? AGENDA_VIEW_TOGGLE_BTN_ACTIVE : AGENDA_VIEW_TOGGLE_BTN_INACTIVE
            }`}
            aria-pressed={viewMode === 'week'}
          >
            <LayoutGrid className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Week
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`${AGENDA_VIEW_TOGGLE_BTN} ${
              viewMode === 'list' ? AGENDA_VIEW_TOGGLE_BTN_ACTIVE : AGENDA_VIEW_TOGGLE_BTN_INACTIVE
            }`}
            aria-pressed={viewMode === 'list'}
          >
            <List className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            List
          </button>
        </div>

        <div className={AGENDA_MONTH_NAV}>
          <button type="button" className={AGENDA_MONTH_NAV_BTN} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
          <span className="min-w-[6.5rem] px-1 text-center text-sm font-medium capitalize leading-5 text-[#171717] sm:min-w-[7rem] sm:text-base">
            {agendaMonthLabel}
          </span>
          <button type="button" className={AGENDA_MONTH_NAV_BTN} aria-label="Next month">
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <div className={AGENDA_SEARCH_ROW}>
        <div className={AGENDA_SEARCH_WRAP}>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student or meeting title..."
            className={AGENDA_SEARCH_INPUT}
          />
        </div>
        <button type="button" className={AGENDA_FILTER_BTN} aria-label="Filter meetings">
          <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      {viewMode === 'week' ? (
        <AgendaWeekGrid searchQuery={searchQuery} />
      ) : (
        <AgendaListView searchQuery={searchQuery} />
      )}
    </section>
  );
};

export default AgendaCalendarSection;

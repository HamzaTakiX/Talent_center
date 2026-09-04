import { ChangeEvent, FunctionComponent, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, LayoutGrid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminSearchInput } from '../../../admin/ui';
import {
  AGENDA_FILTER_BTN,
  AGENDA_MONTH_NAV,
  AGENDA_MONTH_NAV_BTN,
  AGENDA_SEARCH_ROW,
  AGENDA_SECTION_CARD,
  AGENDA_TOOLBAR_ROW,
  AGENDA_VIEW_TOGGLE,
  AGENDA_VIEW_TOGGLE_BTN,
  AGENDA_VIEW_TOGGLE_BTN_ACTIVE,
  AGENDA_VIEW_TOGGLE_BTN_INACTIVE,
} from '../constants/agendaLayout';
import { agendaMonthLabel } from '../data';
import type { AgendaMeetingEvent, AgendaViewMode } from '../types';
import AgendaEventModal from './AgendaEventModal';
import AgendaListView from './AgendaListView';
import AgendaWeekGrid from './AgendaWeekGrid';

const AgendaCalendarSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<AgendaViewMode>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AgendaMeetingEvent | null>(null);

  return (
    <section className={AGENDA_SECTION_CARD} aria-label={t('encadrant.agenda.calendarAria')}>
      <div className={AGENDA_TOOLBAR_ROW}>
        <div className={AGENDA_VIEW_TOGGLE} role="group" aria-label={t('encadrant.agenda.viewModeAria')}>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`${AGENDA_VIEW_TOGGLE_BTN} ${
              viewMode === 'week' ? AGENDA_VIEW_TOGGLE_BTN_ACTIVE : AGENDA_VIEW_TOGGLE_BTN_INACTIVE
            }`}
            aria-pressed={viewMode === 'week'}
          >
            <LayoutGrid className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {t('encadrant.agenda.views.week')}
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
            {t('encadrant.agenda.views.list')}
          </button>
        </div>

        <div className={AGENDA_MONTH_NAV}>
          <button type="button" className={AGENDA_MONTH_NAV_BTN} aria-label={t('encadrant.agenda.prevMonth')}>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} aria-hidden />
          </button>
          <span className="min-w-[6.5rem] px-1 text-center text-sm font-medium capitalize leading-5 text-[var(--admin-text)] sm:min-w-[7rem] sm:text-base">
            {agendaMonthLabel}
          </span>
          <button type="button" className={AGENDA_MONTH_NAV_BTN} aria-label={t('encadrant.agenda.nextMonth')}>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <div className={AGENDA_SEARCH_ROW}>
        <AdminSearchInput
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder={t('encadrant.common.searchStudent')}
          aria-label={t('encadrant.common.searchStudent')}
          containerClassName="min-w-0 flex-1"
        />
        <button type="button" className={AGENDA_FILTER_BTN} aria-label={t('encadrant.common.filter')}>
          <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      {viewMode === 'week' ? (
        <AgendaWeekGrid searchQuery={searchQuery} onEventClick={setSelectedEvent} />
      ) : (
        <AgendaListView searchQuery={searchQuery} onEventClick={setSelectedEvent} />
      )}

      <AgendaEventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </section>
  );
};

export default AgendaCalendarSection;

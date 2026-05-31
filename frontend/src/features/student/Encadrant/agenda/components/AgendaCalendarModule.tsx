import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import {
  AGENDA_CATEGORY_CLASS,
  AGENDA_CATEGORY_DOT_CLASS,
  AGENDA_LEGEND_CATEGORIES,
} from '../constants/eventCategories';
import { AGENDA_GLASS_CARD } from '../constants/agendaLayout';
import type { AgendaCalendarView, AgendaPlatformEvent } from '../types';
import { getAgendaLocale } from '../utils/calendarLocale';

interface AgendaCalendarModuleProps {
  loading: boolean;
  view: AgendaCalendarView;
  onViewChange: (view: AgendaCalendarView) => void;
  rangeStart: Date;
  onRangeChange: (date: Date) => void;
  shiftRange: (delta: number) => void;
  goToday: () => void;
  eventsByDay: Map<string, AgendaPlatformEvent[]>;
  timelineEvents: AgendaPlatformEvent[];
  onSelectEvent: (event: AgendaPlatformEvent) => void;
  formatDateKey: (d: Date) => string;
  startOfWeek: (d: Date) => Date;
}

const VIEWS: AgendaCalendarView[] = ['month', 'week', 'day', 'timeline'];

const AgendaCalendarModule: FunctionComponent<AgendaCalendarModuleProps> = ({
  loading,
  view,
  onViewChange,
  rangeStart,
  shiftRange,
  goToday,
  eventsByDay,
  timelineEvents,
  onSelectEvent,
  formatDateKey,
  startOfWeek,
}) => {
  const { t, i18n } = useTranslation();
  const locale = getAgendaLocale(i18n.language);
  const todayKey = formatDateKey(new Date());

  const periodLabel = useMemo(() => {
    if (view === 'day') {
      return rangeStart.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (view === 'week') {
      const end = new Date(rangeStart);
      end.setDate(end.getDate() + 6);
      return `${rangeStart.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return rangeStart.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }, [view, rangeStart, locale]);

  const monthCells = useMemo(() => {
    const year = rangeStart.getFullYear();
    const month = rangeStart.getMonth();
    const first = new Date(year, month, 1);
    const startPad = (first.getDay() + 6) % 7;
    const cells: { date: Date; inMonth: boolean }[] = [];
    const start = new Date(year, month, 1 - startPad);
    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      cells.push({ date, inMonth: date.getMonth() === month });
    }
    return cells;
  }, [rangeStart]);

  const weekCells = useMemo(() => {
    const start = startOfWeek(rangeStart);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [rangeStart, startOfWeek]);

  const weekdayLabels = useMemo(() => {
    const base = startOfWeek(new Date(2024, 0, 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(locale, { weekday: 'short' });
    });
  }, [locale, startOfWeek]);

  const dayEvents = useMemo(() => {
    const key = formatDateKey(rangeStart);
    return eventsByDay.get(key) ?? [];
  }, [eventsByDay, rangeStart, formatDateKey]);

  const renderChip = (event: AgendaPlatformEvent) => (
    <button
      key={event.id}
      type="button"
      className={`student-agenda-event-chip ${AGENDA_CATEGORY_CLASS[event.category]}`}
      title={`${t(event.titleKey)} — ${new Date(event.startAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelectEvent(event);
      }}
    >
      {t(event.titleKey)}
    </button>
  );

  const renderDayBlock = (event: AgendaPlatformEvent) => (
    <button
      key={event.id}
      type="button"
      className={`student-agenda-day-block ${AGENDA_CATEGORY_CLASS[event.category]}`}
      onClick={() => onSelectEvent(event)}
    >
      <span className="text-xs font-semibold text-[var(--admin-text)]">{t(event.titleKey)}</span>
      <span className="text-[11px] text-[var(--admin-text-muted)]">
        {new Date(event.startAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
      </span>
    </button>
  );

  return (
    <motion.section {...fadeInUp} className={`${AGENDA_GLASS_CARD} student-agenda-glass min-w-0`}>
      <div className="student-agenda-calendar__toolbar">
        <div className="student-agenda-calendar__nav">
          <button type="button" className="admin-icon-btn" onClick={() => shiftRange(-1)} aria-label={t('student.encadrant.agenda.prevMonth')}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="student-agenda-calendar__period m-0">{periodLabel}</h3>
          <button type="button" className="admin-icon-btn" onClick={() => shiftRange(1)} aria-label={t('student.encadrant.agenda.nextMonth')}>
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" className="student-agenda-today-btn" onClick={goToday}>
            {t('student.encadrant.agenda.platform.calendar.today')}
          </button>
        </div>
        <div className="student-agenda-view-tabs" role="tablist">
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              className={`student-agenda-view-tab ${view === v ? 'is-active' : ''}`}
              onClick={() => onViewChange(v)}
            >
              {t(`student.encadrant.agenda.platform.calendar.views.${v}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="student-agenda-calendar__body">
        {loading ? (
          <div className="flex flex-col gap-3">
            <div className="student-agenda-skeleton h-8 w-48" />
            <div className="student-agenda-skeleton h-64 w-full" />
          </div>
        ) : view === 'month' ? (
          <>
            <div className="student-agenda-month-grid mb-1">
              {weekdayLabels.map((label) => (
                <span key={label} className="student-agenda-month-head">
                  {label}
                </span>
              ))}
            </div>
            <div className="student-agenda-month-grid">
              {monthCells.map(({ date, inMonth }) => {
                const key = formatDateKey(date);
                const list = eventsByDay.get(key) ?? [];
                const isToday = key === todayKey;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`student-agenda-month-cell ${!inMonth ? 'is-out' : ''} ${isToday ? 'is-today' : ''}`}
                    onClick={() => list[0] && onSelectEvent(list[0])}
                  >
                    <span className="student-agenda-month-cell__day">{date.getDate()}</span>
                    <span className="student-agenda-month-cell__events">
                      {list.slice(0, 2).map(renderChip)}
                      {list.length > 2 ? (
                        <span className="text-[10px] font-medium text-[var(--admin-text-muted)]">
                          +{list.length - 2}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : view === 'week' ? (
          <div className="student-agenda-week-grid">
            {weekCells.map((date) => {
              const key = formatDateKey(date);
              const list = eventsByDay.get(key) ?? [];
              const isToday = key === todayKey;
              return (
                <div key={key} className={`student-agenda-week-col ${isToday ? 'is-today' : ''}`}>
                  <div className="mb-2 flex items-baseline justify-between gap-1 px-0.5">
                    <span className="text-[10px] font-semibold uppercase text-[var(--admin-text-muted)]">
                      {date.toLocaleDateString(locale, { weekday: 'short' })}
                    </span>
                    <span className="text-sm font-bold text-[var(--admin-text)]">{date.getDate()}</span>
                  </div>
                  <div className="flex flex-col gap-1">{list.map(renderChip)}</div>
                </div>
              );
            })}
          </div>
        ) : view === 'day' ? (
          dayEvents.length === 0 ? (
            <StudentSearchEmptyState
              titleKey="student.encadrant.agenda.platform.empty.meetingsTitle"
              descriptionKey="student.encadrant.agenda.platform.empty.meetingsDesc"
              variant="inline"
            />
          ) : (
            <div className="student-agenda-day-list">{dayEvents.map(renderDayBlock)}</div>
          )
        ) : timelineEvents.length === 0 ? (
          <StudentSearchEmptyState
            titleKey="student.encadrant.agenda.platform.empty.meetingsTitle"
            descriptionKey="student.encadrant.agenda.platform.empty.meetingsDesc"
            variant="inline"
          />
        ) : (
          <div className="student-agenda-timeline">
            {timelineEvents.map((event, index) => (
              <button
                key={event.id}
                type="button"
                className="student-agenda-timeline-row"
                onClick={() => onSelectEvent(event)}
              >
                <div className="student-agenda-timeline-row__rail" aria-hidden>
                  <span className={`student-agenda-timeline-row__dot ${AGENDA_CATEGORY_DOT_CLASS[event.category]}`} />
                  {index < timelineEvents.length - 1 ? (
                    <span className="student-agenda-timeline-row__connector" />
                  ) : null}
                </div>
                <div className="student-agenda-timeline-row__card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-[var(--admin-text)]">{t(event.titleKey)}</span>
                    <span className="text-xs text-[var(--admin-text-muted)]">
                      {new Date(event.startAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="m-0 mt-1 text-xs text-[var(--admin-text-muted)]">{t(event.descriptionKey)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="student-agenda-legend">
          {AGENDA_LEGEND_CATEGORIES.map((cat) => (
            <span key={cat} className="student-agenda-legend__item">
              <span className={`student-agenda-legend__dot ${AGENDA_CATEGORY_DOT_CLASS[cat]}`} aria-hidden />
              {t(`student.encadrant.agenda.platform.categories.${cat}`)}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default AgendaCalendarModule;

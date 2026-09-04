import { FunctionComponent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardList,
  FileText,
  Flag,
  Moon,
  Plus,
  Search,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { AGENDA_CATEGORY_CLASS } from '../constants/eventCategories';
import type { AgendaCalendarView, AgendaPlatformEvent } from '../types';
import type { AgendaDaySegment } from '../utils/agendaRange';
import { getAgendaLocale } from '../utils/calendarLocale';
import AgendaCalendarSkeleton from './AgendaCalendarSkeleton';

interface AgendaCalendarModuleProps {
  loading: boolean;
  error?: string | null;
  view: AgendaCalendarView;
  onViewChange: (view: AgendaCalendarView) => void;
  rangeStart: Date;
  shiftRange: (delta: number) => void;
  goToday: () => void;
  eventsByDay: Map<string, AgendaDaySegment[]>;
  onSelectEvent: (event: AgendaPlatformEvent) => void;
  formatDateKey: (d: Date) => string;
  startOfWeek: (d: Date) => Date;
  onAddEvent?: () => void;
  onOpenAvailability?: () => void;
  onOpenSearch?: () => void;
  onCreateAt?: (start: Date) => void;
}

const MAIN_VIEWS: AgendaCalendarView[] = ['day', 'week', 'month'];
const DAY_START_HOUR = 0;
const DAY_END_HOUR = 24;
const HOUR_PX = 72;

const CATEGORY_ICON: Record<AgendaPlatformEvent['category'], FunctionComponent<{ className?: string }>> = {
  meeting: CalendarDays,
  deadline: Flag,
  evaluation: ClipboardList,
  milestone: Sparkles,
  admin: FileText,
  financial: Wallet,
  reminder: Bell,
  out_of_office: Moon,
  other: Circle,
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function eventTopFromClock(hours: number, minutes: number) {
  const minutesFromStart = (hours - DAY_START_HOUR) * 60 + minutes;
  return Math.max(0, (minutesFromStart / 60) * HOUR_PX);
}

function eventTopPx(start: Date) {
  const raw = eventTopFromClock(start.getHours(), start.getMinutes());
  const maxTop = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_PX - 48;
  return Math.min(Math.max(0, raw), maxTop);
}

function eventHeightPx(start: Date, end: Date) {
  const hours = Math.max(0.5, (end.getTime() - start.getTime()) / (60 * 60 * 1000));
  const top = eventTopPx(start);
  const maxHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_PX - top - 4;
  return Math.min(hours * HOUR_PX - 4, maxHeight);
}

function formatTimeRange(start: Date, end: Date, locale: string) {
  const startLabel = start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const endLabel = end.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return `${startLabel} – ${endLabel}`;
}

const AgendaCalendarModule: FunctionComponent<AgendaCalendarModuleProps> = ({
  loading,
  error,
  view,
  onViewChange,
  rangeStart,
  shiftRange,
  goToday,
  eventsByDay,
  onSelectEvent,
  formatDateKey,
  startOfWeek,
  onAddEvent,
  onOpenAvailability,
  onOpenSearch,
  onCreateAt,
}) => {
  const { t, i18n } = useTranslation();
  const locale = getAgendaLocale(i18n.language);
  const [now, setNow] = useState(() => new Date());
  const todayKey = formatDateKey(now);
  const hours = useMemo(
    () => Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i),
    [],
  );

  useEffect(() => {
    const tick = () => setNow(new Date());
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, 60_000);
    }, 60_000 - (Date.now() % 60_000));

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  const periodLabel = useMemo(() => {
    if (view === 'day') {
      return rangeStart.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (view === 'week') {
      const start = startOfWeek(rangeStart);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      if (start.getMonth() === end.getMonth()) {
        return start.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      }
      return `${start.toLocaleDateString(locale, { month: 'short' })} – ${end.toLocaleDateString(locale, { month: 'short', year: 'numeric' })}`;
    }
    return rangeStart.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }, [view, rangeStart, locale, startOfWeek]);

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

  const dayColumnDate = useMemo(
    () => new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate()),
    [rangeStart],
  );

  const nowLineTop = useMemo(() => {
    const currentHour = now.getHours();
    if (currentHour < DAY_START_HOUR || currentHour >= DAY_END_HOUR) return null;
    return eventTopFromClock(currentHour, now.getMinutes());
  }, [now]);

  const nowLabel = useMemo(
    () => now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    [now, locale],
  );

  const nowLineTopRef = useRef(nowLineTop);
  nowLineTopRef.current = nowLineTop;

  const centreOnCurrentTime = useCallback((node: HTMLDivElement | null) => {
    const top = nowLineTopRef.current;
    if (!node || top === null) return;
    node.scrollTop = Math.max(0, top - node.clientHeight / 2 + HOUR_PX / 2);
  }, []);

  const tzLabel = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat(locale, { timeZoneName: 'short' }).formatToParts(new Date());
      return parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
    } catch {
      return 'GMT';
    }
  }, [locale]);

  const handleSlotClick = useCallback(
    (date: Date, e: MouseEvent<HTMLDivElement>) => {
      if (!onCreateAt) return;
      const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
      const snapped = Math.round((y / HOUR_PX) * 60 / 15) * 15;
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      start.setMinutes(Math.max(0, Math.min(23 * 60 + 45, snapped)));
      onCreateAt(start);
    },
    [onCreateAt],
  );

  const renderTimedEvent = (segment: AgendaDaySegment, compact = false) => {
    const { event } = segment;
    const Icon = CATEGORY_ICON[event.category] ?? Circle;
    const top = eventTopPx(segment.start);
    const height = eventHeightPx(segment.start, segment.end);
    const people = event.participants.filter((p) => !p.isOrganizer).slice(0, 2);
    return (
      <button
        key={segment.key}
        type="button"
        className={`ofative-event-card ${AGENDA_CATEGORY_CLASS[event.category] ?? ''} ${compact ? 'is-compact' : ''}`}
        style={{ top, height: Math.max(height, 44) }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectEvent(event);
        }}
      >
        <span className="ofative-event-card__head">
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="ofative-event-card__title">{event.title}</span>
        </span>
        <span className="ofative-event-card__time">{formatTimeRange(segment.start, segment.end, locale)}</span>
        {!compact && height > 56 && people.length > 0 ? (
          <span className="ofative-event-card__avatars" aria-hidden>
            {people.map((person, index) => (
              <span
                key={person.userId}
                className={`ofative-event-card__av ${index === 1 ? 'ofative-event-card__av--2' : ''}`}
              >
                {initials(person.name || person.email)}
              </span>
            ))}
          </span>
        ) : null}
      </button>
    );
  };

  const renderTimeGrid = (days: Date[]) => (
    <div className="ofative-timegrid">
      <div className="ofative-timegrid__scroll" ref={centreOnCurrentTime}>
        <div
          className="ofative-timegrid__head"
          style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}
        >
          <div className="ofative-timegrid__tz">{tzLabel}</div>
          {days.map((date) => {
            const key = formatDateKey(date);
            const isToday = key === todayKey;
            return (
              <div key={key} className={`ofative-timegrid__dayhead ${isToday ? 'is-today' : ''}`}>
                <span className="ofative-timegrid__dow">
                  {date.toLocaleDateString(locale, { weekday: 'short' })}
                </span>
                <span className={`ofative-timegrid__dom ${isToday ? 'is-today' : ''}`}>{date.getDate()}</span>
              </div>
            );
          })}
        </div>
        <div
          className="ofative-timegrid__body"
          style={{
            gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))`,
            height: (DAY_END_HOUR - DAY_START_HOUR) * HOUR_PX,
          }}
        >
          <div className="ofative-timegrid__hours" aria-hidden>
            {hours.map((hour) => (
              <div key={hour} className="ofative-timegrid__hour" style={{ height: HOUR_PX }}>
                <span>
                  {new Date(2026, 0, 1, hour).toLocaleTimeString(locale, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
          {days.map((date) => {
            const key = formatDateKey(date);
            const timed = (eventsByDay.get(key) ?? []).filter((s) => !s.event.allDay);
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={`ofative-timegrid__col ${isToday ? 'is-today' : ''} ${onCreateAt ? 'is-createable' : ''}`}
                onClick={(e) => handleSlotClick(date, e)}
              >
                {hours.map((hour) => (
                  <div key={hour} className="ofative-timegrid__slot" style={{ height: HOUR_PX }} />
                ))}
                {timed.map((segment) => renderTimedEvent(segment, days.length === 1))}
                {isToday && nowLineTop !== null ? (
                  <div className="ofative-now-line" style={{ top: nowLineTop }}>
                    <span className="ofative-now-line__dot" aria-hidden />
                    <span className="ofative-now-line__label">{nowLabel}</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <motion.section {...fadeInUp} className="ofative-main-panel" aria-busy={loading}>
      <header className="ofative-toolbar">
        {loading ? (
          <>
            <div className="ofative-toolbar__nav" aria-hidden>
              <span className="student-agenda-skeleton h-[2.125rem] w-[2.125rem] rounded-lg" />
              <span className="student-agenda-skeleton mx-1 h-5 w-40 rounded-md" />
              <span className="student-agenda-skeleton h-[2.125rem] w-[2.125rem] rounded-lg" />
              <span className="student-agenda-skeleton h-[2.125rem] w-[4.5rem] rounded-lg" />
            </div>
            <div className="ofative-view-switch" aria-hidden>
              <span className="student-agenda-skeleton h-[2.125rem] w-14 rounded-lg" />
              <span className="student-agenda-skeleton h-[2.125rem] w-16 rounded-lg" />
              <span className="student-agenda-skeleton h-[2.125rem] w-14 rounded-lg" />
            </div>
            <div className="ofative-toolbar__actions" aria-hidden>
              <span className="student-agenda-skeleton h-[2.125rem] w-[2.125rem] rounded-lg" />
              <span className="student-agenda-skeleton h-[2.125rem] w-28 rounded-lg" />
              <span className="student-agenda-skeleton h-[2.125rem] w-24 rounded-lg" />
            </div>
          </>
        ) : (
          <>
            <div className="ofative-toolbar__nav">
              <button type="button" className="ofative-icon-btn" onClick={() => shiftRange(-1)} aria-label={t('student.encadrant.agenda.prevMonth')}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="ofative-toolbar__period">{periodLabel}</h2>
              <button type="button" className="ofative-icon-btn" onClick={() => shiftRange(1)} aria-label={t('student.encadrant.agenda.nextMonth')}>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button type="button" className="ofative-today-chip" onClick={goToday}>
                {t('student.encadrant.agenda.platform.calendar.today')}
              </button>
            </div>

            <div className="ofative-view-switch" role="tablist">
              {MAIN_VIEWS.map((v) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={view === v}
                  className={`ofative-view-switch__btn ${view === v ? 'is-active' : ''}`}
                  onClick={() => onViewChange(v)}
                >
                  {t(`student.encadrant.agenda.platform.ofative.views.${v}`)}
                </button>
              ))}
            </div>

            <div className="ofative-toolbar__actions">
              <button
                type="button"
                className="ofative-icon-btn"
                aria-label={t('student.encadrant.agenda.platform.ofative.search')}
                onClick={onOpenSearch}
              >
                <Search className="h-4 w-4" />
              </button>
              <button type="button" className="ofative-btn ofative-btn--ghost" onClick={onOpenAvailability}>
                {t('student.encadrant.agenda.platform.ofative.availability')}
              </button>
              <button type="button" className="ofative-btn ofative-btn--primary" onClick={onAddEvent}>
                <Plus className="h-4 w-4" aria-hidden />
                {t('student.encadrant.agenda.platform.ofative.addEvent')}
              </button>
            </div>
          </>
        )}
      </header>

      <div className="ofative-main-panel__body">
        {error ? (
          <p className="agenda-form__error ofative-toolbar-error" role="alert">
            {error.startsWith('student.') ? t(error) : error}
          </p>
        ) : null}
        {loading ? (
          <AgendaCalendarSkeleton
            view={view}
            days={view === 'day' ? [dayColumnDate] : weekCells}
            monthCells={monthCells}
            weekdayLabels={weekdayLabels}
            hours={hours}
            formatDateKey={formatDateKey}
            todayKey={todayKey}
            locale={locale}
            tzLabel={tzLabel}
            nowLineTop={nowLineTop}
            nowLabel={nowLabel}
            onScrollReady={centreOnCurrentTime}
          />
        ) : view === 'month' ? (
          <div className="ofative-month">
            <div className="ofative-month__weekdays">
              {weekdayLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="ofative-month__grid">
              {monthCells.map(({ date, inMonth }) => {
                const key = formatDateKey(date);
                const list = eventsByDay.get(key) ?? [];
                const isToday = key === todayKey;
                return (
                  <div
                    key={key}
                    className={`ofative-month__cell ${!inMonth ? 'is-out' : ''} ${isToday ? 'is-today' : ''} ${onCreateAt ? 'is-createable' : ''}`}
                    onClick={() => {
                      if (!onCreateAt) return;
                      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0, 0, 0);
                      onCreateAt(start);
                    }}
                  >
                    <span className={`ofative-month__daynum ${isToday ? 'is-today' : ''}`}>{date.getDate()}</span>
                    <div className="ofative-month__events">
                      {list.slice(0, 3).map((segment) => (
                        <button
                          key={segment.key}
                          type="button"
                          className={`ofative-month__chip ${AGENDA_CATEGORY_CLASS[segment.event.category] ?? ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(segment.event);
                          }}
                        >
                          {segment.event.title}
                        </button>
                      ))}
                      {list.length > 3 ? (
                        <span className="ofative-month__more">+{list.length - 3}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : view === 'week' ? (
          renderTimeGrid(weekCells)
        ) : (
          renderTimeGrid([dayColumnDate])
        )}
      </div>
    </motion.section>
  );
};

export default AgendaCalendarModule;

import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AGENDA_CATEGORY_CLASS } from '../constants/eventCategories';
import type { AgendaCalendarView, AgendaEventCategory } from '../types';

const HOUR_PX = 72;
const DAY_START_HOUR = 0;
const DAY_END_HOUR = 24;

interface TimedPlaceholder {
  day: number;
  hour: number;
  hours: number;
  category: AgendaEventCategory;
}

const WEEK_PLACEHOLDERS: TimedPlaceholder[] = [
  { day: 0, hour: 9, hours: 1, category: 'meeting' },
  { day: 1, hour: 10.5, hours: 1.5, category: 'evaluation' },
  { day: 2, hour: 14, hours: 1, category: 'milestone' },
  { day: 3, hour: 9, hours: 2, category: 'admin' },
  { day: 4, hour: 16, hours: 1, category: 'reminder' },
  { day: 5, hour: 11, hours: 1, category: 'deadline' },
];

const DAY_PLACEHOLDERS: TimedPlaceholder[] = [
  { day: 0, hour: 8, hours: 1, category: 'meeting' },
  { day: 0, hour: 10, hours: 1.5, category: 'evaluation' },
  { day: 0, hour: 13, hours: 1, category: 'admin' },
  { day: 0, hour: 15, hours: 2, category: 'milestone' },
  { day: 0, hour: 18, hours: 1, category: 'reminder' },
];

const MONTH_CHIP_CATEGORIES: AgendaEventCategory[] = [
  'meeting',
  'evaluation',
  'milestone',
  'admin',
  'reminder',
];

interface AgendaCalendarSkeletonProps {
  view: AgendaCalendarView;
  days: Date[];
  monthCells: { date: Date; inMonth: boolean }[];
  weekdayLabels: string[];
  hours: number[];
  formatDateKey: (d: Date) => string;
  todayKey: string;
  locale: string;
  tzLabel: string;
  nowLineTop: number | null;
  nowLabel: string;
  onScrollReady?: (node: HTMLDivElement | null) => void;
}

function PlaceholderEvent({ hour, hours, category }: Omit<TimedPlaceholder, 'day'>) {
  return (
    <div
      className={`ofative-event-card is-skeleton ${AGENDA_CATEGORY_CLASS[category] ?? ''}`}
      style={{ top: hour * HOUR_PX, height: Math.max(hours * HOUR_PX - 4, 44) }}
      aria-hidden
    >
      <span className="ofative-event-card__head">
        <span className="ofative-agenda-skel-line ofative-agenda-skel-line--title" />
      </span>
      <span className="ofative-agenda-skel-line ofative-agenda-skel-line--time" />
    </div>
  );
}

const AgendaCalendarSkeleton: FunctionComponent<AgendaCalendarSkeletonProps> = ({
  view,
  days,
  monthCells,
  weekdayLabels,
  hours,
  formatDateKey,
  todayKey,
  locale,
  tzLabel,
  nowLineTop,
  nowLabel,
  onScrollReady,
}) => {
  const { t } = useTranslation();
  const timed = view === 'day' ? DAY_PLACEHOLDERS : WEEK_PLACEHOLDERS;

  const loadingLabel = t('student.encadrant.agenda.platform.ofative.loadingCalendar');

  if (view === 'month') {
    return (
      <div className="ofative-month" role="status" aria-busy="true" aria-live="polite" aria-label={loadingLabel}>
        <span className="ofative-agenda-loading-label">{loadingLabel}</span>
        <div className="ofative-month__weekdays">
          {weekdayLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="ofative-month__grid" aria-hidden>
          {monthCells.map(({ date, inMonth }) => {
            const key = formatDateKey(date);
            const isToday = key === todayKey;
            const day = date.getDate();
            const showChips = inMonth && (day % 5 === 1 || day % 5 === 3);
            const chipCount = day % 7 === 0 ? 2 : 1;
            return (
              <div
                key={key}
                className={`ofative-month__cell ${!inMonth ? 'is-out' : ''} ${isToday ? 'is-today' : ''}`}
              >
                <span className={`ofative-month__daynum ${isToday ? 'is-today' : ''}`}>{day}</span>
                {showChips ? (
                  <div className="ofative-month__events">
                    {Array.from({ length: chipCount }, (_, i) => {
                      const category = MONTH_CHIP_CATEGORIES[(day + i) % MONTH_CHIP_CATEGORIES.length];
                      return (
                        <span
                          key={`${key}-${i}`}
                          className={`ofative-month__chip is-skeleton ${AGENDA_CATEGORY_CLASS[category] ?? ''}`}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="ofative-timegrid" role="status" aria-busy="true" aria-live="polite" aria-label={loadingLabel}>
      <span className="ofative-agenda-loading-label">{loadingLabel}</span>
      <div className="ofative-timegrid__scroll" ref={onScrollReady}>
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
          aria-hidden
        >
          <div className="ofative-timegrid__hours">
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
          {days.map((date, dayIndex) => {
            const key = formatDateKey(date);
            const isToday = key === todayKey;
            return (
              <div key={key} className={`ofative-timegrid__col ${isToday ? 'is-today' : ''}`}>
                {hours.map((hour) => (
                  <div key={hour} className="ofative-timegrid__slot" style={{ height: HOUR_PX }} />
                ))}
                {timed
                  .filter((block) => block.day === dayIndex)
                  .map((block) => (
                    <PlaceholderEvent key={`${key}-${block.hour}`} {...block} />
                  ))}
                {isToday && nowLineTop !== null ? (
                  <div className="ofative-now-line" style={{ top: nowLineTop }}>
                    <span className="ofative-now-line__dot" />
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
};

export default AgendaCalendarSkeleton;

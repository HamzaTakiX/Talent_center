import { FunctionComponent, useMemo } from 'react';
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AGENDA_CATEGORY_DOT_CLASS, AGENDA_LEGEND_CATEGORIES } from '../constants/eventCategories';
import type { AgendaEventCategory } from '../types';
import { getAgendaLocale } from '../utils/calendarLocale';

interface AgendaOfativeSidebarProps {
  loading?: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  rangeStart: Date;
  onRangeChange: (date: Date) => void;
  focusedDay: Date;
  onSelectDay: (date: Date) => void;
  formatDateKey: (d: Date) => string;
  startOfWeek: (d: Date) => Date;
  /** Day-keyed buckets; only `.get(key)?.length` is used for the dots. */
  allEventsByDay?: Map<string, { length: number }>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  enabledCategories: Set<AgendaEventCategory>;
  onToggleCategory: (category: AgendaEventCategory) => void;
}

const AgendaOfativeSidebar: FunctionComponent<AgendaOfativeSidebarProps> = ({
  loading = false,
  collapsed,
  onToggleCollapsed,
  rangeStart,
  focusedDay,
  onRangeChange,
  onSelectDay,
  formatDateKey,
  startOfWeek,
  allEventsByDay,
  searchQuery,
  onSearchChange,
  enabledCategories,
  onToggleCategory,
}) => {
  const { t, i18n } = useTranslation();
  const locale = getAgendaLocale(i18n.language);
  const todayKey = formatDateKey(new Date());
  const selectedKey = formatDateKey(focusedDay);

  const miniMonth = useMemo(() => {
    const year = rangeStart.getFullYear();
    const month = rangeStart.getMonth();
    const first = new Date(year, month, 1);
    const startPad = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - startPad);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return { date, inMonth: date.getMonth() === month };
    });
  }, [rangeStart]);

  const weekdayLabels = useMemo(() => {
    const base = startOfWeek(new Date(2024, 0, 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d
        .toLocaleDateString(locale, { weekday: 'short' })
        .replace(/\./g, '')
        .slice(0, 2);
    });
  }, [locale, startOfWeek]);

  const shiftMiniMonth = (delta: number) => {
    const next = new Date(rangeStart);
    next.setMonth(next.getMonth() + delta);
    onRangeChange(next);
  };

  if (collapsed) {
    return (
      <aside className="ofative-sidebar ofative-sidebar--collapsed" aria-label={t('student.encadrant.agenda.calendar')}>
        <button
          type="button"
          className="ofative-sidebar__icon-btn"
          onClick={onToggleCollapsed}
          aria-label={t('student.encadrant.agenda.platform.ofative.expandSidebar')}
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="ofative-sidebar"
      aria-label={t('student.encadrant.agenda.calendar')}
      aria-busy={loading || undefined}
    >
      <div className="ofative-sidebar__brand">
        <div className="ofative-sidebar__brand-left">
          <span className="ofative-sidebar__logo" aria-hidden>
            O
          </span>
          <span className="ofative-sidebar__brand-name">{t('student.encadrant.agenda.platform.ofative.brand')}</span>
        </div>
        <button
          type="button"
          className="ofative-sidebar__icon-btn"
          onClick={onToggleCollapsed}
          aria-label={t('student.encadrant.agenda.platform.ofative.collapseSidebar')}
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <div className="ofative-mini-cal">
        <div className="ofative-mini-cal__head">
          <button type="button" className="ofative-sidebar__icon-btn" onClick={() => shiftMiniMonth(-1)} aria-label={t('student.encadrant.agenda.prevMonth')}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="ofative-mini-cal__label">
            {rangeStart.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
          </span>
          <button type="button" className="ofative-sidebar__icon-btn" onClick={() => shiftMiniMonth(1)} aria-label={t('student.encadrant.agenda.nextMonth')}>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="ofative-mini-cal__weekdays">
          {weekdayLabels.map((label, i) => (
            <span key={`${label}-${i}`}>{label}</span>
          ))}
        </div>
        <div className="ofative-mini-cal__grid">
          {miniMonth.map(({ date, inMonth }) => {
            const key = formatDateKey(date);
            const hasEvents = (allEventsByDay?.get(key)?.length ?? 0) > 0;
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            return (
              <button
                key={key}
                type="button"
                className={[
                  'ofative-mini-cal__day',
                  !inMonth ? 'is-out' : '',
                  hasEvents ? 'has-events' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectDay(date)}
                aria-current={isSelected ? 'date' : undefined}
              >
                <span
                  className={[
                    'ofative-mini-cal__day-num',
                    isSelected ? 'is-selected' : '',
                    isToday && !isSelected ? 'is-today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {date.getDate()}
                </span>
                {hasEvents ? <span className="ofative-mini-cal__dot" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="ofative-search" aria-hidden>
          <span className="student-agenda-skeleton h-9 w-full rounded-lg" />
        </div>
      ) : (
        <label className="ofative-search">
          <Search className="ofative-search__icon" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('student.encadrant.agenda.platform.ofative.searchPlaceholder')}
            className="ofative-search__input"
          />
        </label>
      )}

      <div className="ofative-calendars">
        <h3 className="ofative-calendars__title">{t('student.encadrant.agenda.platform.ofative.myCalendar')}</h3>
        {loading ? (
          <ul
            className="ofative-calendars__list"
            aria-hidden
          >
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <div className="ofative-calendars__item">
                  <span className="student-agenda-skeleton h-3.5 w-3.5 shrink-0 rounded" />
                  <span
                    className={`student-agenda-skeleton h-3 rounded-md ${i % 2 === 0 ? 'w-28' : 'w-20'}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="ofative-calendars__list">
            {AGENDA_LEGEND_CATEGORIES.map((cat) => {
              const checked = enabledCategories.has(cat);
              return (
                <li key={cat}>
                  <label className="ofative-calendars__item">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleCategory(cat)}
                      className="sr-only"
                    />
                    <span
                      className={`ofative-calendars__check ${AGENDA_CATEGORY_DOT_CLASS[cat]} ${checked ? 'is-on' : ''}`}
                      aria-hidden
                    />
                    <span className="ofative-calendars__label">
                      {t(`student.encadrant.agenda.platform.categories.${cat}`)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default AgendaOfativeSidebar;

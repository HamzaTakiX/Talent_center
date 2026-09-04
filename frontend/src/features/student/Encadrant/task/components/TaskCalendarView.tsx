import { FunctionComponent, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AGENDA_CATEGORY_CLASS } from '../../agenda/constants/eventCategories';
import { addDays, formatDateKey, startOfDay, startOfWeek } from '../../agenda/utils/agendaRange';
import { getAgendaLocale } from '../../agenda/utils/calendarLocale';
import type { AgendaEventCategory } from '../../agenda/types';
import type { StudentPlatformTask, TaskCategory } from '../types';

type TaskCalendarRange = 'day' | 'week' | 'month';

interface TaskCalendarViewProps {
  tasks: StudentPlatformTask[];
  onSelectTask: (id: string) => void;
  onOpenSearch?: () => void;
}

const RANGE_VIEWS: TaskCalendarRange[] = ['day', 'week', 'month'];

const TASK_TO_AGENDA_CATEGORY: Record<TaskCategory, AgendaEventCategory> = {
  internship: 'milestone',
  reports: 'evaluation',
  meetings: 'meeting',
  documents: 'reminder',
  administrative: 'admin',
  srf: 'financial',
};

function parseDueDate(value: string): Date | null {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

const TaskCalendarView: FunctionComponent<TaskCalendarViewProps> = ({
  tasks,
  onSelectTask,
  onOpenSearch,
}) => {
  const { t, i18n } = useTranslation();
  const locale = getAgendaLocale(i18n.language);
  const [range, setRange] = useState<TaskCalendarRange>('month');

  const initialCursor = useMemo(() => {
    const first = [...tasks]
      .map((task) => parseDueDate(task.dueAt))
      .filter((date): date is Date => Boolean(date))
      .sort((a, b) => a.getTime() - b.getTime())[0];
    return first ?? new Date();
  }, [tasks]);

  const [cursor, setCursor] = useState(initialCursor);
  const todayKey = formatDateKey(new Date());

  const tasksByDay = useMemo(() => {
    const map = new Map<string, StudentPlatformTask[]>();
    tasks.forEach((task) => {
      const list = map.get(task.dueAt) ?? [];
      list.push(task);
      map.set(task.dueAt, list);
    });
    return map;
  }, [tasks]);

  const monthCells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startPad = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - startPad);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return { date, inMonth: date.getMonth() === month };
    });
  }, [cursor]);

  const weekCells = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [cursor]);

  const dayColumn = useMemo(() => startOfDay(cursor), [cursor]);

  const weekdayLabels = useMemo(() => {
    const base = startOfWeek(new Date(2024, 0, 1));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      return date.toLocaleDateString(locale, { weekday: 'short' });
    });
  }, [locale]);

  const periodLabel = useMemo(() => {
    if (range === 'day') {
      return cursor.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    if (range === 'week') {
      const start = startOfWeek(cursor);
      const end = addDays(start, 6);
      if (start.getMonth() === end.getMonth()) {
        return start.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      }
      return `${start.toLocaleDateString(locale, { month: 'short' })} – ${end.toLocaleDateString(locale, { month: 'short', year: 'numeric' })}`;
    }
    return cursor.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }, [range, cursor, locale]);

  const shiftRange = (delta: number) => {
    if (range === 'day') {
      setCursor(addDays(cursor, delta));
      return;
    }
    if (range === 'week') {
      setCursor(addDays(cursor, delta * 7));
      return;
    }
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  };

  const renderTaskChip = (task: StudentPlatformTask) => (
    <button
      key={task.id}
      type="button"
      className={`ofative-month__chip ${AGENDA_CATEGORY_CLASS[TASK_TO_AGENDA_CATEGORY[task.category]]}`}
      onClick={() => onSelectTask(task.id)}
      title={`${t(task.titleKey)} · ${task.progress}%`}
    >
      {t(task.titleKey)}
    </button>
  );

  const renderDayColumn = (date: Date, compact: boolean) => {
    const key = formatDateKey(date);
    const dayTasks = tasksByDay.get(key) ?? [];
    const isToday = key === todayKey;
    const limit = compact ? 6 : 12;
    const visible = dayTasks.slice(0, limit);

    return (
      <div
        key={key}
        className={`student-task-rangegrid__col ${isToday ? 'is-today' : ''}`}
      >
        <div className={`ofative-timegrid__dayhead ${isToday ? 'is-today' : ''}`}>
          <span className="ofative-timegrid__dow">
            {date.toLocaleDateString(locale, { weekday: 'short' })}
          </span>
          <span className={`ofative-timegrid__dom ${isToday ? 'is-today' : ''}`}>{date.getDate()}</span>
        </div>
        <div className="student-task-rangegrid__tasks">
          {visible.map(renderTaskChip)}
          {dayTasks.length > limit ? (
            <span className="ofative-month__more">+{dayTasks.length - limit}</span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="ofative-agenda student-task-calendar">
      <section className="ofative-main-panel">
        <header className="ofative-toolbar">
          <div className="ofative-toolbar__nav">
            <button
              type="button"
              className="ofative-icon-btn"
              onClick={() => shiftRange(-1)}
              aria-label={t('student.encadrant.agenda.prevMonth')}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="ofative-toolbar__period">{periodLabel}</h2>
            <button
              type="button"
              className="ofative-icon-btn"
              onClick={() => shiftRange(1)}
              aria-label={t('student.encadrant.agenda.nextMonth')}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button type="button" className="ofative-today-chip" onClick={() => setCursor(new Date())}>
              {t('student.encadrant.agenda.platform.calendar.today')}
            </button>
          </div>

          <div className="ofative-view-switch" role="tablist">
            {RANGE_VIEWS.map((view) => (
              <button
                key={view}
                type="button"
                role="tab"
                aria-selected={range === view}
                className={`ofative-view-switch__btn ${range === view ? 'is-active' : ''}`}
                onClick={() => setRange(view)}
              >
                {t(`student.encadrant.agenda.platform.ofative.views.${view}`)}
              </button>
            ))}
          </div>

          <div className="ofative-toolbar__actions">
            <button
              type="button"
              className="ofative-icon-btn"
              onClick={onOpenSearch}
              aria-label={t('student.encadrant.agenda.platform.ofative.search')}
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="ofative-main-panel__body">
          {range === 'month' ? (
            <div className="ofative-month">
              <div className="ofative-month__weekdays">
                {weekdayLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="ofative-month__grid">
                {monthCells.map(({ date, inMonth }) => {
                  const key = formatDateKey(date);
                  const dayTasks = tasksByDay.get(key) ?? [];
                  const isToday = key === todayKey;
                  const visible = dayTasks.slice(0, 3);

                  return (
                    <div
                      key={key}
                      className={`ofative-month__cell ${!inMonth ? 'is-out' : ''} ${isToday ? 'is-today' : ''} ${dayTasks.length ? 'has-tasks' : ''}`}
                    >
                      <span className={`ofative-month__daynum ${isToday ? 'is-today' : ''}`}>
                        {date.getDate()}
                      </span>
                      <div className="ofative-month__events">{visible.map(renderTaskChip)}</div>
                      {dayTasks.length > 3 ? (
                        <span className="ofative-month__more">+{dayTasks.length - 3}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : range === 'week' ? (
            <div
              className="student-task-rangegrid"
              style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
            >
              {weekCells.map((date) => renderDayColumn(date, true))}
            </div>
          ) : (
            <div className="student-task-rangegrid student-task-rangegrid--day">
              {renderDayColumn(dayColumn, false)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TaskCalendarView;

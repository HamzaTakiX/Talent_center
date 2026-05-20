import { FunctionComponent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import AdminEmptyState from '../../../ui/AdminEmptyState';
import type { CalendarViewMode, SupervisionMeetingListItem } from '../types/supervisionMeeting';
import { meetingStatusMeta } from '../utils/meetingStatusMeta';
import MeetingStatusBadge from './MeetingStatusBadge';
import MeetingsCalendarSkeleton from './MeetingsCalendarSkeleton';
import { fadeInUp } from '../../../dashboard/ui/animations';

interface MeetingsCalendarPanelProps {
  events: SupervisionMeetingListItem[];
  loading?: boolean;
  view: CalendarViewMode;
  onViewChange: (v: CalendarViewMode) => void;
  rangeStart: Date;
  onRangeChange: (d: Date) => void;
}

function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

const MeetingsCalendarPanel: FunctionComponent<MeetingsCalendarPanelProps> = ({
  events,
  loading,
  view,
  onViewChange,
  rangeStart,
  onRangeChange,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'en' ? 'en-GB' : 'fr-FR';

  const weekdayLabels = useMemo(() => {
    const base = startOfWeek(new Date(2024, 0, 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(locale, { weekday: 'short' });
    });
  }, [locale]);

  const monthLabel = rangeStart.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, SupervisionMeetingListItem[]>();
    for (const e of events) {
      if (!e.plannedStart) continue;
      const key = e.plannedStart.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [events]);

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
  }, [rangeStart]);

  const dayEvents = useMemo(() => {
    const key = formatDateKey(rangeStart);
    return (eventsByDay.get(key) ?? []).sort((a, b) =>
      (a.plannedStart ?? '') > (b.plannedStart ?? '') ? 1 : -1,
    );
  }, [eventsByDay, rangeStart]);

  const agendaItems = useMemo(
    () =>
      [...events]
        .filter((e) => e.plannedStart)
        .sort((a, b) => (a.plannedStart! > b.plannedStart! ? 1 : -1)),
    [events],
  );

  const shiftRange = (delta: number) => {
    const d = new Date(rangeStart);
    if (view === 'day') {
      d.setDate(d.getDate() + delta);
    } else if (view === 'week') {
      d.setDate(d.getDate() + delta * 7);
    } else {
      d.setMonth(d.getMonth() + delta);
    }
    onRangeChange(d);
  };

  const todayKey = formatDateKey(new Date());

  const renderEventBlock = (ev: SupervisionMeetingListItem, compact = false) => {
    const meta = meetingStatusMeta[ev.status];
    return (
      <button
        key={ev.id}
        type="button"
        className={`admin-meetings-event-block ${meta?.blockClass ?? ''} ${compact ? 'admin-meetings-event-block--compact' : ''}`}
        onClick={() => navigate(`/admin/encadrant/meetings/${ev.id}`)}
        title={`${ev.title} — ${ev.encadrant} / ${ev.student}`}
      >
        <span className="admin-meetings-event-block__time">
          {ev.plannedStart
            ? new Date(ev.plannedStart).toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </span>
        <span className="admin-meetings-event-block__title">{ev.title}</span>
        {!compact ? (
          <span className="admin-meetings-event-block__meta">
            {ev.encadrant} · {ev.student || '—'}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <motion.section {...fadeInUp} className="admin-meetings-calendar-panel admin-card">
      <motion.div className="admin-meetings-calendar-panel__toolbar">
        <div className="admin-meetings-calendar-panel__nav">
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => shiftRange(-1)}
            aria-label={t('admin.common.actions.previous', { defaultValue: 'Previous' })}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="admin-meetings-calendar-panel__period capitalize">{monthLabel}</h3>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => shiftRange(1)}
            aria-label={t('admin.common.actions.next', { defaultValue: 'Next' })}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="admin-meetings-today-btn"
            onClick={() => onRangeChange(new Date())}
          >
            {t('admin.modules.meetings.views.today', { defaultValue: 'Today' })}
          </button>
        </div>
        <motion.div className="admin-meetings-view-tabs" role="tablist">
          {(['month', 'week', 'day', 'agenda'] as CalendarViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              className={`admin-meetings-view-tab ${view === v ? 'is-active' : ''}`}
              onClick={() => onViewChange(v)}
            >
              {t(`admin.modules.meetings.views.${v}`, { defaultValue: v })}
            </button>
          ))}
        </motion.div>
      </motion.div>

      {loading ? (
        <MeetingsCalendarSkeleton />
      ) : view === 'agenda' ? (
        <div className="admin-meetings-agenda admin-meetings-agenda--timeline">
          {agendaItems.length === 0 ? (
            <AdminEmptyState
              title={t('admin.modules.meetings.empty.agenda', {
                defaultValue: 'No upcoming agenda items',
              })}
              description={t('admin.modules.meetings.empty.agendaDesc', {
                defaultValue: 'Scheduled meetings will appear on this timeline.',
              })}
              icon={<CalendarDays className="h-10 w-10 text-[var(--admin-brand)]" strokeWidth={1.25} />}
            />
          ) : (
            agendaItems.map((item, index) => (
              <motion.button
                key={item.id}
                type="button"
                className="admin-meetings-agenda-row"
                onClick={() => navigate(`/admin/encadrant/meetings/${item.id}`)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ x: 4 }}
              >
                <motion.div className="admin-meetings-agenda-row__rail" aria-hidden>
                  <span className="admin-meetings-agenda-row__dot" />
                  {index < agendaItems.length - 1 ? (
                    <span className="admin-meetings-agenda-row__connector" />
                  ) : null}
                </motion.div>
                <div className="admin-meetings-agenda-time">
                  {new Date(item.plannedStart!).toLocaleTimeString(locale, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="admin-meetings-agenda-body">
                  <motion.div className="admin-meetings-agenda-body__head">
                    <span className="font-medium text-[var(--admin-text)]">{item.title}</span>
                    <MeetingStatusBadge status={item.status} />
                  </motion.div>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    {item.encadrant} · {item.student || '—'}
                  </p>
                  <p className="mt-1 text-[0.65rem] text-[var(--admin-text-secondary)]">
                    {t(`admin.modules.meetings.type.${item.meetingType}`, {
                      defaultValue: item.meetingType,
                    })}
                    {item.internshipType ? ` · ${item.internshipType}` : ''}
                  </p>
                </div>
              </motion.button>
            ))
          )}
        </div>
      ) : view === 'week' ? (
        <div className="admin-meetings-week-grid">
          {weekCells.map((date) => {
            const key = formatDateKey(date);
            const dayList = eventsByDay.get(key) ?? [];
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={`admin-meetings-week-col ${isToday ? 'is-today' : ''}`}
              >
                <div className="admin-meetings-week-col__head">
                  <span className="admin-meetings-week-col__weekday">
                    {date.toLocaleDateString(locale, { weekday: 'short' })}
                  </span>
                  <span className="admin-meetings-week-col__day">{date.getDate()}</span>
                </div>
                <div className="admin-meetings-week-col__events">
                  {dayList.map((ev) => renderEventBlock(ev, true))}
                </div>
              </div>
            );
          })}
        </div>
      ) : view === 'day' ? (
        <motion.div className="admin-meetings-day-view">
          <p className="admin-meetings-day-view__label">
            {rangeStart.toLocaleDateString(locale, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          {dayEvents.length === 0 ? (
            <AdminEmptyState
              title={t('admin.modules.meetings.empty.day', { defaultValue: 'No meetings this day' })}
              description={t('admin.modules.meetings.empty.dayDesc', {
                defaultValue: 'Pick another date or switch to month view.',
              })}
              icon={<CalendarDays className="h-10 w-10 text-[var(--admin-brand)]" strokeWidth={1.25} />}
            />
          ) : (
            <div className="admin-meetings-day-timeline">
              {dayEvents.map((ev, index) => (
                <motion.div key={ev.id} className="admin-meetings-day-slot" {...fadeInUp}>
                  <span className="admin-meetings-day-slot__time">
                    {new Date(ev.plannedStart!).toLocaleTimeString(locale, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="admin-meetings-day-slot__content">
                    {renderEventBlock(ev)}
                    {index < dayEvents.length - 1 ? (
                      <span className="admin-meetings-day-slot__connector" aria-hidden />
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <div className="admin-meetings-calendar">
          <div className="admin-meetings-calendar-header">
            {weekdayLabels.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="admin-meetings-calendar-grid">
            {monthCells.map(({ date, inMonth }) => {
              const key = formatDateKey(date);
              const dayEventsList = eventsByDay.get(key) ?? [];
              const isToday = key === todayKey;
              return (
                <div
                  key={key}
                  className={`admin-meetings-calendar-cell ${!inMonth ? 'is-other-month' : ''} ${isToday ? 'is-today' : ''}`}
                >
                  <span className="admin-meetings-calendar-cell__num">{date.getDate()}</span>
                  {dayEventsList.slice(0, 3).map((ev) => renderEventBlock(ev, true))}
                  {dayEventsList.length > 3 ? (
                    <span className="admin-meetings-calendar-more">
                      +{dayEventsList.length - 3}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default MeetingsCalendarPanel;

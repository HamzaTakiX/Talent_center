/**
 * Local-time helpers for the calendar grids.
 *
 * The backend speaks UTC instants; everything below converts to the browser's
 * local time exactly once, at render time, so a day cell always means a *local*
 * day. Bucketing on the raw ISO string would silently shift events across
 * midnight for anyone not on UTC.
 */

import type { AgendaCalendarView, AgendaPlatformEvent } from '../types';

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Monday-first, matching the existing grid headers. */
export function startOfWeek(date: Date): Date {
  const copy = startOfDay(date);
  return addDays(copy, -((copy.getDay() + 6) % 7));
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function formatDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The 6x7 grid a month view (and the mini calendar) actually paints. */
export function monthGridStart(date: Date): Date {
  return startOfWeek(startOfMonth(date));
}

/**
 * The window to request from the backend.
 *
 * Wider than the main grid on purpose: the mini calendar shows event dots for
 * the whole surrounding month, and a small margin means paging one week does
 * not always trigger a refetch flash.
 */
export function visibleWindow(view: AgendaCalendarView, rangeStart: Date): { start: Date; end: Date } {
  const gridStart =
    view === 'day' ? startOfDay(rangeStart)
      : view === 'week' ? startOfWeek(rangeStart)
        : monthGridStart(rangeStart);
  const gridEnd =
    view === 'day' ? addDays(gridStart, 1)
      : view === 'week' ? addDays(gridStart, 7)
        : addDays(gridStart, 42);

  const miniStart = monthGridStart(rangeStart);
  const miniEnd = addDays(miniStart, 42);

  return {
    start: new Date(Math.min(gridStart.getTime(), miniStart.getTime())),
    end: new Date(Math.max(gridEnd.getTime(), miniEnd.getTime())),
  };
}

/**
 * One event as it appears on a single day column.
 *
 * An event running 22:00 → 03:00 produces two segments, each clipped to its own
 * day, which is how it can be drawn on both days without either being wrong.
 */
export interface AgendaDaySegment {
  key: string;
  event: AgendaPlatformEvent;
  start: Date;
  end: Date;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

export function groupEventsByDay(events: AgendaPlatformEvent[]): Map<string, AgendaDaySegment[]> {
  const map = new Map<string, AgendaDaySegment[]>();

  for (const event of events) {
    const start = new Date(event.startAt);
    const end = new Date(event.endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;

    let cursor = startOfDay(start);
    // Half-open: an event ending exactly at midnight belongs to the day before.
    const lastDay = startOfDay(new Date(Math.max(end.getTime() - 1, start.getTime())));

    while (cursor.getTime() <= lastDay.getTime()) {
      const dayEnd = addDays(cursor, 1);
      const segmentStart = start > cursor ? start : cursor;
      const segmentEnd = end < dayEnd ? end : dayEnd;
      const key = formatDateKey(cursor);

      const list = map.get(key) ?? [];
      list.push({
        key: `${event.occurrenceId}@${key}`,
        event,
        start: segmentStart,
        end: segmentEnd,
        continuesBefore: segmentStart.getTime() > start.getTime(),
        continuesAfter: segmentEnd.getTime() < end.getTime(),
      });
      map.set(key, list);
      cursor = dayEnd;
    }
  }

  for (const list of map.values()) {
    list.sort((a, b) => a.start.getTime() - b.start.getTime());
  }
  return map;
}

/** Rounds to the nearest slot so a drag lands on a clean boundary. */
export function snapMinutes(minutes: number, step = 15): number {
  return Math.round(minutes / step) * step;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function durationMinutes(start: Date, end: Date): number {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 60_000));
}

/** `2026-09-07T10:00` — the value a `datetime-local` input expects. */
export function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function fromLocalInputValue(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

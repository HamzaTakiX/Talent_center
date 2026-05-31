import { useCallback, useEffect, useMemo, useState } from 'react';

import { agendaPlatformEvents } from '../data/agendaPlatformMock';
import type { AgendaCalendarView, AgendaPlatformEvent } from '../types';

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

export function useAgendaPlatform() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AgendaCalendarView>('month');
  const [rangeStart, setRangeStart] = useState(() => new Date(2026, 3, 1));
  const [selectedEvent, setSelectedEvent] = useState<AgendaPlatformEvent | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 720);
    return () => window.clearTimeout(timer);
  }, []);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, AgendaPlatformEvent[]>();
    for (const event of agendaPlatformEvents) {
      const key = event.startAt.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.startAt > b.startAt ? 1 : -1));
    }
    return map;
  }, []);

  const timelineEvents = useMemo(
    () => [...agendaPlatformEvents].sort((a, b) => (a.startAt > b.startAt ? 1 : -1)),
    [],
  );

  const shiftRange = useCallback(
    (delta: number) => {
      setRangeStart((current) => {
        const d = new Date(current);
        if (view === 'day') d.setDate(d.getDate() + delta);
        else if (view === 'week') d.setDate(d.getDate() + delta * 7);
        else d.setMonth(d.getMonth() + delta);
        return d;
      });
    },
    [view],
  );

  const goToday = useCallback(() => setRangeStart(new Date()), []);

  const upcomingPanelEvents = useMemo(() => {
    const now = new Date('2026-04-16');
    return timelineEvents
      .filter((e) => new Date(e.startAt) >= now && e.status !== 'cancelled')
      .slice(0, 6);
  }, [timelineEvents]);

  return {
    loading,
    view,
    setView,
    rangeStart,
    setRangeStart,
    selectedEvent,
    setSelectedEvent,
    eventsByDay,
    timelineEvents,
    shiftRange,
    goToday,
    upcomingPanelEvents,
    formatDateKey,
    startOfWeek,
  };
}

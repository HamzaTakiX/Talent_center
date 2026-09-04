import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import agendaApi from '../api/agendaApi';
import {
  AGENDA_CATEGORY_TO_TYPE,
  AGENDA_LEGEND_CATEGORIES,
} from '../constants/eventCategories';
import type {
  AgendaCalendarView,
  AgendaEventCategory,
  AgendaEventInput,
  AgendaMetadata,
  AgendaPerson,
  AgendaPlatformEvent,
  AgendaSeriesScope,
} from '../types';
import {
  addDays,
  browserTimezone,
  formatDateKey,
  groupEventsByDay,
  startOfDay,
  startOfWeek,
  visibleWindow,
} from '../utils/agendaRange';
import { isAbort, toAgendaError, type AgendaRequestError } from '../utils/agendaErrors';
import { useAgendaRealtime } from './useAgendaRealtime';

const ALL_CATEGORIES = new Set<AgendaEventCategory>(AGENDA_LEGEND_CATEGORIES);

/** Keep the first-load skeleton on screen long enough to paint, like workspace/task. */
const INITIAL_SKELETON_MS = 640;

export interface AgendaMutationResult {
  ok: boolean;
  error?: AgendaRequestError;
}

const OK: AgendaMutationResult = { ok: true };

export function useAgendaPlatform() {
  const [view, setView] = useState<AgendaCalendarView>('week');
  const [focusedDay, setFocusedDay] = useState(() => startOfDay(new Date()));
  const [rangeStart, setRangeStart] = useState(() => startOfWeek(new Date()));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [events, setEvents] = useState<AgendaPlatformEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [enabledCategories, setEnabledCategories] = useState<Set<AgendaEventCategory>>(
    () => new Set(ALL_CATEGORIES),
  );

  const [selectedEvent, setSelectedEvent] = useState<AgendaPlatformEvent | null>(null);
  const [metadata, setMetadata] = useState<AgendaMetadata | null>(null);
  const [contacts, setContacts] = useState<AgendaPerson[]>([]);

  /** Bumped by mutations and realtime frames to force a refetch of the window. */
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((n) => n + 1), []);

  const hasLoadedOnce = useRef(false);
  const window_ = useMemo(() => visibleWindow(view, rangeStart), [view, rangeStart]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Only send a type filter when something is actually deselected.
   *
   * Sending all nine every time would bloat the query string and defeat the
   * "no filter" fast path on the backend.
   */
  const typeFilter = useMemo(() => {
    if (enabledCategories.size === ALL_CATEGORIES.size) return undefined;
    return [...enabledCategories].map((c) => AGENDA_CATEGORY_TO_TYPE[c]);
  }, [enabledCategories]);

  useEffect(() => {
    const controller = new AbortController();
    const startedAt = Date.now();
    const isInitial = !hasLoadedOnce.current;
    let settleTimer: number | undefined;

    if (isInitial) setLoading(true);
    else setRefreshing(true);

    const settle = () => {
      if (controller.signal.aborted) return;
      setLoading(false);
      setRefreshing(false);
    };

    agendaApi
      .listRange(
        window_.start,
        window_.end,
        { types: typeFilter, q: debouncedQuery || undefined },
        controller.signal,
      )
      .then((result) => {
        setEvents(result.events);
        setError(null);
        hasLoadedOnce.current = true;
      })
      .catch((err) => {
        if (isAbort(err)) return;
        setError(toAgendaError(err, 'student.encadrant.agenda.platform.errors.load').message);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        const remaining = isInitial
          ? Math.max(0, INITIAL_SKELETON_MS - (Date.now() - startedAt))
          : 0;
        settleTimer = window.setTimeout(settle, remaining);
      });

    return () => {
      controller.abort();
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
    };
  }, [window_.start, window_.end, typeFilter, debouncedQuery, revision]);

  useEffect(() => {
    let active = true;
    Promise.all([agendaApi.metadata(), agendaApi.contacts()])
      .then(([meta, people]) => {
        if (!active) return;
        setMetadata(meta);
        setContacts(people);
      })
      .catch(() => {
        /* the form falls back to built-in defaults */
      });
    return () => {
      active = false;
    };
  }, []);

  /**
   * Refetch only when the change touches the window we are showing.
   *
   * An encadrant rescheduling something three months out should not repaint
   * the student's current week.
   */
  useAgendaRealtime({
    onEvent: useCallback(
      (frame) => {
        const start = new Date(frame.start).getTime();
        const end = new Date(frame.end).getTime();
        const overlaps = start < window_.end.getTime() && end > window_.start.getTime();
        if (overlaps || frame.action === 'deleted' || frame.action === 'cancelled') {
          refresh();
        }
      },
      [window_.start, window_.end, refresh],
    ),
  });

  const eventsByDay = useMemo(() => groupEventsByDay(events), [events]);

  const timelineEvents = useMemo(
    () => [...events].sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [events],
  );

  const upcomingPanelEvents = useMemo(() => {
    const now = Date.now();
    return timelineEvents
      .filter((e) => new Date(e.endAt).getTime() >= now && e.status !== 'cancelled')
      .slice(0, 6);
  }, [timelineEvents]);

  const floatingUpcoming = useMemo(
    () => upcomingPanelEvents.find((e) => e.showJoin) ?? upcomingPanelEvents[0] ?? null,
    [upcomingPanelEvents],
  );

  const shiftRange = useCallback(
    (delta: number) => {
      setRangeStart((current) => {
        if (view === 'day') return addDays(current, delta);
        if (view === 'week') return addDays(current, delta * 7);
        const next = new Date(current);
        next.setMonth(next.getMonth() + delta);
        return next;
      });
    },
    [view],
  );

  const goToday = useCallback(() => {
    const today = startOfDay(new Date());
    setFocusedDay(today);
    setRangeStart(
      view === 'week'
        ? startOfWeek(today)
        : view === 'month'
          ? new Date(today.getFullYear(), today.getMonth(), 1)
          : today,
    );
  }, [view]);

  const selectDay = useCallback((date: Date) => {
    const day = startOfDay(date);
    setFocusedDay(day);
    setRangeStart(day);
    setView('day');
  }, []);

  const toggleCategory = useCallback((category: AgendaEventCategory) => {
    setEnabledCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const run = useCallback(
    async (
      action: () => Promise<unknown>,
      fallbackKey: string,
    ): Promise<AgendaMutationResult> => {
      try {
        await action();
        refresh();
        return OK;
      } catch (err) {
        return { ok: false, error: toAgendaError(err, fallbackKey) };
      }
    },
    [refresh],
  );

  const createEvent = useCallback(
    (input: AgendaEventInput) =>
      run(
        () => agendaApi.create({ timezone: browserTimezone(), ...input }),
        'student.encadrant.agenda.platform.errors.create',
      ),
    [run],
  );

  const updateEvent = useCallback(
    (eventId: string, input: AgendaEventInput) =>
      run(
        () => agendaApi.update(eventId, input),
        'student.encadrant.agenda.platform.errors.update',
      ),
    [run],
  );

  const deleteEvent = useCallback(
    (eventId: string, options?: { scope?: AgendaSeriesScope; occurrenceStart?: string; cancel?: boolean }) =>
      run(
        () => agendaApi.remove(eventId, options),
        'student.encadrant.agenda.platform.errors.delete',
      ),
    [run],
  );

  const respond = useCallback(
    (eventId: string, value: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE') =>
      run(
        () => agendaApi.respond(eventId, value),
        'student.encadrant.agenda.platform.errors.respond',
      ),
    [run],
  );

  const addParticipants = useCallback(
    (eventId: string, userIds: number[]) =>
      run(
        () => agendaApi.addParticipants(eventId, userIds),
        'student.encadrant.agenda.platform.errors.participants',
      ),
    [run],
  );

  const removeParticipant = useCallback(
    (eventId: string, userId: number) =>
      run(
        () => agendaApi.removeParticipant(eventId, userId),
        'student.encadrant.agenda.platform.errors.participants',
      ),
    [run],
  );

  /**
   * Drag-and-drop / resize.
   *
   * Paints the new position immediately, then lets the server decide: any
   * rejection (permission, conflict, validation) rolls the window back by
   * refetching, so the backend stays authoritative.
   */
  const moveEvent = useCallback(
    async (
      event: AgendaPlatformEvent,
      start: Date,
      end: Date,
      options: { allowConflicts?: boolean } = {},
    ): Promise<AgendaMutationResult> => {
      const optimisticId = event.occurrenceId;
      const previous = events;

      setEvents((current) =>
        current.map((item) =>
          item.occurrenceId === optimisticId
            ? { ...item, startAt: start.toISOString(), endAt: end.toISOString() }
            : item,
        ),
      );

      try {
        await agendaApi.move(event.id, {
          start: start.toISOString(),
          end: end.toISOString(),
          scope: event.isRecurring ? 'this' : undefined,
          occurrenceStart: event.isRecurring ? event.occurrenceStart : undefined,
          allowConflicts: options.allowConflicts,
        });
        refresh();
        return OK;
      } catch (err) {
        setEvents(previous);
        return {
          ok: false,
          error: toAgendaError(err, 'student.encadrant.agenda.platform.errors.move'),
        };
      }
    },
    [events, refresh],
  );

  return {
    // window + navigation
    view,
    setView,
    rangeStart,
    setRangeStart,
    focusedDay,
    shiftRange,
    goToday,
    selectDay,
    sidebarCollapsed,
    setSidebarCollapsed,

    // data
    loading,
    refreshing,
    error,
    events,
    eventsByDay,
    /** Mini-calendar dots; same window as the grid, keyed by local day. */
    allEventsByDay: eventsByDay,
    timelineEvents,
    upcomingPanelEvents,
    floatingUpcoming,
    metadata,
    contacts,
    refresh,

    // filtering
    searchQuery,
    setSearchQuery,
    enabledCategories,
    toggleCategory,

    // selection
    selectedEvent,
    setSelectedEvent,

    // mutations
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    respond,
    addParticipants,
    removeParticipant,

    // shared date helpers, so children do not re-derive them
    formatDateKey,
    startOfWeek,
  };
}

export type AgendaPlatform = ReturnType<typeof useAgendaPlatform>;

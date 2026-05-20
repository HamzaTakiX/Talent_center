import { useCallback, useEffect, useState } from 'react';
import { adminSupervisionMeetingsApi } from '../../../api/supervisionMeetings';
import type {
  EncadrantMeetingOverview,
  MeetingAlert,
  MeetingsDashboardSummary,
  SupervisionMeetingListItem,
  SupervisionMeetingListParams,
} from '../types/supervisionMeeting';

export function useSupervisionMeetingsDashboard() {
  const [summary, setSummary] = useState<MeetingsDashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<MeetingAlert[]>([]);
  const [encadrantOverview, setEncadrantOverview] = useState<EncadrantMeetingOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminSupervisionMeetingsApi.dashboard();
      setSummary(data.summary);
      setAlerts(data.alerts);
      setEncadrantOverview(data.encadrantOverview);
    } catch {
      setError('Impossible de charger le tableau de bord des réunions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { summary, alerts, encadrantOverview, loading, error, reload: load };
}

export function useSupervisionMeetingsList(params: SupervisionMeetingListParams) {
  const [items, setItems] = useState<SupervisionMeetingListItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: 25, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminSupervisionMeetingsApi.list(params);
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, pagination, loading, reload: load };
}

export function useSupervisionMeetingsCalendar(start: string, end: string) {
  const [events, setEvents] = useState<SupervisionMeetingListItem[]>([]);
  const [conflicts, setConflicts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!start || !end) return;
    setLoading(true);
    adminSupervisionMeetingsApi
      .calendar(start, end)
      .then((data) => {
        setEvents(data.events as SupervisionMeetingListItem[]);
        setConflicts(data.conflicts);
      })
      .catch(() => {
        setEvents([]);
        setConflicts([]);
      })
      .finally(() => setLoading(false));
  }, [start, end]);

  return { events, conflicts, loading };
}

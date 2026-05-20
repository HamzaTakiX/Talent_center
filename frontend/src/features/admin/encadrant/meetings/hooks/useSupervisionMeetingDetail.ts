import { useCallback, useEffect, useState } from 'react';
import { adminSupervisionMeetingsApi } from '../../../api/supervisionMeetings';
import type { SupervisionMeetingDetail } from '../types/supervisionMeeting';

export function useSupervisionMeetingDetail(id: string | undefined) {
  const [meeting, setMeeting] = useState<SupervisionMeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminSupervisionMeetingsApi.detail(id);
      setMeeting(data);
    } catch {
      setError('Réunion introuvable');
      setMeeting(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return { meeting, loading, error, reload: load };
}

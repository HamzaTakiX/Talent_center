import { useCallback, useEffect, useState } from 'react';
import { meetingSessionsApi } from '../api/meetingSessionsApi';
import type { CollaborationContextPayload } from '../types';

export function useCollaborationContext() {
  const [context, setContext] = useState<CollaborationContextPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await meetingSessionsApi.getCollaborationContext();
      setContext(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collaboration context.');
      setContext(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { context, loading, error, reload };
}

import { useCallback, useEffect, useState } from 'react';
import type { StudentAnnouncementDetailResponse } from '../types';
import { studentAnnouncementsApi } from '../api/studentAnnouncementsApi';

export function useStudentAnnouncementDetail(id: string | undefined) {
  const [data, setData] = useState<StudentAnnouncementDetailResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await studentAnnouncementsApi.detail(id));
    } catch {
      setData(null);
      setError('load_failed');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

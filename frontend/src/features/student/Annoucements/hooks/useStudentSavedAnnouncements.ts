import { useCallback, useEffect, useState } from 'react';
import { parseAdminApiError } from '../../../admin/shared/utils/parseAdminApiError';
import { studentAnnouncementsApi } from '../api/studentAnnouncementsApi';
import type { FullAnnouncementItem } from '../types';
import { mapFeedItemToCard } from '../utils/mapStudentAnnouncement';

export function useStudentSavedAnnouncements(search?: string) {
  const [items, setItems] = useState<FullAnnouncementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentAnnouncementsApi.saved({ search: search || undefined });
      setItems(data.items.map(mapFeedItemToCard));
      setTotal(data.stats.total);
    } catch (err) {
      setError(parseAdminApiError(err, 'announcements_saved_load_failed').message);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const removeItemIfUnmarked = useCallback(
    (announcementId: string, state: { isSaved: boolean; isFavorited: boolean }) => {
      if (state.isSaved || state.isFavorited) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === announcementId
              ? { ...item, isSaved: state.isSaved, isFavorited: state.isFavorited }
              : item,
          ),
        );
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== announcementId));
      setTotal((prev) => Math.max(0, prev - 1));
    },
    [],
  );

  return { items, total, loading, error, refresh, removeItemIfUnmarked };
}

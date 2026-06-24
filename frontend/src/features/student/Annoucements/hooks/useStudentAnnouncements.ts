import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseAdminApiError } from '../../../admin/shared/utils/parseAdminApiError';
import { studentAnnouncementsApi } from '../api/studentAnnouncementsApi';
import type {
  FullAnnouncementItem,
  StudentAnnouncementFeedParams,
  StudentAnnouncementsStats,
} from '../types';
import { mapFeedItemToCard } from '../utils/mapStudentAnnouncement';

export function useStudentAnnouncements(filters: StudentAnnouncementFeedParams) {
  const [items, setItems] = useState<FullAnnouncementItem[]>([]);
  const [recommended, setRecommended] = useState<FullAnnouncementItem[]>([]);
  const [stats, setStats] = useState<StudentAnnouncementsStats>({
    total: 0,
    saved: 0,
    recent: 0,
    unread: 0,
  });
  const [typeOptions, setTypeOptions] = useState<{ code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentAnnouncementsApi.feed(filters);
      setItems(data.items.map(mapFeedItemToCard));
      setRecommended(data.recommended.map(mapFeedItemToCard));
      setStats(data.stats);
      setTypeOptions(data.types.map((t) => ({ code: t.code, name: t.name })));
    } catch (err) {
      setError(parseAdminApiError(err, 'announcements_load_failed').message);
      setItems([]);
      setRecommended([]);
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.priority, filters.date, filters.search, filters.limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recent = useMemo(() => items.slice(0, 5), [items]);

  return { items, recommended, recent, stats, typeOptions, loading, error, refresh };
}

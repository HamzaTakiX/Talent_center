import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminAnnouncementsApi } from '../../api/announcements';
import type {
  AnnouncementDashboardData,
  AnnouncementDetailResponse,
  AnnouncementListItem,
  AnnouncementListParams,
  AnnouncementTypeItem,
  PaginatedAnnouncements,
  ScheduledDashboardData,
} from '../types/announcement';

export function useAnnouncementsDashboard() {
  const [data, setData] = useState<AnnouncementDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminAnnouncementsApi.dashboard());
    } catch {
      setError('load_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useScheduledAnnouncementsDashboard() {
  const [data, setData] = useState<ScheduledDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await adminAnnouncementsApi.scheduledDashboard());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}

export function useAnnouncementsList(params?: AnnouncementListParams) {
  const [result, setResult] = useState<PaginatedAnnouncements>({
    items: [],
    page: 1,
    page_size: 15,
    total: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setResult(await adminAnnouncementsApi.list(params));
    } catch {
      setResult({ items: [], page: 1, page_size: 15, total: 0, total_pages: 0 });
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...result, loading, refresh };
}

export function useAnnouncementDetail(id: string | undefined) {
  const [data, setData] = useState<AnnouncementDetailResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await adminAnnouncementsApi.detail(id));
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

export function useAnnouncementTypes() {
  const [types, setTypes] = useState<AnnouncementTypeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAnnouncementsApi.types(true);
      setTypes(data);
    } catch {
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onChanged = () => void refresh();
    window.addEventListener('announcement-types-changed', onChanged);
    return () => window.removeEventListener('announcement-types-changed', onChanged);
  }, [refresh]);

  const activeTypes = useMemo(
    () => types.filter((tp) => tp.is_active),
    [types],
  );

  const typesByCode = useMemo(() => {
    const map = new Map<string, AnnouncementTypeItem>();
    for (const tp of types) map.set(tp.code, tp);
    return map;
  }, [types]);

  return { types, activeTypes, typesByCode, loading, refresh };
}

export function mapListItemToRow(item: AnnouncementListItem) {
  return {
    id: item.id,
    title: item.title,
    type: item.typeName || item.typeCode,
    typeCode: item.typeCode,
    status: item.status,
    priority: item.priority,
    date: item.published_at || item.publish_start_at || item.created_at,
    targetAudience: item.target_scope,
    views: item.view_count,
    engagement: item.engagementRate ?? 0,
    company: item.company_name,
    deadline: item.application_deadline,
  };
}

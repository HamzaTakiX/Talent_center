import { useCallback, useEffect, useState } from 'react';
import { adminAnnouncementsApi } from '../../api/announcements';
import type { AnnInsight } from '../components/AnnouncementsInsightsPanel';
import type { EngagementDashboardData } from '../types/engagementDashboard';

export function useEngagementDashboard() {
  const [data, setData] = useState<EngagementDashboardData | null>(null);
  const [insights, setInsights] = useState<AnnInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [engagement, insightRows] = await Promise.all([
        adminAnnouncementsApi.engagement(),
        adminAnnouncementsApi.insights(),
      ]);
      setData(engagement as unknown as EngagementDashboardData);
      setInsights((insightRows as AnnInsight[]) ?? []);
    } catch {
      setData(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, insights, loading, error, reload: load };
}

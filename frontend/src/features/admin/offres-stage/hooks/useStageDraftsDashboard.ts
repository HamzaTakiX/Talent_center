import { useCallback, useEffect, useMemo, useState } from 'react';
import { stageApi } from '../../../shared/api/stageApi';
import { parseAdminApiError } from '../../shared/utils/parseAdminApiError';
import { mapStageOfferToAdminRow } from '../../../shared/utils/stageMappers';
import type { InternshipOffer, InternshipOfferStat } from '../types';

async function fetchStatusTotal(status: string): Promise<number> {
  const result = await stageApi.list({ status, page_size: 1, page: 1 });
  return result.total;
}

function buildDraftStats(
  draftCount: number,
  pendingReviewCount: number,
  items: InternshipOffer[],
): InternshipOfferStat[] {
  const companies = new Set(items.map((o) => o.company)).size;
  const withoutDeadline = items.filter((o) => o.deadline === '—').length;

  return [
    {
      label: 'Total Drafts',
      labelKey: 'admin.kpi.offers.draftsPage.totalDrafts',
      value: String(draftCount + pendingReviewCount),
      icon: 'FileText',
    },
    {
      label: 'Pending Review',
      labelKey: 'admin.kpi.offers.draftsPage.pendingReview',
      value: String(pendingReviewCount),
      icon: 'Clock',
    },
    {
      label: 'Companies',
      labelKey: 'admin.kpi.offers.draftsPage.companies',
      value: String(companies),
      icon: 'Briefcase',
    },
    {
      label: 'Without Deadline',
      labelKey: 'admin.kpi.offers.draftsPage.withoutDeadline',
      value: String(withoutDeadline),
      icon: 'XCircle',
    },
  ];
}

export function useStageDraftsDashboard() {
  const [draftCount, setDraftCount] = useState(0);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [items, setItems] = useState<InternshipOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [draftTotal, pendingTotal, draftList, pendingList] = await Promise.all([
        fetchStatusTotal('DRAFT'),
        fetchStatusTotal('PENDING_REVIEW'),
        stageApi.list({ status: 'DRAFT', page_size: 100, page: 1 }),
        stageApi.list({ status: 'PENDING_REVIEW', page_size: 100, page: 1 }),
      ]);
      setDraftCount(draftTotal);
      setPendingReviewCount(pendingTotal);
      setItems(
        [...draftList.items, ...pendingList.items].map(mapStageOfferToAdminRow),
      );
    } catch (err) {
      setError(parseAdminApiError(err, 'offers_load_failed').message);
      setDraftCount(0);
      setPendingReviewCount(0);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stats = useMemo(
    () => buildDraftStats(draftCount, pendingReviewCount, items),
    [draftCount, pendingReviewCount, items],
  );

  return { stats, loading, error, refresh };
}

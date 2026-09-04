import { useCallback, useEffect, useMemo, useState } from 'react';
import { stageApi } from '../../../shared/api/stageApi';
import { parseAdminApiError } from '../../shared/utils/parseAdminApiError';
import {
  mapBackendStatusToUi,
  mapStageOfferToAdminRow,
  mapUiStatusToBackend,
  resolveMediaUrl,
} from '../../../shared/utils/stageMappers';
import type {
  StageAnalyticsDashboard,
  StageOfferDetail,
  StageOfferListParams,
} from '../../../shared/types/stageTypes';
import type { InternshipOffer, InternshipOfferStat, PopularOfferBrief } from '../types';
import {
  applyMutationToOfferList,
  deltaTotalForMutation,
  subscribeStageOfferDashboardRefresh,
  subscribeStageOfferMutations,
} from '../utils/stageOffersSync';

interface StatusCounts {
  draft: number;
  expired: number;
  closed: number;
  archived: number;
}

async function fetchStatusTotal(status: string): Promise<number> {
  const result = await stageApi.list({ status, page_size: 1, page: 1 });
  return result.total;
}

async function loadStatusCounts(): Promise<StatusCounts> {
  const [draft, pendingReview, expired, closed, archived] = await Promise.all([
    fetchStatusTotal('DRAFT'),
    fetchStatusTotal('PENDING_REVIEW'),
    fetchStatusTotal('EXPIRED'),
    fetchStatusTotal('CLOSED'),
    fetchStatusTotal('ARCHIVED'),
  ]);
  return {
    draft: draft + pendingReview,
    expired,
    closed,
    archived,
  };
}

function mapPopularOfferBrief(
  offer: StageAnalyticsDashboard['mostActiveOffers'][number],
): PopularOfferBrief {
  const logo = offer.company_logo_url?.trim();
  return {
    uuid: offer.uuid,
    title: offer.title,
    companyName: offer.company_name,
    companyLogoUrl: logo ? resolveMediaUrl(logo) : null,
    locationCity: offer.location_city ?? null,
    applicationDeadline: offer.application_deadline ?? null,
    viewCount: offer.view_count,
    applicationCount: offer.application_count,
  };
}

function buildStats(data: StageAnalyticsDashboard, counts: StatusCounts): InternshipOfferStat[] {
  const s = data.summary;
  const topOffer = data.mostActiveOffers?.[0];
  const hasTopOffer = Boolean(topOffer?.title?.trim());
  const popularOffer = hasTopOffer ? mapPopularOfferBrief(topOffer!) : undefined;

  return [
    {
      label: 'Acceptance Rate',
      labelKey: 'admin.kpi.offers.acceptanceRate',
      value: `${s.total_applications > 0 ? s.acceptance_rate : 0}%`,
      icon: 'TrendingUp',
    },
    {
      label: 'Active Offers',
      labelKey: 'admin.kpi.offers.activeOffers',
      statKey: 'activeOffers',
      value: String(s.open_offers),
      icon: 'CheckCircle',
    },
    {
      label: 'Expired Offers',
      labelKey: 'admin.kpi.offers.expiredOffers',
      statKey: 'expiredOffers',
      value: String(counts.expired),
      icon: 'XCircle',
    },
    {
      label: 'Draft Offers',
      labelKey: 'admin.kpi.offers.draftOffers',
      statKey: 'draftOffers',
      value: String(counts.draft),
      icon: 'FileText',
    },
    {
      label: 'Closed Offers',
      labelKey: 'admin.kpi.offers.closedOffers',
      statKey: 'closedOffers',
      value: String(counts.closed),
      icon: 'Clock',
    },
    {
      label: 'Archived Offers',
      labelKey: 'admin.kpi.offers.archivedOffers',
      statKey: 'archivedOffers',
      value: String(counts.archived),
      icon: 'Archive',
    },
    {
      label: 'Total Applications',
      labelKey: 'admin.kpi.offers.totalApplications',
      statKey: 'totalApplications',
      value: String(s.total_applications),
      icon: 'Users',
    },
    {
      label: 'Total Offers',
      labelKey: 'admin.kpi.offers.totalOffers',
      statKey: 'totalOffers',
      value: String(s.total_offers),
      icon: 'Briefcase',
    },
    {
      label: 'Most Popular',
      labelKey: 'admin.kpi.offers.mostPopular',
      value: hasTopOffer ? topOffer!.title : 'Not detected yet',
      valueKey: hasTopOffer ? undefined : 'admin.kpi.offers.notDetectedYet',
      icon: 'Award',
      popularOffer,
    },
  ];
}

function adjustStatusCountsForMutation(
  counts: StatusCounts,
  previousUiStatus: InternshipOffer['status'],
  nextUiStatus: InternshipOffer['status'] | null,
): StatusCounts {
  const next = { ...counts };

  const decrement = (key: keyof StatusCounts) => {
    next[key] = Math.max(0, next[key] - 1);
  };
  const increment = (key: keyof StatusCounts) => {
    next[key] += 1;
  };

  const uiToCountKey = (status: InternshipOffer['status']): keyof StatusCounts | null => {
    switch (status) {
      case 'Draft':
        return 'draft';
      case 'Expired':
        return 'expired';
      case 'Closed':
        return 'closed';
      case 'Archived':
        return 'archived';
      default:
        return null;
    }
  };

  const prevKey = uiToCountKey(previousUiStatus);
  const nextKey = nextUiStatus ? uiToCountKey(nextUiStatus) : null;

  if (prevKey) decrement(prevKey);
  if (nextKey) increment(nextKey);

  return next;
}

export function useStageDashboard() {
  const [data, setData] = useState<StageAnalyticsDashboard | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    draft: 0,
    expired: 0,
    closed: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    setError(null);
    try {
      const [dashboard, counts] = await Promise.all([
        stageApi.dashboard(),
        loadStatusCounts(),
      ]);
      setData(dashboard);
      setStatusCounts(counts);
    } catch (err) {
      setError(parseAdminApiError(err, 'dashboard_load_failed').message);
      if (!options?.silent) setData(null);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    return subscribeStageOfferDashboardRefresh(() => {
      void refresh({ silent: true });
    });
  }, [refresh]);

  useEffect(() => {
    return subscribeStageOfferMutations((event) => {
      setStatusCounts((prev) =>
        adjustStatusCountsForMutation(prev, event.previousUiStatus, event.nextUiStatus),
      );
      if (data && event.action === 'delete') {
        setData((prev) =>
          prev
            ? {
                ...prev,
                summary: {
                  ...prev.summary,
                  total_offers: Math.max(0, prev.summary.total_offers - 1),
                },
              }
            : prev,
        );
      }
    });
  }, [data]);

  const stats = useMemo(
    (): InternshipOfferStat[] => (data ? buildStats(data, statusCounts) : []),
    [data, statusCounts],
  );

  return { data, stats, loading, error, refresh };
}

interface StageOffersListOptions extends StageOfferListParams {
  listFilter?: 'all' | InternshipOffer['status'];
}

export function useStageOffersList(params?: StageOffersListOptions) {
  const [items, setItems] = useState<InternshipOffer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params?.page ?? 1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listFilter = params?.listFilter ?? 'all';

  const apiParams = useMemo(
    () => ({
      page,
      page_size: params?.page_size,
      status: params?.status,
      search: params?.search,
      ordering: params?.ordering,
    }),
    [page, params?.page_size, params?.status, params?.search, params?.ordering],
  );

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    setError(null);
    try {
      const result = await stageApi.list(apiParams);
      let rows = result.items.map(mapStageOfferToAdminRow);
      if (params?.search?.trim()) {
        const q = params.search.trim().toLowerCase();
        rows = rows.filter(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            o.company.toLowerCase().includes(q),
        );
      }
      setItems(rows);
      setTotal(result.total);
      setTotalPages(result.total_pages);
    } catch (err) {
      setError(parseAdminApiError(err, 'offers_load_failed').message);
      setItems([]);
      setTotal(0);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [apiParams, params?.search]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    return subscribeStageOfferMutations((event) => {
      setItems((prev) => {
        const next = applyMutationToOfferList(prev, event, listFilter);
        setTotal((totalPrev) => deltaTotalForMutation(prev, event, listFilter, totalPrev));
        return next;
      });
    });
  }, [listFilter]);

  useEffect(() => {
    return subscribeStageOfferDashboardRefresh(() => {
      void refresh({ silent: true });
    });
  }, [refresh]);

  return { items, total, page, setPage, totalPages, loading, error, refresh };
}

export function useStageOffersByStatus(uiStatus: 'all' | InternshipOffer['status'], search = '') {
  const backendStatus = uiStatus === 'all' ? undefined : mapUiStatusToBackend(uiStatus);
  return useStageOffersList({
    status: backendStatus,
    search,
    page_size: 100,
    listFilter: uiStatus,
  });
}

export function useStageDraftOffersList(search = '') {
  const [items, setItems] = useState<InternshipOffer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    setError(null);
    try {
      const [drafts, pendingReview] = await Promise.all([
        stageApi.list({ status: 'DRAFT', search, page_size: 100, page: 1 }),
        stageApi.list({ status: 'PENDING_REVIEW', search, page_size: 100, page: 1 }),
      ]);
      let rows = [...drafts.items, ...pendingReview.items].map(mapStageOfferToAdminRow);
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        rows = rows.filter(
          (o) => o.title.toLowerCase().includes(q) || o.company.toLowerCase().includes(q),
        );
      }
      setItems(rows);
      setTotal(drafts.total + pendingReview.total);
    } catch (err) {
      setError(parseAdminApiError(err, 'offers_load_failed').message);
      setItems([]);
      setTotal(0);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    return subscribeStageOfferMutations((event) => {
      setItems((prev) => {
        const next = applyMutationToOfferList(prev, event, 'Draft');
        setTotal((totalPrev) => deltaTotalForMutation(prev, event, 'Draft', totalPrev));
        return next;
      });
    });
  }, []);

  useEffect(() => {
    return subscribeStageOfferDashboardRefresh(() => {
      void refresh({ silent: true });
    });
  }, [refresh]);

  return { items, total, loading, error, refresh };
}

export function useStageOfferDetail(uuid: string | undefined) {
  const [data, setData] = useState<StageOfferDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(uuid));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;
    setLoading(true);
    setError(null);
    stageApi
      .detail(uuid)
      .then(setData)
      .catch((err) => {
        setError(parseAdminApiError(err, 'offer_not_found').message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [uuid]);

  return { data, loading, error };
}

export function useStageOfferCount(status: string) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    void stageApi.list({ status, page_size: 1, page: 1 }).then((r) => setCount(r.total));
  }, [status]);
  return count;
}

export { mapBackendStatusToUi, mapStageOfferToAdminRow };

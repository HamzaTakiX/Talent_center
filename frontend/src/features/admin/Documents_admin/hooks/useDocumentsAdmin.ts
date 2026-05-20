import { useCallback, useEffect, useState } from 'react';
import { adminDocumentsApi } from '../../api/documents';
import {
  filterMockRequests,
  getMockRequestDetail,
  MOCK_ANALYTICS,
  MOCK_DASHBOARD,
  MOCK_RESOURCES,
  MOCK_SLA_RULES,
  MOCK_TEMPLATES,
  MOCK_WORKFLOWS,
  DOCUMENT_TYPE_CONFIGS,
} from '../data/documentsMockData';
import type {
  AdministrativeResourceItem,
  DocumentListParams,
  DocumentRequestDetail,
  DocumentsAnalyticsData,
  DocumentsDashboardData,
  DocumentTemplateItem,
  DocumentTypeConfig,
  PaginatedDocumentRequests,
  SlaRuleItem,
  WorkflowDefinition,
} from '../types';

/** When the API succeeds but the DB is empty, keep charts/table usable with demo rows. */
function mergeDashboardWithDemo(api: DocumentsDashboardData): DocumentsDashboardData {
  const emptyRecent = !api.recentRequests?.length;
  const emptyCharts =
    !api.statusDistribution?.length && !api.reservationOccupancy?.length;

  if (!emptyRecent && !emptyCharts) return api;

  return {
    ...api,
    summary: emptyRecent
      ? MOCK_DASHBOARD.summary
      : {
          ...MOCK_DASHBOARD.summary,
          ...api.summary,
          avgProcessingHours:
            api.summary.avgProcessingHours || MOCK_DASHBOARD.summary.avgProcessingHours,
        },
    recentRequests: emptyRecent ? MOCK_DASHBOARD.recentRequests : api.recentRequests,
    statusDistribution: api.statusDistribution?.length
      ? api.statusDistribution
      : MOCK_DASHBOARD.statusDistribution,
    serviceWorkload: api.serviceWorkload?.length
      ? api.serviceWorkload
      : MOCK_DASHBOARD.serviceWorkload,
    reservationOccupancy: api.reservationOccupancy?.length
      ? api.reservationOccupancy
      : MOCK_DASHBOARD.reservationOccupancy,
    rejectionCauses: api.rejectionCauses?.length
      ? api.rejectionCauses
      : MOCK_DASHBOARD.rejectionCauses,
    insights: api.insights?.length ? api.insights : MOCK_DASHBOARD.insights,
  };
}

export function useDocumentsDashboard() {
  const [data, setData] = useState<DocumentsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiData = await adminDocumentsApi.dashboard();
      setData(mergeDashboardWithDemo(apiData));
    } catch {
      setData(MOCK_DASHBOARD);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useDocumentsRequestsList(params?: DocumentListParams) {
  const [result, setResult] = useState<PaginatedDocumentRequests>({
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
      setResult(await adminDocumentsApi.list(params));
    } catch {
      setResult(filterMockRequests(params));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...result, loading, refresh };
}

export function useDocumentRequestDetail(id: string | undefined) {
  const [data, setData] = useState<DocumentRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const detail = await adminDocumentsApi.detail(id);
        if (!cancelled) setData(detail);
      } catch {
        if (!cancelled) setData(getMockRequestDetail(id));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading };
}

export function useDocumentTypes() {
  const [items, setItems] = useState<DocumentTypeConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setItems(await adminDocumentsApi.types());
      } catch {
        setItems(DOCUMENT_TYPE_CONFIGS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { items, loading };
}

export function useDocumentWorkflows() {
  const [items, setItems] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setItems(await adminDocumentsApi.workflows());
      } catch {
        setItems(MOCK_WORKFLOWS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { items, loading };
}

export function useAdministrativeResources() {
  const [items, setItems] = useState<AdministrativeResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setItems(await adminDocumentsApi.resources());
      } catch {
        setItems(MOCK_RESOURCES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { items, loading };
}

export function useDocumentTemplates() {
  const [items, setItems] = useState<DocumentTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setItems(await adminDocumentsApi.templates());
      } catch {
        setItems(MOCK_TEMPLATES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { items, loading };
}

export function useSlaRules() {
  const [items, setItems] = useState<SlaRuleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setItems(await adminDocumentsApi.slaRules());
      } catch {
        setItems(MOCK_SLA_RULES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { items, loading };
}

export function useDocumentsAnalytics() {
  const [data, setData] = useState<DocumentsAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setData(await adminDocumentsApi.analytics());
      } catch {
        setData(MOCK_ANALYTICS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading };
}

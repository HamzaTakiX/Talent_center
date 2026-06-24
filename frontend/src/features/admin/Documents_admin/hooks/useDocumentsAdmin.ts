import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { adminDocumentsApi } from '../../api/documents';
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

function extractErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

const EMPTY_PAGINATION: PaginatedDocumentRequests = {
  items: [],
  page: 1,
  page_size: 15,
  total: 0,
  total_pages: 0,
};

export function useDocumentsDashboard() {
  const [data, setData] = useState<DocumentsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminDocumentsApi.dashboard());
    } catch (err) {
      setData(null);
      setError(extractErrorMessage(err));
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
  const [result, setResult] = useState<PaginatedDocumentRequests>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await adminDocumentsApi.list(params));
    } catch (err) {
      setResult(EMPTY_PAGINATION);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...result, loading, error, refresh };
}

export function useDocumentRequestDetail(id: string | undefined) {
  const [data, setData] = useState<DocumentRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await adminDocumentsApi.detail(id));
    } catch (err) {
      setData(null);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useDocumentTypes() {
  const [items, setItems] = useState<DocumentTypeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setItems(await adminDocumentsApi.types());
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { items, loading, error };
}

export function useDocumentWorkflows() {
  const [items, setItems] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setItems(await adminDocumentsApi.workflows());
      } catch {
        setItems([]);
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
        setItems([]);
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
        setItems([]);
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
        setItems([]);
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
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading };
}

export function useDocumentsWorkload() {
  const [items, setItems] = useState<DocumentsDashboardData['serviceWorkload']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminDocumentsApi.workload();
      setItems(data.items ?? []);
    } catch (err) {
      setItems([]);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, error, refresh };
}

export function useDocumentsReservations(date?: string) {
  const [occupancy, setOccupancy] = useState<DocumentsDashboardData['reservationOccupancy']>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminDocumentsApi.reservations(date ? { date } : undefined);
      setOccupancy(data.occupancy ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setOccupancy([]);
      setTotal(0);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { occupancy, total, loading, error, refresh };
}

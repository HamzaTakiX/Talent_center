import { useCallback, useEffect, useState } from 'react';
import { adminDocumentsApi } from '../../api/documents';
import { SERVICE_CATALOG_MOCK } from '../data/serviceCatalogDefaults';
import type { DocumentServiceCatalogItem, DocumentServiceWritePayload } from '../types/documentServiceCatalog';

export function useServiceCatalogList() {
  const [items, setItems] = useState<DocumentServiceCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminDocumentsApi.catalogList();
      setItems(list.length ? list : SERVICE_CATALOG_MOCK);
    } catch {
      setItems(SERVICE_CATALOG_MOCK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, refresh };
}

export function useServiceCatalogDetail(id: string | undefined) {
  const [data, setData] = useState<DocumentServiceCatalogItem | null>(null);
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
        const detail = await adminDocumentsApi.catalogDetail(id);
        if (!cancelled) setData(detail);
      } catch {
        const mock = SERVICE_CATALOG_MOCK.find((s) => s.id === id);
        if (!cancelled) setData(mock ?? null);
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

export async function saveServiceCatalog(
  id: string | undefined,
  payload: DocumentServiceWritePayload,
): Promise<DocumentServiceCatalogItem> {
  if (id) return adminDocumentsApi.catalogUpdate(id, payload);
  return adminDocumentsApi.catalogCreate(payload);
}

export async function seedServiceCatalog(): Promise<number> {
  try {
    const res = await adminDocumentsApi.catalogSeed();
    return res?.created ?? 0;
  } catch {
    return 0;
  }
}

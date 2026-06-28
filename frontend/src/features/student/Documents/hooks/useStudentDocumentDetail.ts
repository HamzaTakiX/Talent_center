import { useCallback, useEffect, useState } from 'react';
import { parseAdminApiError } from '../../../admin/shared/utils/parseAdminApiError';
import { studentDocumentsApi } from '../api/studentDocumentsApi';
import type { DocumentServiceCatalogItem } from '../types';

export function useStudentDocumentDetail(id: string | undefined) {
  const [item, setItem] = useState<DocumentServiceCatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) {
      setItem(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await studentDocumentsApi.catalogDetail(id);
      setItem(data);
    } catch (err) {
      setError(parseAdminApiError(err, 'document_detail_load_failed').message);
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { item, loading, error, refresh };
}

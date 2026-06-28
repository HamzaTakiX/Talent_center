import { useCallback, useEffect, useState } from 'react';
import { parseAdminApiError } from '../../../admin/shared/utils/parseAdminApiError';
import { studentDocumentsApi } from '../api/studentDocumentsApi';
import type { DocumentServiceCatalogItem, StudentDocumentsStats } from '../types';

export function useStudentDocuments() {
  const [catalog, setCatalog] = useState<DocumentServiceCatalogItem[]>([]);
  const [stats, setStats] = useState<StudentDocumentsStats>({
    total: 0,
    pending: 0,
    validated: 0,
    reserved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentDocumentsApi.overview();
      setCatalog(data.catalog);
      setStats(data.stats);
    } catch (err) {
      setError(parseAdminApiError(err, 'documents_load_failed').message);
      setCatalog([]);
      setStats({ total: 0, pending: 0, validated: 0, reserved: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { catalog, stats, loading, error, refresh };
};

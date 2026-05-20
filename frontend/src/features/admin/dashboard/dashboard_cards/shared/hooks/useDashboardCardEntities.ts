import { useCallback, useEffect, useState } from 'react';
import type { PaginatedListResponse } from '../../../../api/types';

const DASHBOARD_CARD_PAGE_SIZE = 500;

type ListParams = {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
};

export const useDashboardCardEntities = <T>(
  list: (params?: ListParams) => Promise<PaginatedListResponse<T>>,
) => {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await list({ page: 1, page_size: DASHBOARD_CARD_PAGE_SIZE });
      setItems(data.items);
      setTotal(data.total);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [list]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, total, loading, reload };
};

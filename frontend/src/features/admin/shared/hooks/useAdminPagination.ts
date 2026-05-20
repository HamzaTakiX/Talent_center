import { useEffect, useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 15;

export interface UseAdminPaginationResult<T> {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  paginatedItems: T[];
  totalItems: number;
  totalPages: number;
  resetPage: () => void;
}

/** Client-side pagination for in-memory row lists (filters, search). */
export function useAdminPagination<T>(
  items: T[],
  pageSize: number = DEFAULT_PAGE_SIZE,
): UseAdminPaginationResult<T> {
  const [page, setPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [items.length, pageSize]);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const resetPage = () => setPage(1);

  return {
    page: safePage,
    setPage,
    pageSize,
    paginatedItems,
    totalItems,
    totalPages,
    resetPage,
  };
}

export interface ServerPaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const DEFAULT_SERVER_PAGE_SIZE = DEFAULT_PAGE_SIZE;

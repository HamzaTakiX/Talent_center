import { useMemo, useState } from 'react';

export function useAdminListFilter<T>(
  rows: readonly T[],
  getSearchText: (row: T) => string[],
  matchFilter?: (row: T, filterValue: string) => boolean,
) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesFilter =
        filter === 'all' || !matchFilter || matchFilter(row, filter);
      if (!q) return matchesFilter;
      const matchesQuery = getSearchText(row).some((text) => text.toLowerCase().includes(q));
      return matchesFilter && matchesQuery;
    });
  }, [rows, query, filter, getSearchText, matchFilter]);

  return { query, setQuery, filter, setFilter, filtered };
}

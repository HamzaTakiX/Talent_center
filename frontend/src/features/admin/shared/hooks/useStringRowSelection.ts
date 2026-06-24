import { useCallback, useMemo, useState } from 'react';

export function useStringRowSelection(rowIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const visibleSet = useMemo(() => new Set(rowIds), [rowIds]);

  const selectedOnPage = useMemo(
    () => rowIds.filter((id) => selectedIds.has(id)),
    [rowIds, selectedIds],
  );

  const allOnPageSelected = rowIds.length > 0 && selectedOnPage.length === rowIds.length;
  const someOnPageSelected = selectedOnPage.length > 0 && !allOnPageSelected;

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllOnPage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (rowIds.every((id) => next.has(id))) {
        rowIds.forEach((id) => next.delete(id));
      } else {
        rowIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [rowIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const pruneSelection = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (visibleSet.has(id)) next.add(id);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [visibleSet]);

  return {
    selectedIds,
    selectedOnPage,
    selectedCount: selectedIds.size,
    allOnPageSelected,
    someOnPageSelected,
    toggleRow,
    toggleAllOnPage,
    clearSelection,
    pruneSelection,
    isSelected: (id: string) => selectedIds.has(id),
  };
}

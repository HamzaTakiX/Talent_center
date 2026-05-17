import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ADMIN_SEARCH_CATEGORY_ORDER,
  type AdminSearchGroup,
  type AdminSearchItem,
} from '../types';
import { scoreSearchItem } from '../utils/fuzzySearch';
import { getRecentSearches, getVisitedSections } from '../utils/searchStorage';
import { useAdminSearchIndex, type ResolvedSearchEntry } from './useAdminSearchIndex';

const toSearchItem = (
  entry: ResolvedSearchEntry,
  score: number,
  matchedIndices: number[]
): AdminSearchItem => ({
  id: entry.id,
  title: entry.title,
  subtitle: entry.subtitle,
  category: entry.category,
  path: entry.path,
  sectionId: entry.sectionId,
  icon: entry.icon,
  priority: entry.priority,
  actionId: entry.actionId,
  score,
  matchedIndices,
});

export const useAdminGlobalSearch = (query: string, recentVersion = 0) => {
  const { t } = useTranslation();
  const index = useAdminSearchIndex();

  const categoryLabels = useMemo(
    () =>
      Object.fromEntries(
        ADMIN_SEARCH_CATEGORY_ORDER.map((cat) => [cat, t(`admin.globalSearch.categories.${cat}`)])
      ) as Record<string, string>,
    [t]
  );

  const results = useMemo((): AdminSearchGroup[] => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const scored: AdminSearchItem[] = [];

    for (const entry of index) {
      const match = scoreSearchItem(trimmed, entry.title, entry.subtitle, entry.keywords, entry.priority);
      if (match) {
        scored.push(toSearchItem(entry, match.score, match.matchedIndices));
      }
    }

    scored.sort((a, b) => b.score - a.score);

    const byCategory = new Map<string, AdminSearchItem[]>();
    for (const item of scored) {
      const list = byCategory.get(item.category) ?? [];
      list.push(item);
      byCategory.set(item.category, list);
    }

    return ADMIN_SEARCH_CATEGORY_ORDER.filter((cat) => byCategory.has(cat)).map((cat) => ({
      category: cat,
      label: categoryLabels[cat] ?? cat,
      items: byCategory.get(cat) ?? [],
    }));
  }, [query, index, categoryLabels]);

  const flatResults = useMemo(() => results.flatMap((g) => g.items), [results]);

  const suggestedItems = useMemo((): AdminSearchItem[] => {
    const visited = getVisitedSections();
    const items: AdminSearchItem[] = [];

    for (const v of visited) {
      const resolved = index.find((e) => e.id === v.id);
      if (resolved) {
        items.push({
          ...toSearchItem(resolved, resolved.priority + 5, []),
        });
      }
    }

    const defaults = ['page-dashboard', 'page-internship-offers', 'page-students', 'action-create-offer'];
    for (const id of defaults) {
      if (items.some((i) => i.id === id)) continue;
      const resolved = index.find((e) => e.id === id);
      if (resolved) items.push(toSearchItem(resolved, resolved.priority, []));
    }

    return items.slice(0, 6);
  }, [index]);

  const recentQueries = useMemo(() => getRecentSearches(), [query, recentVersion]);

  return {
    results,
    flatResults,
    suggestedItems,
    recentQueries,
    hasQuery: query.trim().length > 0,
    totalCount: flatResults.length,
  };
};

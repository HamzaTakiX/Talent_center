import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ADMIN_KPI_LABEL_TO_KEY } from '../../i18n/adminKpiLabelMap';
import { ADMIN_SEARCH_REGISTRY } from '../data/adminSearchRegistry';
import { ADMIN_SEARCH_SUPPLEMENT } from '../data/adminSearchSupplement';
import type { AdminSearchRegistryEntry } from '../types';
import { collectDomSearchSections } from '../utils/collectDomSearchSections';
import { pathToSearchKeywords } from '../utils/searchPathKeywords';

export interface ResolvedSearchEntry {
  id: string;
  title: string;
  subtitle?: string;
  keywords: string[];
  category: AdminSearchRegistryEntry['category'];
  path?: string;
  sectionId?: string;
  icon?: AdminSearchRegistryEntry['icon'];
  priority: number;
  actionId?: AdminSearchRegistryEntry['actionId'];
}

const KPI_ENGLISH_BY_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(ADMIN_KPI_LABEL_TO_KEY).map(([english, key]) => [key, english])
);

const mergeRegistry = (): AdminSearchRegistryEntry[] => {
  const seen = new Set<string>();
  const merged: AdminSearchRegistryEntry[] = [];

  for (const entry of [...ADMIN_SEARCH_REGISTRY, ...ADMIN_SEARCH_SUPPLEMENT]) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    merged.push(entry);
  }

  return merged;
};

const MERGED_REGISTRY = mergeRegistry();

const resolveEntry = (
  entry: AdminSearchRegistryEntry,
  t: (key: string) => string
): ResolvedSearchEntry => {
  const title = t(entry.titleKey);
  const subtitle = entry.subtitleKey ? t(entry.subtitleKey) : undefined;
  const keywords = [...(entry.keywords ?? []), ...pathToSearchKeywords(entry.path)];

  if (subtitle) keywords.push(subtitle);

  const englishKpi = KPI_ENGLISH_BY_KEY[entry.titleKey];
  if (englishKpi) keywords.push(englishKpi);

  const titleKeyTail = entry.titleKey.split('.').pop();
  if (titleKeyTail) keywords.push(titleKeyTail.replace(/_/g, ' '));

  return {
    id: entry.id,
    title,
    subtitle,
    keywords,
    category: entry.category,
    path: entry.path,
    sectionId: entry.sectionId,
    icon: entry.icon,
    priority: entry.priority ?? 50,
    actionId: entry.actionId,
  };
};

export const useAdminSearchIndex = (): ResolvedSearchEntry[] => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  return useMemo(() => {
    const staticEntries = MERGED_REGISTRY.map((entry) => resolveEntry(entry, t));

    const liveEntries: ResolvedSearchEntry[] = collectDomSearchSections(pathname).map((live) => ({
      id: live.id,
      title: live.title,
      subtitle: t('admin.globalSearch.currentPage'),
      keywords: [
        live.title,
        live.sectionId.replace(/-/g, ' '),
        ...pathToSearchKeywords(live.path),
      ],
      category: 'section' as const,
      path: live.path,
      sectionId: live.sectionId,
      priority: 82,
    }));

    const seenLiveSection = new Set<string>();
    const dedupedLive = liveEntries.filter((entry) => {
      const key = `${entry.path}:${entry.sectionId}`;
      if (seenLiveSection.has(key)) return false;
      if (staticEntries.some((s) => s.sectionId === entry.sectionId && s.path === entry.path)) {
        return false;
      }
      seenLiveSection.add(key);
      return true;
    });

    return [...staticEntries, ...dedupedLive];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n.language, pathname]);
};

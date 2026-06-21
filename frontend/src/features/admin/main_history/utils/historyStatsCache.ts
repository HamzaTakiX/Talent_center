import type { HistoryStatItem } from '../types';

const GLOBAL_KEY = '__global__';

const cache = new Map<string, HistoryStatItem[]>();

export function statsCacheKey(kpi?: string): string {
  return kpi?.trim() || GLOBAL_KEY;
}

export function getCachedHistoryStats(kpi?: string): HistoryStatItem[] | undefined {
  return cache.get(statsCacheKey(kpi));
}

export function setCachedHistoryStats(kpi: string | undefined, stats: HistoryStatItem[]): void {
  if (stats.length > 0) {
    cache.set(statsCacheKey(kpi), stats);
  }
}

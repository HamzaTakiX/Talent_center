export const ANNOUNCEMENT_STATUS_OPTS = [
  'DRAFT',
  'SCHEDULED',
  'PUBLISHED',
  'EXPIRED',
  'ARCHIVED',
] as const;

export const ANNOUNCEMENT_PRIORITY_OPTS = [
  'NORMAL',
  'IMPORTANT',
  'URGENT',
  'PINNED',
  'INSTITUTIONAL_CRITICAL',
] as const;

export interface AnnListFilters {
  search?: string;
  statuses?: string[];
  priorities?: string[];
  types?: string[];
  internship_only?: boolean;
}

export function annFiltersToListParams(filters: AnnListFilters) {
  return {
    search: filters.search || undefined,
    status: filters.statuses?.length ? filters.statuses.join(',') : undefined,
    priority: filters.priorities?.length ? filters.priorities.join(',') : undefined,
    type: filters.types?.length ? filters.types.join(',') : undefined,
    internship_only: filters.internship_only,
  };
}

export function hasActiveAnnFilters(filters: AnnListFilters): boolean {
  return Boolean(
    filters.search?.trim() ||
      filters.statuses?.length ||
      filters.priorities?.length ||
      filters.types?.length ||
      filters.internship_only,
  );
}

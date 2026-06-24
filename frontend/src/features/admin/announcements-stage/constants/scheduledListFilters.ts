export type ScheduledDateRange = 'all' | 'today' | 'week' | 'month' | 'custom';

export interface ScheduledListFilters {
  search?: string;
  statuses?: string[];
  dateRange?: ScheduledDateRange;
  publishStartFrom?: string;
  publishStartTo?: string;
  filiereId?: string;
  classGroupId?: string;
  academicLevelId?: string;
}

export function scheduledFiltersToListParams(filters: ScheduledListFilters) {
  const status = filters.statuses?.length ? filters.statuses.join(',') : 'SCHEDULED';
  const onlyScheduled = !filters.statuses?.length || filters.statuses.every((s) => s === 'SCHEDULED');
  return {
    search: filters.search || undefined,
    status,
    scheduled_only: onlyScheduled ? true : undefined,
    date_range: filters.dateRange && filters.dateRange !== 'all' ? filters.dateRange : undefined,
    publish_start_from: filters.dateRange === 'custom' ? filters.publishStartFrom : undefined,
    publish_start_to: filters.dateRange === 'custom' ? filters.publishStartTo : undefined,
    filiere: filters.filiereId || undefined,
    class_group: filters.classGroupId || undefined,
    academic_level: filters.academicLevelId || undefined,
    ordering: onlyScheduled ? 'publish_start_at' : '-publish_start_at',
  };
}

export function hasActiveScheduledFilters(filters: ScheduledListFilters): boolean {
  return Boolean(
    filters.search?.trim() ||
      (filters.statuses?.length && !(filters.statuses.length === 1 && filters.statuses[0] === 'SCHEDULED')) ||
      (filters.dateRange && filters.dateRange !== 'all') ||
      filters.filiereId ||
      filters.classGroupId ||
      filters.academicLevelId,
  );
}

export type InternshipOfferDateFilter = 'all' | 'today' | 'week' | 'month';

export type InternshipOfferDistanceSort = 'none' | 'nearest' | 'farthest';

export const INTERNSHIP_OFFER_DATE_FILTER_VALUES = ['all', 'today', 'week', 'month'] as const;

export const INTERNSHIP_OFFER_DISTANCE_SORT_VALUES = ['none', 'nearest', 'farthest'] as const;

export const MIN_DISTANCE_KM = 5;
export const MAX_DISTANCE_KM = 100;
export const DEFAULT_MAX_DISTANCE_KM = MAX_DISTANCE_KM;

export interface InternshipOfferListFilters {
  search: string;
  dateFilter: InternshipOfferDateFilter;
  maxDistanceKm: number;
  distanceSort: InternshipOfferDistanceSort;
}

export const DEFAULT_INTERNSHIP_OFFER_LIST_FILTERS: InternshipOfferListFilters = {
  search: '',
  dateFilter: 'all',
  maxDistanceKm: DEFAULT_MAX_DISTANCE_KM,
  distanceSort: 'none',
};

import type { DocumentCatalogBadgeType, DocumentCategoryKey } from '../types';

export const DOCUMENT_CATALOG_PAGE_SIZE = 6;

export const DOCUMENT_CATEGORY_ALL = 'all' as const;

export type DocumentCategoryFilter = typeof DOCUMENT_CATEGORY_ALL | DocumentCategoryKey;

export const DOCUMENT_CATEGORY_FILTER_VALUES: readonly DocumentCategoryFilter[] = [
  DOCUMENT_CATEGORY_ALL,
  'administrative',
  'internship',
  'academic',
  'financial',
];

export const DOCUMENT_BADGE_FILTER_ALL = 'all' as const;

export type DocumentBadgeFilter = typeof DOCUMENT_BADGE_FILTER_ALL | DocumentCatalogBadgeType;

export const DOCUMENT_BADGE_FILTER_VALUES: readonly DocumentBadgeFilter[] = [
  DOCUMENT_BADGE_FILTER_ALL,
  'auto',
  'reservation',
];

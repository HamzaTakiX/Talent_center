import type { DocumentServiceCategory } from '../../../admin/Documents_admin/types/documentServiceCatalog';

export const DOCUMENT_CATALOG_PAGE_SIZE = 6;

export const DOCUMENT_CATEGORY_ALL = 'all' as const;

export type DocumentCategoryFilter = typeof DOCUMENT_CATEGORY_ALL | DocumentServiceCategory;

export const DOCUMENT_CATEGORY_FILTER_VALUES: readonly DocumentCategoryFilter[] = [
  DOCUMENT_CATEGORY_ALL,
  'ATTESTATION',
  'CONVENTION',
  'CERTIFICATE',
  'AUTHORIZATION',
  'REPORT',
  'OTHER',
];

export const DOCUMENT_BADGE_FILTER_ALL = 'all' as const;

export type DocumentBadgeFilter =
  | typeof DOCUMENT_BADGE_FILTER_ALL
  | 'online'
  | 'physical'
  | 'reservation'
  | 'auto';

export const DOCUMENT_BADGE_FILTER_VALUES: readonly DocumentBadgeFilter[] = [
  DOCUMENT_BADGE_FILTER_ALL,
  'online',
  'physical',
  'reservation',
  'auto',
];

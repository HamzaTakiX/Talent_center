import type { InternshipOfferCategory } from '../types';

export const INTERNSHIP_OFFER_CATEGORY_ALL = 'all' as const;

export type InternshipOfferCategoryFilter = typeof INTERNSHIP_OFFER_CATEGORY_ALL | InternshipOfferCategory;

export const INTERNSHIP_OFFER_CATEGORY_VALUES = [
  INTERNSHIP_OFFER_CATEGORY_ALL,
  'Marketing',
  'Business',
  'Finance',
  'HR',
  'Consulting',
] as const satisfies readonly InternshipOfferCategoryFilter[];

import type { InternshipOfferCategory } from '../types';

export const INTERNSHIP_OFFER_CATEGORY_ALL = 'all' as const;

export type InternshipOfferCategoryFilter = typeof INTERNSHIP_OFFER_CATEGORY_ALL | InternshipOfferCategory;

export const internshipOfferCategoryOptions: {
  value: InternshipOfferCategoryFilter;
  label: string;
}[] = [
  { value: INTERNSHIP_OFFER_CATEGORY_ALL, label: 'All Categories' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Business', label: 'Business' },
  { value: 'Finance', label: 'Finance' },
  { value: 'HR', label: 'HR' },
  { value: 'Consulting', label: 'Consulting' },
];

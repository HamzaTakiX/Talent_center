import { OFFER_FIELD_LIMITS } from './constants';

/** Tronque une chaîne à la limite du champ Offers */
export function clampOfferField(
  value: string,
  field: keyof typeof OFFER_FIELD_LIMITS,
): string {
  return value.slice(0, OFFER_FIELD_LIMITS[field]);
}

/** Handler de recherche avec limite intégrée */
export function clampSearchQuery(value: string): string {
  return clampOfferField(value, 'searchQuery');
}

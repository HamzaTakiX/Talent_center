import type { InternshipOfferDateFilter, InternshipOfferDistanceSort } from '../constants/internshipOfferFilters';
import type { InternshipOffer } from '../types';
import type { GeoPoint } from './internshipOfferDistance';
import { computeOfferDistanceKm } from './internshipOfferDistance';

function matchesDateFilter(publishedAt: string | null | undefined, dateFilter: InternshipOfferDateFilter): boolean {
  if (dateFilter === 'all') return true;
  if (!publishedAt) return false;

  const published = new Date(publishedAt);
  if (Number.isNaN(published.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (dateFilter === 'today') {
    return published >= startOfToday;
  }

  const daysAgo = dateFilter === 'week' ? 7 : 30;
  const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return published >= cutoff;
}

function compareDistance(
  a: InternshipOffer,
  b: InternshipOffer,
  direction: 'nearest' | 'farthest',
): number {
  const aRemote = a.isRemote ? 1 : 0;
  const bRemote = b.isRemote ? 1 : 0;
  if (aRemote !== bRemote) return aRemote - bRemote;

  const aDistance = a.distanceKm;
  const bDistance = b.distanceKm;

  if (aDistance == null && bDistance == null) return 0;
  if (aDistance == null) return 1;
  if (bDistance == null) return -1;

  return direction === 'nearest' ? aDistance - bDistance : bDistance - aDistance;
}

export interface ApplyInternshipOfferFiltersInput {
  offers: InternshipOffer[];
  search: string;
  dateFilter: InternshipOfferDateFilter;
  maxDistanceKm: number;
  distanceSort: InternshipOfferDistanceSort;
  userLocation: GeoPoint | null;
}

export function enrichOffersWithDistance(
  offers: InternshipOffer[],
  userLocation: GeoPoint | null,
): InternshipOffer[] {
  if (!userLocation) return offers;

  return offers.map((offer) => ({
    ...offer,
    distanceKm: offer.isRemote
      ? null
      : computeOfferDistanceKm(userLocation, offer.location),
  }));
}

export function applyInternshipOfferFilters({
  offers,
  search,
  dateFilter,
  maxDistanceKm,
  distanceSort,
  userLocation,
}: ApplyInternshipOfferFiltersInput): InternshipOffer[] {
  const normalizedQuery = search.trim().toLowerCase();
  const withDistance = enrichOffersWithDistance(offers, userLocation);

  const filtered = withDistance.filter((offer) => {
    if (!matchesDateFilter(offer.publishedAt, dateFilter)) {
      return false;
    }

    if (normalizedQuery) {
      const searchable = [offer.title, offer.company, offer.location, offer.category, ...offer.tags]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(normalizedQuery)) {
        return false;
      }
    }

    if (userLocation && !offer.isRemote && maxDistanceKm < 100) {
      if (offer.distanceKm == null) return false;
      if (offer.distanceKm > maxDistanceKm) return false;
    }

    return true;
  });

  if (distanceSort === 'nearest' || distanceSort === 'farthest') {
    return [...filtered].sort((a, b) => compareDistance(a, b, distanceSort));
  }

  return filtered;
}

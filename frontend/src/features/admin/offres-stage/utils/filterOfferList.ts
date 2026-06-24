import type { InternshipOffer } from '../types';

export type OfferDeadlineFilter = 'all' | 'no_deadline' | 'overdue' | 'this_week' | 'this_month';
export type OfferApplicantsFilter = 'all' | 'none' | 'has_applicants' | 'high';

const HIGH_APPLICANTS_THRESHOLD = 5;

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function parseDeadline(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function hasNoDeadline(offer: InternshipOffer): boolean {
  return !offer.applicationDeadline && offer.deadline === '—';
}

export function matchesDeadlineFilter(offer: InternshipOffer, filter: OfferDeadlineFilter): boolean {
  if (filter === 'all') return true;

  if (filter === 'no_deadline') return hasNoDeadline(offer);

  const deadline = parseDeadline(offer.applicationDeadline);
  if (!deadline) return false;

  const today = startOfDay(new Date());
  const deadlineDay = startOfDay(deadline);

  switch (filter) {
    case 'overdue':
      return deadlineDay < today;
    case 'this_week': {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return deadlineDay >= today && deadlineDay <= weekEnd;
    }
    case 'this_month': {
      const monthEnd = new Date(today);
      monthEnd.setDate(monthEnd.getDate() + 30);
      return deadlineDay >= today && deadlineDay <= monthEnd;
    }
    default:
      return true;
  }
}

export function matchesApplicantsFilter(offer: InternshipOffer, filter: OfferApplicantsFilter): boolean {
  switch (filter) {
    case 'none':
      return offer.applicants === 0;
    case 'has_applicants':
      return offer.applicants > 0;
    case 'high':
      return offer.applicants >= HIGH_APPLICANTS_THRESHOLD;
    default:
      return true;
  }
}

export function applyOfferListFilters(
  offers: InternshipOffer[],
  filters: { deadline?: OfferDeadlineFilter; applicants?: OfferApplicantsFilter },
): InternshipOffer[] {
  const deadline = filters.deadline ?? 'all';
  const applicants = filters.applicants ?? 'all';

  return offers.filter(
    (offer) =>
      matchesDeadlineFilter(offer, deadline) && matchesApplicantsFilter(offer, applicants),
  );
}

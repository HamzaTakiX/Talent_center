import type { InternshipOffer } from '../../types';

export type DraftOfferFilter = 'all' | 'ready' | 'incomplete' | 'pending_review' | 'no_deadline';

export function filterDraftOffers(
  offers: InternshipOffer[],
  filter: DraftOfferFilter,
): InternshipOffer[] {
  switch (filter) {
    case 'ready':
      return offers.filter((offer) => offer.publishReady === true);
    case 'incomplete':
      return offers.filter((offer) => offer.publishReady !== true);
    case 'pending_review':
      return offers.filter((offer) => offer.draftWorkflowStatus === 'pending_review');
    case 'no_deadline':
      return offers.filter((offer) => offer.deadline === '—');
    default:
      return offers;
  }
}

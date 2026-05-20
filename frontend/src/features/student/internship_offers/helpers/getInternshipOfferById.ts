import { internshipOfferDetailsById } from '../data/internshipOfferDetailsMock';
import type { InternshipOfferDetails } from '../types';

export function getInternshipOfferById(offerId: string | undefined): InternshipOfferDetails | undefined {
  if (!offerId) return undefined;
  return internshipOfferDetailsById[offerId];
}

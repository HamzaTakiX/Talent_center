import type { InternshipOfferDetails } from '../types';

/** Retire les tags déjà couverts par la section « Informations clés ». */
export function filterHeaderTags(offer: InternshipOfferDetails): string[] {
  if (!offer.tags.length) return [];

  return offer.tags.filter((tag) => {
    if (offer.workMode === 'remote' && tag === 'Remote') return false;
    if (offer.workMode === 'hybrid' && tag === 'Hybrid') return false;
    if (offer.internshipType && tag === offer.internshipType) return false;
    if (offer.applicationDeadline && tag === offer.applicationDeadline) return false;
    return true;
  });
}

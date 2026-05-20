import type { InternshipOffer } from '../types';
import type { InternshipOfferCategoryFilter } from '../constants/internshipOfferCategories';
import { INTERNSHIP_OFFER_CATEGORY_ALL } from '../constants/internshipOfferCategories';

export function filterInternshipOffers(
  offers: InternshipOffer[],
  query: string,
  category: InternshipOfferCategoryFilter
): InternshipOffer[] {
  const normalizedQuery = query.trim().toLowerCase();

  return offers.filter((offer) => {
    if (category !== INTERNSHIP_OFFER_CATEGORY_ALL && offer.category !== category) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchable = [
      offer.title,
      offer.company,
      offer.location,
      offer.category,
      ...offer.tags,
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
}

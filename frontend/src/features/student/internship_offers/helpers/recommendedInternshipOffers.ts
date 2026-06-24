import type { InternshipOffer } from '../types';

const FALLBACK_MIN_MATCH_PERCENT = 50;

function normalizeTypeToken(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

export function offerMatchesStudentInternshipType(
  offerType: string,
  studentInternshipTypeName?: string,
): boolean {
  const offerToken = normalizeTypeToken(offerType);
  const studentName = (studentInternshipTypeName ?? '').trim().toLowerCase();
  if (!offerToken || !studentName) {
    return false;
  }

  const studentToken = normalizeTypeToken(studentInternshipTypeName ?? '');
  if (offerToken === studentToken) {
    return true;
  }

  return studentName.includes(offerToken) || offerToken.includes(studentToken);
}

export function buildRecommendedInternshipOffers(
  offers: InternshipOffer[],
  studentInternshipTypeName?: string,
): InternshipOffer[] {
  const sortByMatch = (items: InternshipOffer[]) =>
    [...items].sort((a, b) => b.matchPercent - a.matchPercent);

  const sameType = offers.filter((offer) =>
    offerMatchesStudentInternshipType(String(offer.category ?? ''), studentInternshipTypeName),
  );

  if (sameType.length > 0) {
    return sortByMatch(sameType);
  }

  return sortByMatch(
    offers.filter((offer) => offer.matchPercent > FALLBACK_MIN_MATCH_PERCENT),
  );
}

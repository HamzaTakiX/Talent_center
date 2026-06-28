/** Route standalone — Interview Simulator (navbar Internship Offers). */
export const STUDENT_INTERVIEW_SIMULATOR_PATH =
  '/student/internship-offers/interview-simulator';

export const INTERVIEW_SIMULATOR_OFFER_QUERY = 'offerId';

export function buildInterviewSimulatorOfferPath(offerId: string): string {
  const params = new URLSearchParams({ [INTERVIEW_SIMULATOR_OFFER_QUERY]: offerId });
  return `${STUDENT_INTERVIEW_SIMULATOR_PATH}?${params.toString()}`;
}

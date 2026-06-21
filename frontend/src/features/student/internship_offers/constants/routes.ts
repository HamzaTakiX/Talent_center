export const STUDENT_DASHBOARD_PATH = '/student-dashboard';
export const STUDENT_INTERNSHIP_OFFERS_PATH = '/student/internship-offers';
export const STUDENT_ALL_INTERNSHIP_OFFERS_PATH = '/student/internship-offers/all';

export const getInternshipOfferDetailsPath = (offerId: string): string =>
  `/student/internship-offers/${offerId}`;

export const getInternshipOfferApplyPath = (offerId: string): string =>
  `/student/internship-offers/${offerId}/apply`;

export const STUDENT_MY_APPLICATIONS_PATH = '/student/internship-offers/applications';

export const getInternshipApplicationDetailPath = (appId: string): string =>
  `/student/internship-offers/applications/${appId}`;

export const getInternshipOfferCvAnalysisPath = (offerId: string): string =>
  `/student/internship-offers/${offerId}/cv-analysis`;

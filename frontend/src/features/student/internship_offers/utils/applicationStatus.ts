export function applicationStatusLabelKey(status: string): string {
  const map: Record<string, string> = {
    SUBMITTED: 'student.internshipOffers.journey.status.submitted',
    UNDER_REVIEW: 'student.internshipOffers.journey.status.underReview',
    SHORTLISTED: 'student.internshipOffers.journey.status.shortlisted',
    INTERVIEW: 'student.internshipOffers.journey.status.interview',
    ACCEPTED: 'student.internshipOffers.journey.status.accepted',
    REJECTED: 'student.internshipOffers.journey.status.rejected',
    WITHDRAWN: 'student.internshipOffers.journey.status.withdrawn',
    OFFER_ACCEPTED: 'student.internshipOffers.journey.status.offerAccepted',
    OFFER_DECLINED: 'student.internshipOffers.journey.status.offerDeclined',
    INTERNSHIP_STARTED: 'student.internshipOffers.journey.status.internshipStarted',
    INTERNSHIP_COMPLETED: 'student.internshipOffers.journey.status.internshipCompleted',
    EXPIRED: 'student.internshipOffers.journey.status.expired',
  };
  return map[status] ?? 'student.internshipOffers.journey.status.submitted';
}

export function formatJourneyDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

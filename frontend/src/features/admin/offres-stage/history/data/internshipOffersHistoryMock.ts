export type InternshipOffersTimelineStatus =
  | 'offer_created'
  | 'offer_edited'
  | 'offer_published'
  | 'offer_expired'
  | 'candidate_assigned'
  | 'cv_sent'
  | 'applied'
  | 'accepted'
  | 'rejected';

export interface InternshipOffersTimelineRow {
  id: string;
  status: InternshipOffersTimelineStatus;
  actorName: string;
  /** Primary subject line (formerly jobTitle) */
  headline: string;
  /** Supporting context — company / offer ref */
  company: string;
  date: string;
  time: string;
  studentClass?: string | null;
  offerExpiry: 'active' | 'expiring_soon' | 'expired';
}

export const internshipOffersHistoryTimelineSeed: InternshipOffersTimelineRow[] = [
  {
    id: 'ioh1',
    status: 'offer_published',
    actorName: 'Admin',
    headline: 'Software Engineer internship — moderation queue cleared',
    company: 'TechCorp Morocco (#TC-SEA-026)',
    date: '02/05/2026',
    time: '08:05',
    studentClass: null,
    offerExpiry: 'active',
  },
  {
    id: 'ioh2',
    status: 'cv_sent',
    actorName: 'RecruitingOps Bot',
    headline: 'Forward CV packet + transcripts to moderator',
    company: 'Candidate pool • M1 candidates',
    date: '02/05/2026',
    time: '07:40',
    studentClass: '3rd year',
    offerExpiry: 'active',
  },
  {
    id: 'ioh3',
    status: 'candidate_assigned',
    actorName: 'Panel Lead — CloudTech',
    headline: 'Shortlist assigned • DevOps trainee seat',
    company: 'CloudTech Systems intake',
    date: '02/05/2026',
    time: '07:08',
    studentClass: '2nd year',
    offerExpiry: 'expiring_soon',
  },
  {
    id: 'ioh4',
    status: 'applied',
    actorName: 'Sarah Alami',
    headline: 'Applied — ML intern track',
    company: 'Submitted portfolio + graded project',
    date: '01/05/2026',
    time: '19:54',
    studentClass: '3rd year',
    offerExpiry: 'active',
  },
  {
    id: 'ioh5',
    status: 'offer_edited',
    actorName: 'Admin',
    headline: 'Revised SLA + mentorship clause',
    company: 'DataHub Analytics — Data Scientist intern',
    date: '01/05/2026',
    time: '14:05',
    studentClass: null,
    offerExpiry: 'expiring_soon',
  },
  {
    id: 'ioh6',
    status: 'accepted',
    actorName: 'Amina Khalil',
    headline: 'Offer accepted pending HR docs',
    company: 'DataHub Solutions onboarding',
    date: '01/05/2026',
    time: '11:15',
    studentClass: '2nd year',
    offerExpiry: 'expiring_soon',
  },
  {
    id: 'ioh7',
    status: 'offer_expired',
    actorName: 'System',
    headline: 'Internship vacancy auto-closed — no quorum',
    company: 'CloudTech legacy DevOps cohort',
    date: '30/04/2026',
    time: '23:59',
    studentClass: null,
    offerExpiry: 'expired',
  },
  {
    id: 'ioh8',
    status: 'rejected',
    actorName: 'Mohamed Idrissi',
    headline: 'Application rejected • missing transcript',
    company: 'CloudTech Systems',
    date: '30/04/2026',
    time: '15:22',
    studentClass: '1st year',
    offerExpiry: 'expired',
  },
  {
    id: 'ioh9',
    status: 'offer_created',
    actorName: 'Admin',
    headline: 'Created draft — UX Research intern',
    company: 'Creative Studio co-branded cohort',
    date: '29/04/2026',
    time: '10:12',
    studentClass: null,
    offerExpiry: 'active',
  },
];

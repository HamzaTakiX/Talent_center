export type StudentInternshipHistoryStatus =
  | 'viewed_offer'
  | 'saved_offer'
  | 'applied'
  | 'cv_uploaded'
  | 'cv_analysis_used'
  | 'interview_simulator_used'
  | 'chat_question'
  | 'external_link_confirmed'
  | 'application_status_changed'
  | 'deadline_reminder';

export type StudentHistoryActivityCategory =
  | 'applications'
  | 'saved'
  | 'tools'
  | 'chat'
  | 'offers';

export interface StudentInternshipHistoryRow {
  id: string;
  status: StudentInternshipHistoryStatus;
  actorName: string;
  headline: string;
  company: string;
  date: string;
  time: string;
  activityCategory: StudentHistoryActivityCategory;
  offerExpiry: 'active' | 'expiring_soon' | 'expired';
}

export const studentInternshipHistoryTimelineSeed: StudentInternshipHistoryRow[] = [
  {
    id: 'sth1',
    status: 'application_status_changed',
    actorName: 'You',
    headline: 'Application status updated — Under review',
    company: 'TechCorp Morocco • Full-Stack Intern #TC-026',
    date: '02/05/2026',
    time: '10:41',
    activityCategory: 'applications',
    offerExpiry: 'active',
  },
  {
    id: 'sth2',
    status: 'applied',
    actorName: 'You',
    headline: 'Applied to internship offer',
    company: 'Innovatech Solutions • Backend Intern',
    date: '02/05/2026',
    time: '09:18',
    activityCategory: 'applications',
    offerExpiry: 'active',
  },
  {
    id: 'sth3',
    status: 'cv_uploaded',
    actorName: 'You',
    headline: 'Uploaded CV for application',
    company: 'TechCorp Morocco • Full-Stack Intern #TC-026',
    date: '02/05/2026',
    time: '09:12',
    activityCategory: 'applications',
    offerExpiry: 'active',
  },
  {
    id: 'sth4',
    status: 'chat_question',
    actorName: 'You',
    headline: 'Asked a question in Chat about an offer',
    company: 'DataHub Analytics • Data Analyst Intern',
    date: '01/05/2026',
    time: '16:30',
    activityCategory: 'chat',
    offerExpiry: 'expiring_soon',
  },
  {
    id: 'sth5',
    status: 'cv_analysis_used',
    actorName: 'You',
    headline: 'Used CV Analysis Tool',
    company: 'Prepared profile for #TC-026 application',
    date: '01/05/2026',
    time: '15:02',
    activityCategory: 'tools',
    offerExpiry: 'active',
  },
  {
    id: 'sth6',
    status: 'interview_simulator_used',
    actorName: 'You',
    headline: 'Used Interview Simulator',
    company: 'Practice session — TechCorp Morocco context',
    date: '01/05/2026',
    time: '14:20',
    activityCategory: 'tools',
    offerExpiry: 'active',
  },
  {
    id: 'sth7',
    status: 'saved_offer',
    actorName: 'You',
    headline: 'Saved an internship offer',
    company: 'CloudTech Systems • DevOps Intern',
    date: '30/04/2026',
    time: '18:44',
    activityCategory: 'saved',
    offerExpiry: 'expiring_soon',
  },
  {
    id: 'sth8',
    status: 'viewed_offer',
    actorName: 'You',
    headline: 'Viewed an internship offer',
    company: 'DataHub Analytics • Data Analyst Intern',
    date: '30/04/2026',
    time: '17:05',
    activityCategory: 'offers',
    offerExpiry: 'expiring_soon',
  },
  {
    id: 'sth9',
    status: 'external_link_confirmed',
    actorName: 'You',
    headline: 'Confirmed application on external company link',
    company: 'Innovatech Solutions • Backend Intern portal',
    date: '30/04/2026',
    time: '11:22',
    activityCategory: 'applications',
    offerExpiry: 'active',
  },
  {
    id: 'sth10',
    status: 'deadline_reminder',
    actorName: 'Talent Center',
    headline: 'Offer deadline reminder received',
    company: 'CloudTech Systems • DevOps Intern closes in 48h',
    date: '29/04/2026',
    time: '08:00',
    activityCategory: 'offers',
    offerExpiry: 'expiring_soon',
  },
];

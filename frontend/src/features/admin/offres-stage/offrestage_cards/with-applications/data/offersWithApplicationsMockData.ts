export type OfferWithApplicationsStatus = 'Active' | 'Expired' | 'Closed';

export interface OfferWithApplicationsRow {
  id: string;
  title: string;
  company: string;
  status: OfferWithApplicationsStatus;
  applicants: number;
  deadline: string;
}

export const offersWithApplicationsRows: OfferWithApplicationsRow[] = [
  {
    id: '1',
    title: 'Développeur IA & Machine Learning',
    company: 'TechCorp Morocco',
    status: 'Active',
    applicants: 45,
    deadline: '15/05/2026',
  },
  {
    id: '2',
    title: 'Analyste Data Science',
    company: 'DataHub Solutions',
    status: 'Active',
    applicants: 32,
    deadline: '20/05/2026',
  },
  {
    id: '3',
    title: 'Développeur Full Stack',
    company: 'WebAgency Pro',
    status: 'Active',
    applicants: 28,
    deadline: '10/05/2026',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudTech Systems',
    status: 'Expired',
    applicants: 12,
    deadline: '10/04/2026',
  },
  {
    id: '6',
    title: 'Business Analyst',
    company: 'Consulting Group',
    status: 'Closed',
    applicants: 18,
    deadline: '05/04/2026',
  },
  {
    id: '9',
    title: 'Cybersecurity Analyst',
    company: 'SecureNet',
    status: 'Active',
    applicants: 25,
    deadline: '18/05/2026',
  },
];

export const OFFERS_WITH_APPLICATIONS_COUNT = offersWithApplicationsRows.length;

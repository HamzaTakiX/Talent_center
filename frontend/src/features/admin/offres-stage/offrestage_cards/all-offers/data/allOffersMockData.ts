export type AllOffersStatus = 'Active' | 'Draft' | 'Expired' | 'Closed';

export interface AllOfferRow {
  id: string;
  title: string;
  company: string;
  status: AllOffersStatus;
  applicants: number;
  deadline: string;
}

export const allOffersRows: AllOfferRow[] = [
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
    id: '4',
    title: 'Consultant IT',
    company: 'Digital Consulting',
    status: 'Draft',
    applicants: 0,
    deadline: '01/06/2026',
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
    id: '7',
    title: 'UX/UI Designer',
    company: 'Creative Studio',
    status: 'Draft',
    applicants: 0,
    deadline: '25/05/2026',
  },
  {
    id: '8',
    title: 'Ingénieur Cybersécurité',
    company: 'SecureNet MA',
    status: 'Active',
    applicants: 22,
    deadline: '30/05/2026',
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

export const ALL_OFFERS_COUNT = allOffersRows.length;

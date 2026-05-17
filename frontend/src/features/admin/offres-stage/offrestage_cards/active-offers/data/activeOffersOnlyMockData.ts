/** Active offers list — matches stats drill-down (4 rows). */
export interface ActiveOfferListRow {
  id: string;
  title: string;
  company: string;
  status: 'Active';
  applicants: number;
  deadline: string;
}

export const activeOffersOnlyRows: ActiveOfferListRow[] = [
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
    id: '9',
    title: 'Cybersecurity Analyst',
    company: 'SecureNet',
    status: 'Active',
    applicants: 25,
    deadline: '18/05/2026',
  },
];

export const ACTIVE_OFFERS_LIST_COUNT = activeOffersOnlyRows.length;

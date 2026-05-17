export interface ClosedOfferListRow {
  id: string;
  title: string;
  company: string;
  status: 'Closed';
  applicants: number;
  deadline: string;
}

export const closedOffersOnlyRows: ClosedOfferListRow[] = [
  {
    id: '6',
    title: 'Business Analyst',
    company: 'Consulting Group',
    status: 'Closed',
    applicants: 18,
    deadline: '05/04/2026',
  },
];

export const CLOSED_OFFERS_LIST_COUNT = closedOffersOnlyRows.length;

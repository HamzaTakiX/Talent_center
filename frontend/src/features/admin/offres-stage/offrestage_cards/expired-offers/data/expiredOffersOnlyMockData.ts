export interface ExpiredOfferListRow {
  id: string;
  title: string;
  company: string;
  status: 'Expired';
  applicants: number;
  deadline: string;
}

export const expiredOffersOnlyRows: ExpiredOfferListRow[] = [
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudTech Systems',
    status: 'Expired',
    applicants: 12,
    deadline: '10/04/2026',
  },
];

export const EXPIRED_OFFERS_LIST_COUNT = expiredOffersOnlyRows.length;

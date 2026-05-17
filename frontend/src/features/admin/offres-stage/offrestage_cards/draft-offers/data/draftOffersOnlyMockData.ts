export interface DraftOfferListRow {
  id: string;
  title: string;
  company: string;
  status: 'Draft';
  applicants: number;
  deadline: string;
}

export const draftOffersOnlyRows: DraftOfferListRow[] = [
  {
    id: '4',
    title: 'Consultant IT',
    company: 'Digital Consulting',
    status: 'Draft',
    applicants: 0,
    deadline: '01/06/2026',
  },
  {
    id: '7',
    title: 'UX/UI Designer',
    company: 'Creative Studio',
    status: 'Draft',
    applicants: 0,
    deadline: '25/05/2026',
  },
];

export const DRAFT_OFFERS_LIST_COUNT = draftOffersOnlyRows.length;

export interface ActiveOfferRow {
  title: string;
  company: string;
  applicants: number;
  status: 'active';
}

export const ACTIVE_OFFERS_COUNT = 78;

export const activeOffersMockRows: ActiveOfferRow[] = [
  { title: 'Développeur IA', company: 'TechCorp', applicants: 45, status: 'active' },
  { title: 'Data Analyst', company: 'DataHub', applicants: 32, status: 'active' },
];

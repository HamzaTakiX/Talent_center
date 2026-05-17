export interface InternshipOffersStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'total' | 'create' | 'update' | 'delete';
}

export type InternshipOffersActionType = 'create' | 'update' | 'delete';

export interface InternshipOffersHistoryRow {
  id: string;
  module: string;
  actionType: InternshipOffersActionType;
  title: string;
  actor: string;
  timestamp: string;
  details: string;
}

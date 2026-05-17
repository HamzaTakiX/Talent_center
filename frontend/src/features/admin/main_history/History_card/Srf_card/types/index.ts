export interface SrfStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'total' | 'validated' | 'pending' | 'created';
}

export type SrfActionType = 'validate' | 'update' | 'create';

export interface SrfHistoryRow {
  id: string;
  module: string;
  actionType: SrfActionType;
  title: string;
  actor: string;
  timestamp: string;
  details: string;
}

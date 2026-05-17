export interface EncadrantsStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'total' | 'assignments' | 'validations' | 'meetings';
}

export type EncadrantsHistoryActionType = 'update' | 'validate' | 'create';

export interface EncadrantsHistoryRow {
  id: string;
  module: string;
  actionType: EncadrantsHistoryActionType;
  title: string;
  actor: string;
  timestamp: string;
  details: string;
}

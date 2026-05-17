export interface ReportsStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'total' | 'submitted' | 'validated' | 'late';
}

export type ReportsActionType = 'create' | 'validate' | 'update';

export interface ReportsHistoryRow {
  id: string;
  module: string;
  actionType: ReportsActionType;
  title: string;
  actor: string;
  timestamp: string;
  details: string;
}

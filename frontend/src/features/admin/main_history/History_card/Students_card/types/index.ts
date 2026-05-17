export interface StudentsStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'users' | 'update' | 'create' | 'delete';
}

export type StudentsHistoryActionType = 'update' | 'create' | 'delete';

export interface StudentsHistoryRow {
  id: string;
  module: string;
  actionType: StudentsHistoryActionType;
  title: string;
  actor: string;
  timestamp: string;
}

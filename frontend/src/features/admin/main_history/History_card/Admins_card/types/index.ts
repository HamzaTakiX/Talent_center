export interface AdminStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'total' | 'update' | 'create' | 'permission';
}

export type AdminHistoryActionType = 'update' | 'create';

export interface AdminHistoryRow {
  id: string;
  module: string;
  actionType: AdminHistoryActionType;
  title: string;
  actor: string;
  timestamp: string;
  details: string;
}

export interface TotalActionsStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'history' | 'calendar';
}

export type TotalActionsItemType = 'update' | 'create' | 'delete';

export interface TotalActionsHistoryRow {
  id: string;
  module: string;
  type: TotalActionsItemType;
  title: string;
  actor: string;
  timestamp: string;
}

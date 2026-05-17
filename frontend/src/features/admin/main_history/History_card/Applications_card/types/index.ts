export interface ApplicationsStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'total' | 'submitted' | 'accepted' | 'rejected';
}

export type ApplicationsActionType = 'create' | 'update';

export interface ApplicationsHistoryRow {
  id: string;
  module: string;
  actionType: ApplicationsActionType;
  title: string;
  actor: string;
  timestamp: string;
  details: string;
}

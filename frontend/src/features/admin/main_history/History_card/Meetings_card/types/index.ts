export interface MeetingsStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'total' | 'scheduled' | 'completed' | 'canceled';
}

export type MeetingsActionType = 'create' | 'update' | 'delete';

export interface MeetingsHistoryRow {
  id: string;
  module: string;
  actionType: MeetingsActionType;
  title: string;
  actor: string;
  timestamp: string;
  details: string;
}

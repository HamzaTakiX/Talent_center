export interface AnnouncementsStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'total' | 'published' | 'edited' | 'deleted';
}

export type AnnouncementsActionType = 'create' | 'update' | 'delete';

export interface AnnouncementsHistoryRow {
  id: string;
  module: string;
  actionType: AnnouncementsActionType;
  title: string;
  actor: string;
  timestamp: string;
  details: string;
}

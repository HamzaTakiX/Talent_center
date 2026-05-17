export type HistoryModule =
  | 'Internship Offers'
  | 'Documents'
  | 'Students'
  | 'Announcements'
  | 'SRF'
  | 'Encadrants'
  | 'Reports'
  | 'Chat';

export type HistoryActionType =
  | 'create'
  | 'update'
  | 'validate'
  | 'archive'
  | 'review'
  | 'assign'
  | 'submit';

export type HistoryStatus = 'success' | 'pending' | 'warning';

export type HistoryPriority = 'high' | 'medium' | 'low';

export interface HistoryStatItem {
  key: string;
  label: string;
  value: string;
  icon: 'activity' | 'users' | 'shield' | 'graduation' | 'briefcase' | 'file' | 'receipt' | 'message';
  colorClassName: string;
}

export interface HistoryActionRow {
  id: string;
  module: HistoryModule;
  actionType: HistoryActionType;
  status: HistoryStatus;
  priority: HistoryPriority;
  title: string;
  actor: string;
  timestamp: string;
}

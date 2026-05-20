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

export type HistoryCriticality = 'INFO' | 'IMPORTANT' | 'CRITICAL' | 'AUTOMATED';

export interface HistoryActionRow {
  id: string;
  module: HistoryModule;
  actionType: HistoryActionType;
  status: HistoryStatus;
  priority: HistoryPriority;
  title: string;
  actor: string;
  timestamp: string;
  criticality?: HistoryCriticality;
  sourceApp?: string;
  entityType?: string;
  entityId?: number | null;
  entityPath?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  isAutomated?: boolean;
  raw?: unknown;
}

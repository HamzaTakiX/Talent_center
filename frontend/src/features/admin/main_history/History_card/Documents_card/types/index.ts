export interface DocumentsStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'total' | 'uploaded' | 'validated' | 'rejected';
}

export type DocumentsActionType = 'validate' | 'create' | 'update';

export interface DocumentsHistoryRow {
  id: string;
  module: string;
  actionType: DocumentsActionType;
  title: string;
  actor: string;
  timestamp: string;
  details: string;
}

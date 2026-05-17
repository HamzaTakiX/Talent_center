export interface TasksStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'total' | 'created' | 'completed' | 'updated';
}

export type TasksActionType = 'create' | 'update';

export interface TasksHistoryRow {
  id: string;
  module: string;
  actionType: TasksActionType;
  title: string;
  actor: string;
  timestamp: string;
  details: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskTabId = 'all' | 'todo' | 'in_progress' | 'in_review' | 'done';

export interface TaskTab {
  id: TaskTabId;
  label: string;
  count: number;
}

export interface EncadrantTaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  daysRemainingLabel: string;
  progress: number;
}

export interface TaskProgressSummary {
  completedCount: number;
  totalCount: number;
  percentLabel: string;
  stats: {
    todo: number;
    in_progress: number;
    in_review: number;
    done: number;
  };
}

export type StudentTaskItemStatus = 'done' | 'in_progress' | 'upcoming';

export type StudentTaskItemPriority = 'high' | 'medium';

export interface StudentTaskItem {
  id: string;
  title: string;
  status: StudentTaskItemStatus;
  priority: StudentTaskItemPriority;
  deadline: string;
}

export interface StudentTaskDetail {
  studentId: string;
  name: string;
  level: string;
  completedTasks: number;
  totalTasks: number;
  progressPercent: number;
  tasks: StudentTaskItem[];
}

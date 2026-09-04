export type TaskAssigneeId = 'bennani' | 'admin' | 'finance';

export interface TaskAssigneeProfile {
  id: TaskAssigneeId;
  nameKey: string;
  initials: string;
  avatarUrl: string;
}

export const TASK_ASSIGNEE_PROFILES: Record<TaskAssigneeId, TaskAssigneeProfile> = {
  bennani: {
    id: 'bennani',
    nameKey: 'student.encadrant.task.platform.supervisors.bennani',
    initials: 'AB',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  admin: {
    id: 'admin',
    nameKey: 'student.encadrant.task.platform.supervisors.admin',
    initials: 'ES',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  finance: {
    id: 'finance',
    nameKey: 'student.encadrant.task.platform.supervisors.finance',
    initials: 'SF',
    avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
};

export function getTaskAssignee(supervisorKey?: string): TaskAssigneeProfile {
  if (supervisorKey?.endsWith('.admin')) return TASK_ASSIGNEE_PROFILES.admin;
  if (supervisorKey?.endsWith('.finance')) return TASK_ASSIGNEE_PROFILES.finance;
  return TASK_ASSIGNEE_PROFILES.bennani;
}

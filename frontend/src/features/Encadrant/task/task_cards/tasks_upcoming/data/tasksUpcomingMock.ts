import type { TasksUpcomingStudent, TasksUpcomingSummaryStat } from '../types';

export const tasksUpcomingSummaryMock: TasksUpcomingSummaryStat[] = [
  { label: 'Total Tasks', value: 85, tone: 'green', icon: 'total' },
  { label: 'Completed Tasks', value: 45, tone: 'blue', icon: 'completed' },
  { label: 'Pending Tasks', value: 40, tone: 'orange', icon: 'pending' },
];

export const tasksUpcomingStudentsMock: TasksUpcomingStudent[] = [
  {
    id: 'tu-1',
    name: 'Youssef Benani',
    level: 'Master 2',
    totalTasks: 15,
    nextTaskTitle: 'Implement Smart Contract Logic',
    nextTaskDue: '23/04/2026',
    completedTasks: 6,
    progressPercent: 40,
  },
  {
    id: 'tu-2',
    name: 'Karim El Fassi',
    level: 'Master 1',
    totalTasks: 13,
    nextTaskTitle: 'Fix Authentication Bugs',
    nextTaskDue: '21/04/2026',
    completedTasks: 4,
    progressPercent: 31,
  },
];

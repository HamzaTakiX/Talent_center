import type { TasksDoneStudent, TasksDoneSummaryStat } from '../types';

export const tasksDoneSummaryMock: TasksDoneSummaryStat[] = [
  { label: 'Total Tasks', value: 85, tone: 'green', icon: 'total' },
  { label: 'Completed Tasks', value: 45, tone: 'blue', icon: 'completed' },
  { label: 'Pending Tasks', value: 40, tone: 'orange', icon: 'pending' },
];

export const tasksDoneStudentsMock: TasksDoneStudent[] = [
  {
    id: 'td-1',
    name: 'Sarah Alami',
    level: 'Master 2',
    totalTasks: 12,
    nextTaskTitle: 'Complete User Interface Mockups',
    nextTaskDue: '25/04/2026',
    completedTasks: 8,
    progressPercent: 67,
  },
  {
    id: 'td-2',
    name: 'Amina Khalil',
    level: 'Master 2',
    totalTasks: 10,
    nextTaskTitle: 'Final Model Testing',
    nextTaskDue: '28/04/2026',
    completedTasks: 9,
    progressPercent: 90,
  },
  {
    id: 'td-3',
    name: 'Mohamed Idrissi',
    level: 'Master 1',
    totalTasks: 14,
    nextTaskTitle: 'Integrate Sensors with Gateway',
    nextTaskDue: '26/04/2026',
    completedTasks: 8,
    progressPercent: 57,
  },
  {
    id: 'td-4',
    name: 'Fatima Zahra',
    level: 'Master 2',
    totalTasks: 11,
    nextTaskTitle: 'Deploy to Production Environment',
    nextTaskDue: '02/05/2026',
    completedTasks: 10,
    progressPercent: 91,
  },
];

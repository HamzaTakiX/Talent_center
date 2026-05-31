import type { StudentTaskDetail, StudentTaskItem } from '../types';

const sarahAlamiTasks: StudentTaskItem[] = [
  {
    id: 'task-1',
    title: 'Research Existing Solutions',
    status: 'done',
    priority: 'high',
    deadline: '01/04/2026',
  },
  {
    id: 'task-2',
    title: 'Define System Requirements',
    status: 'done',
    priority: 'high',
    deadline: '05/04/2026',
  },
  {
    id: 'task-3',
    title: 'Create Database Schema',
    status: 'done',
    priority: 'medium',
    deadline: '10/04/2026',
  },
  {
    id: 'task-4',
    title: 'Design User Interface',
    status: 'in_progress',
    priority: 'high',
    deadline: '20/04/2026',
  },
  {
    id: 'task-5',
    title: 'Complete User Interface Mockups',
    status: 'upcoming',
    priority: 'medium',
    deadline: '25/04/2026',
  },
  {
    id: 'task-6',
    title: 'Implement Backend API',
    status: 'upcoming',
    priority: 'high',
    deadline: '05/05/2026',
  },
];

const youssefBenaniTasks: StudentTaskItem[] = [
  {
    id: 'task-y1',
    title: 'Blockchain Architecture Review',
    status: 'done',
    priority: 'high',
    deadline: '08/04/2026',
  },
  {
    id: 'task-y2',
    title: 'Smart Contract Specification',
    status: 'in_progress',
    priority: 'high',
    deadline: '18/04/2026',
  },
  {
    id: 'task-y3',
    title: 'Implement Smart Contract Logic',
    status: 'upcoming',
    priority: 'high',
    deadline: '23/04/2026',
  },
];

const aminaKhalilTasks: StudentTaskItem[] = [
  {
    id: 'task-a1',
    title: 'Dataset Preparation',
    status: 'done',
    priority: 'medium',
    deadline: '02/04/2026',
  },
  {
    id: 'task-a2',
    title: 'Model Training Pipeline',
    status: 'done',
    priority: 'high',
    deadline: '12/04/2026',
  },
  {
    id: 'task-a3',
    title: 'Final Model Testing',
    status: 'in_progress',
    priority: 'medium',
    deadline: '28/04/2026',
  },
];

export const studentTaskDetailsById: Record<string, StudentTaskDetail> = {
  'st-1': {
    studentId: 'st-1',
    name: 'Sarah Alami',
    level: 'Master 2',
    completedTasks: 8,
    totalTasks: 12,
    progressPercent: 67,
    tasks: sarahAlamiTasks,
  },
  'st-2': {
    studentId: 'st-2',
    name: 'Youssef Benani',
    level: 'Master 2',
    completedTasks: 6,
    totalTasks: 15,
    progressPercent: 40,
    tasks: youssefBenaniTasks,
  },
  'st-3': {
    studentId: 'st-3',
    name: 'Amina Khalil',
    level: 'Master 2',
    completedTasks: 9,
    totalTasks: 10,
    progressPercent: 90,
    tasks: aminaKhalilTasks,
  },
};

export const getStudentTaskDetail = (studentId: string): StudentTaskDetail | undefined =>
  studentTaskDetailsById[studentId];

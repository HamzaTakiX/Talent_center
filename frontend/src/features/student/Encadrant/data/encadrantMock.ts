import {
  Calendar,
  CalendarDays,
  CheckSquare,
  FilePenLine,
  MessageSquare,
  Users,
} from 'lucide-react';
import type {
  EncadrantMeetingItem,
  EncadrantQuickAction,
  EncadrantReportChapter,
  EncadrantStatIconKey,
  EncadrantStatItem,
  EncadrantSupervisor,
  EncadrantTaskItem,
} from '../types';

export const encadrantSupervisor: EncadrantSupervisor = {
  initials: 'AB',
  name: 'Dr. Ahmed Bennani',
  department: 'Computer Science',
  specialty: 'AI & Machine Learning',
  email: 'ahmed.bennani@university.ma',
};

export const encadrantStatIconMap: Record<EncadrantStatIconKey, typeof CheckSquare> = {
  tasks: CheckSquare,
  meetings: Calendar,
  report: FilePenLine,
  deadline: CalendarDays,
};

export const encadrantStatColorMap: Record<EncadrantStatIconKey, string> = {
  tasks: 'bg-[#f97316]',
  meetings: 'bg-[#2b7fff]',
  report: 'bg-[#22c55e]',
  deadline: 'bg-[#ef4444]',
};

export const encadrantStats: EncadrantStatItem[] = [
  { label: 'Tasks Pending', value: '3', iconKey: 'tasks' },
  { label: 'Upcoming Meetings', value: '2', iconKey: 'meetings' },
  { label: 'Report Progress', value: '65%', iconKey: 'report' },
  { label: 'Days to Deadline', value: '45', iconKey: 'deadline' },
];

export const encadrantReminder = {
  title: 'Rappel: Réunion hebdomadaire demain',
  message:
    "Votre réunion de suivi hebdomadaire avec Dr. Ahmed Bennani est prévue demain à 14:00. N'oubliez pas de préparer votre rapport d'avancement.",
  actionLabel: 'Préparer',
};

export const encadrantMeetings: EncadrantMeetingItem[] = [
  {
    id: 'meet-1',
    title: 'Weekly Progress Review',
    dateTime: '18/04/2026 à 14:00',
  },
  {
    id: 'meet-2',
    title: 'Report Discussion',
    dateTime: '22/04/2026 à 10:00',
  },
];

export const encadrantTasks: EncadrantTaskItem[] = [
  {
    id: 'task-1',
    title: 'Complete Chapter 2 - Literature Review',
    priority: 'high',
    dueDate: '20/04/2026',
    status: 'in_progress',
  },
  {
    id: 'task-2',
    title: 'Prepare presentation slides',
    priority: 'medium',
    dueDate: '25/04/2026',
    status: 'todo',
  },
  {
    id: 'task-3',
    title: 'Submit weekly progress report',
    priority: 'high',
    dueDate: '17/04/2026',
    status: 'in_review',
  },
];

export const encadrantReportChapters: EncadrantReportChapter[] = [
  { id: 'ch-1', label: 'Introduction', progress: 100 },
  { id: 'ch-2', label: 'Literature Review', progress: 80 },
  { id: 'ch-3', label: 'Methodology', progress: 60 },
  { id: 'ch-4', label: 'Implementation', progress: 40 },
  { id: 'ch-5', label: 'Results', progress: 20 },
  { id: 'ch-6', label: 'Conclusion', progress: 0 },
];

export const encadrantGlobalReportProgress = 65;

export const encadrantQuickActions: EncadrantQuickAction[] = [
  {
    id: 'qa-chat',
    title: 'Chat',
    subtitle: 'Discuter avec votre encadrant',
    icon: MessageSquare,
    iconClassName: 'text-[#2b7fff]',
  },
  {
    id: 'qa-workspace',
    title: 'Workspace',
    subtitle: 'Espace collaboratif',
    icon: Users,
    iconClassName: 'text-[#a855f7]',
  },
  {
    id: 'qa-reports',
    title: 'Reports',
    subtitle: 'Rédiger votre rapport',
    icon: FilePenLine,
    iconClassName: 'text-[#22c55e]',
  },
  {
    id: 'qa-agenda',
    title: 'Agenda',
    subtitle: 'Gérer vos rendez-vous',
    icon: Calendar,
    iconClassName: 'text-[#f97316]',
  },
];

export const encadrantTaskPriorityLabels: Record<EncadrantTaskItem['priority'], string> = {
  high: 'Priorité haute',
  medium: 'Priorité moyenne',
};

export const encadrantTaskPriorityClasses: Record<EncadrantTaskItem['priority'], string> = {
  high: 'bg-red-50 text-red-700',
  medium: 'bg-orange-50 text-orange-700',
};

export const encadrantTaskStatusLabels: Record<EncadrantTaskItem['status'], string> = {
  in_progress: 'En cours',
  todo: 'À faire',
  in_review: 'En révision',
};

export const encadrantTaskStatusClasses: Record<EncadrantTaskItem['status'], string> = {
  in_progress: 'bg-[#fef9c2] text-[#854d0e]',
  todo: 'bg-[var(--admin-surface-inset)] text-[#4b5563]',
  in_review: 'bg-[#eff6ff] text-[#1d4ed8]',
};

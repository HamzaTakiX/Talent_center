import {
  Calendar,
  CalendarDays,
  CheckSquare,
  FilePenLine,
  MessageSquare,
  Users,
} from 'lucide-react';
import {
  STUDENT_ENCADRANT_AGENDA_PATH,
  STUDENT_ENCADRANT_CHAT_PATH,
  STUDENT_ENCADRANT_WORKSPACE_PATH,
} from '../constants/routes';
import { STUDENT_REPORTS_PATH } from '../../reports/constants/routes';
import type {
  EncadrantMeetingItem,
  EncadrantMilestone,
  EncadrantPriorityAlert,
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
  avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
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

export const encadrantStatAccentMap: Record<
  EncadrantStatIconKey,
  { accent: string; accentBg: string }
> = {
  tasks: { accent: '#f97316', accentBg: 'rgba(249, 115, 22, 0.16)' },
  meetings: { accent: '#3b82f6', accentBg: 'rgba(59, 130, 246, 0.16)' },
  report: { accent: '#22c55e', accentBg: 'rgba(34, 197, 94, 0.16)' },
  deadline: { accent: '#ef4444', accentBg: 'rgba(239, 68, 68, 0.16)' },
};

export const encadrantStats: EncadrantStatItem[] = [
  { label: 'Tasks Pending', value: '3', iconKey: 'tasks' },
  { label: 'Upcoming Meetings', value: '2', iconKey: 'meetings' },
  { label: 'Report Progress', value: '65%', iconKey: 'report' },
  { label: 'Days to Deadline', value: '45', iconKey: 'deadline' },
];

export const encadrantReminder = {
  meetingTime: '14:00',
};

export const encadrantPriorityAlerts: EncadrantPriorityAlert[] = [
  {
    id: 'alert-1',
    titleKey: 'student.encadrant.alerts.deadlineTomorrow',
    messageKey: 'student.encadrant.alerts.deadlineTomorrowMsg',
    severity: 'danger',
  },
  {
    id: 'alert-2',
    titleKey: 'student.encadrant.alerts.missingDoc',
    messageKey: 'student.encadrant.alerts.missingDocMsg',
    severity: 'warning',
  },
  {
    id: 'alert-3',
    titleKey: 'student.encadrant.alerts.feedback',
    messageKey: 'student.encadrant.alerts.feedbackMsg',
    severity: 'success',
  },
  {
    id: 'alert-4',
    titleKey: 'student.encadrant.alerts.revision',
    messageKey: 'student.encadrant.alerts.revisionMsg',
    severity: 'info',
  },
];

export const encadrantMeetings: EncadrantMeetingItem[] = [
  {
    id: 'meet-1',
    title: 'Weekly Progress Review',
    dateTime: '18/04/2026 à 14:00',
    startAt: '2026-04-18T14:00:00',
  },
  {
    id: 'meet-2',
    title: 'Report Discussion',
    dateTime: '22/04/2026 à 10:00',
    startAt: '2026-04-22T10:00:00',
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

export const encadrantMilestones: EncadrantMilestone[] = [
  {
    id: 'm1',
    labelKey: 'student.encadrant.milestones.validated',
    status: 'completed',
    dateKey: 'student.encadrant.milestones.dates.validated',
  },
  {
    id: 'm2',
    labelKey: 'student.encadrant.milestones.supervisor',
    status: 'completed',
    dateKey: 'student.encadrant.milestones.dates.supervisor',
  },
  {
    id: 'm3',
    labelKey: 'student.encadrant.milestones.midterm',
    status: 'current',
    dateKey: 'student.encadrant.milestones.dates.midterm',
  },
  {
    id: 'm4',
    labelKey: 'student.encadrant.milestones.final',
    status: 'upcoming',
    dateKey: 'student.encadrant.milestones.dates.final',
  },
  {
    id: 'm5',
    labelKey: 'student.encadrant.milestones.defense',
    status: 'upcoming',
    dateKey: 'student.encadrant.milestones.dates.defense',
  },
];

export const encadrantQuickActions: EncadrantQuickAction[] = [
  {
    id: 'qa-chat',
    title: 'Chat',
    subtitle: 'Discuter avec votre encadrant',
    icon: MessageSquare,
    iconClassName: 'text-[#2b7fff]',
    path: STUDENT_ENCADRANT_CHAT_PATH,
  },
  {
    id: 'qa-workspace',
    title: 'Workspace',
    subtitle: 'Espace collaboratif',
    icon: Users,
    iconClassName: 'text-[#a855f7]',
    path: STUDENT_ENCADRANT_WORKSPACE_PATH,
  },
  {
    id: 'qa-reports',
    title: 'Reports',
    subtitle: 'Rédiger votre rapport',
    icon: FilePenLine,
    iconClassName: 'text-[#22c55e]',
    path: STUDENT_REPORTS_PATH,
  },
  {
    id: 'qa-agenda',
    title: 'Agenda',
    subtitle: 'Gérer vos rendez-vous',
    icon: Calendar,
    iconClassName: 'text-[#f97316]',
    path: STUDENT_ENCADRANT_AGENDA_PATH,
  },
];

export const encadrantTaskPriorityLabels: Record<EncadrantTaskItem['priority'], string> = {
  high: 'Priorité haute',
  medium: 'Priorité moyenne',
};

export const encadrantTaskPriorityClasses: Record<EncadrantTaskItem['priority'], string> = {
  high: 'admin-badge admin-badge--danger',
  medium: 'admin-badge admin-badge--warning',
};

export const encadrantTaskStatusLabels: Record<EncadrantTaskItem['status'], string> = {
  in_progress: 'En cours',
  todo: 'À faire',
  in_review: 'En révision',
};

export const encadrantTaskStatusClasses: Record<EncadrantTaskItem['status'], string> = {
  in_progress: 'admin-badge admin-badge--warning',
  todo: 'admin-badge admin-badge--neutral',
  in_review: 'admin-badge admin-badge--info',
};

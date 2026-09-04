import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Calendar,
  FilePenLine,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import {
  ENCADRANT_AGENDA_PATH,
  ENCADRANT_CHAT_PATH,
  ENCADRANT_PATH,
  ENCADRANT_REPORTS_PATH,
  ENCADRANT_TASK_PATH,
  ENCADRANT_WORKSPACE_PATH,
} from '../constants/routes';

/** i18n key under `encadrant.header.titles.*` for the current Encadrant route. */
export function getEncadrantHeaderTitleKey(pathname: string): string {
  if (pathname.startsWith('/encadrant/dashboard/assigned-students')) {
    return 'encadrant.header.titles.assignedStudents';
  }
  if (pathname.startsWith('/encadrant/dashboard/students-at-risk')) {
    return 'encadrant.header.titles.studentsAtRisk';
  }
  if (pathname.startsWith('/encadrant/dashboard/upcoming-meetings')) {
    return 'encadrant.header.titles.upcomingMeetings';
  }
  if (pathname.startsWith('/encadrant/dashboard/reports-pending')) {
    return 'encadrant.header.titles.reportsPending';
  }
  if (pathname.startsWith('/encadrant/students/')) {
    return 'encadrant.header.titles.studentDetail';
  }
  if (pathname === ENCADRANT_CHAT_PATH || pathname.startsWith(`${ENCADRANT_CHAT_PATH}/`)) {
    return 'encadrant.header.titles.chat';
  }
  if (pathname === ENCADRANT_AGENDA_PATH || pathname.startsWith(`${ENCADRANT_AGENDA_PATH}/`)) {
    return 'encadrant.header.titles.agenda';
  }
  if (pathname.startsWith('/encadrant/task/create-manually')) {
    return 'encadrant.header.titles.createTask';
  }
  if (pathname.startsWith('/encadrant/task/ai-task-creation')) {
    return 'encadrant.header.titles.aiTask';
  }
  if (pathname.startsWith('/encadrant/task/tasks-upcoming')) {
    return 'encadrant.header.titles.tasksUpcoming';
  }
  if (pathname.startsWith('/encadrant/task/tasks-in-progress')) {
    return 'encadrant.header.titles.tasksInProgress';
  }
  if (pathname.startsWith('/encadrant/task/tasks-done')) {
    return 'encadrant.header.titles.tasksDone';
  }
  if (pathname === ENCADRANT_TASK_PATH || pathname.startsWith(`${ENCADRANT_TASK_PATH}/`)) {
    return 'encadrant.header.titles.task';
  }
  if (pathname === ENCADRANT_WORKSPACE_PATH || pathname.startsWith(`${ENCADRANT_WORKSPACE_PATH}/`)) {
    return 'encadrant.header.titles.workspace';
  }
  if (pathname.match(/\/encadrant\/reports\/students\/[^/]+\/reports\//)) {
    return 'encadrant.header.titles.reportView';
  }
  if (pathname.startsWith('/encadrant/reports/submitted')) {
    return 'encadrant.header.titles.reportsSubmitted';
  }
  if (pathname.startsWith('/encadrant/reports/pending')) {
    return 'encadrant.header.titles.reportsPendingList';
  }
  if (pathname.startsWith('/encadrant/reports/late')) {
    return 'encadrant.header.titles.reportsLate';
  }
  if (pathname.startsWith('/encadrant/reports/validated')) {
    return 'encadrant.header.titles.reportsValidated';
  }
  if (pathname === ENCADRANT_REPORTS_PATH || pathname.startsWith(`${ENCADRANT_REPORTS_PATH}/`)) {
    return 'encadrant.header.titles.reports';
  }
  if (pathname === ENCADRANT_PATH || pathname === `${ENCADRANT_PATH}/`) {
    return 'encadrant.header.titles.dashboard';
  }
  return 'encadrant.header.defaultTitle';
}

const TITLE_ICONS: Record<string, LucideIcon> = {
  'encadrant.header.titles.dashboard': LayoutDashboard,
  'encadrant.header.titles.assignedStudents': Users,
  'encadrant.header.titles.studentsAtRisk': AlertTriangle,
  'encadrant.header.titles.upcomingMeetings': Calendar,
  'encadrant.header.titles.reportsPending': FilePenLine,
  'encadrant.header.titles.studentDetail': Users,
  'encadrant.header.titles.chat': MessageSquare,
  'encadrant.header.titles.agenda': Calendar,
  'encadrant.header.titles.task': ListTodo,
  'encadrant.header.titles.tasksUpcoming': ListTodo,
  'encadrant.header.titles.tasksInProgress': ListTodo,
  'encadrant.header.titles.tasksDone': ListTodo,
  'encadrant.header.titles.createTask': ListTodo,
  'encadrant.header.titles.aiTask': Sparkles,
  'encadrant.header.titles.workspace': Video,
  'encadrant.header.titles.reports': FilePenLine,
  'encadrant.header.titles.reportsSubmitted': FilePenLine,
  'encadrant.header.titles.reportsPendingList': FilePenLine,
  'encadrant.header.titles.reportsLate': FilePenLine,
  'encadrant.header.titles.reportsValidated': FilePenLine,
  'encadrant.header.titles.reportView': FilePenLine,
};

export function getEncadrantHeaderIcon(pathname: string): LucideIcon {
  const key = getEncadrantHeaderTitleKey(pathname);
  return TITLE_ICONS[key] ?? LayoutDashboard;
}

export function isEncadrantNavActive(itemPath: string, pathname: string): boolean {
  if (itemPath === ENCADRANT_PATH) {
    return (
      pathname === ENCADRANT_PATH ||
      pathname === `${ENCADRANT_PATH}/` ||
      pathname.startsWith('/encadrant/dashboard/') ||
      pathname.startsWith('/encadrant/students/')
    );
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

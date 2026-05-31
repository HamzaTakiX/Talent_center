export { EncadrantDashboardPage, EncadrantStudentDetailPage } from './dashboard';
export { EncadrantAssignedStudentsPage } from './dashboard/dashboard_cards/assigned_students';
export { EncadrantStudentsAtRiskPage } from './dashboard/dashboard_cards/students_at_risk';
export { EncadrantReportsPendingPage } from './dashboard/dashboard_cards/reports_pending';
export { EncadrantUpcomingMeetingsPage } from './dashboard/dashboard_cards/upcoming_meetings';
export { getEncadrantStudentDetailPath, ENCADRANT_STUDENTS_PATH } from './dashboard';
export { EncadrantChatPage } from './chat';
export { EncadrantAgendaPage } from './agenda';
export {
  EncadrantTaskPage,
  EncadrantCreateTaskManuallyPage,
  EncadrantAiTaskCreationPage,
  EncadrantStudentTaskDetailPage,
} from './task';
export { EncadrantTasksDonePage } from './task/task_cards/tasks_done';
export { EncadrantTasksInProgressPage } from './task/task_cards/tasks_in_progress';
export { EncadrantTasksUpcomingPage } from './task/task_cards/tasks_upcoming';
export { EncadrantWorkspacePage, EncadrantWorkspaceStudentDetailPage } from './workspace';
export {
  EncadrantReportsPage,
  EncadrantStudentReportsDetailPage,
  EncadrantReportViewPage,
  EncadrantReportsSubmittedPage,
  EncadrantReportsPendingCardPage,
  EncadrantReportsLatePage,
  EncadrantReportsValidatedPage,
} from './reports';

export { default as EncadrantLayout } from './components/EncadrantLayout';
export { default as EncadrantSidebar } from './components/EncadrantSidebar';

export {
  ENCADRANT_PATH,
  ENCADRANT_CHAT_PATH,
  ENCADRANT_AGENDA_PATH,
  ENCADRANT_TASK_PATH,
  ENCADRANT_WORKSPACE_PATH,
  ENCADRANT_REPORTS_PATH,
} from './constants/routes';

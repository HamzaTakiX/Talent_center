import type {
  StudentPlatformTask,
  TaskDeadlineItem,
  TaskKpiStat,
  TaskMilestone,
  TaskNotification,
  TaskPriorityAlert,
  TaskProgressMetric,
  TaskActivityItem,
} from '../types';

export const taskPlatformKpis: TaskKpiStat[] = [
  { id: 'total', value: '24', trend: 8, sparkline: [12, 14, 15, 18, 20, 22, 24] },
  { id: 'completed', value: '12', trend: 15, sparkline: [4, 5, 7, 8, 9, 11, 12] },
  { id: 'pending', value: '9', trend: -3, sparkline: [14, 13, 12, 11, 10, 9, 9] },
  { id: 'overdue', value: '3', trend: 12, sparkline: [1, 1, 2, 2, 2, 3, 3] },
  { id: 'completionRate', value: '50%', trend: 6, sparkline: [32, 36, 38, 42, 45, 48, 50] },
];

export const taskProgressMetrics: TaskProgressMetric[] = [
  { id: 'overall', labelKey: 'student.encadrant.task.platform.progress.overall', progress: 55 },
  { id: 'internship', labelKey: 'student.encadrant.task.platform.progress.internship', progress: 68 },
  { id: 'report', labelKey: 'student.encadrant.task.platform.progress.report', progress: 45 },
  { id: 'documents', labelKey: 'student.encadrant.task.platform.progress.documents', progress: 54 },
  { id: 'meetings', labelKey: 'student.encadrant.task.platform.progress.meetings', progress: 82 },
];

export const taskPriorityAlerts: TaskPriorityAlert[] = [
  {
    id: 'alert-1',
    titleKey: 'student.encadrant.task.platform.alerts.deadlineTomorrow',
    messageKey: 'student.encadrant.task.platform.alerts.deadlineTomorrowMsg',
    severity: 'danger',
  },
  {
    id: 'alert-2',
    titleKey: 'student.encadrant.task.platform.alerts.missingDoc',
    messageKey: 'student.encadrant.task.platform.alerts.missingDocMsg',
    severity: 'warning',
  },
  {
    id: 'alert-3',
    titleKey: 'student.encadrant.task.platform.alerts.feedback',
    messageKey: 'student.encadrant.task.platform.alerts.feedbackMsg',
    severity: 'success',
  },
  {
    id: 'alert-4',
    titleKey: 'student.encadrant.task.platform.alerts.revision',
    messageKey: 'student.encadrant.task.platform.alerts.revisionMsg',
    severity: 'info',
  },
];

export const initialPlatformTasks: StudentPlatformTask[] = [
  {
    id: 'task-1',
    titleKey: 'student.encadrant.task.platform.items.chapter2',
    descriptionKey: 'student.encadrant.task.platform.items.chapter2Desc',
    status: 'in_progress',
    priority: 'high',
    category: 'reports',
    dueAt: '2026-04-20',
    daysRemaining: 4,
    progress: 75,
    supervisorKey: 'student.encadrant.task.platform.supervisors.bennani',
    fromSupervisor: true,
    assignedByKey: 'student.encadrant.task.platform.supervisors.bennani',
    assignedAt: '2026-04-10',
    feedbackStatusKey: 'student.encadrant.task.platform.feedback.revision',
  },
  {
    id: 'task-2',
    titleKey: 'student.encadrant.task.platform.items.slides',
    descriptionKey: 'student.encadrant.task.platform.items.slidesDesc',
    status: 'todo',
    priority: 'medium',
    category: 'meetings',
    dueAt: '2026-04-25',
    daysRemaining: 9,
    progress: 0,
    supervisorKey: 'student.encadrant.task.platform.supervisors.bennani',
    fromSupervisor: true,
    assignedByKey: 'student.encadrant.task.platform.supervisors.bennani',
    assignedAt: '2026-04-12',
    feedbackStatusKey: 'student.encadrant.task.platform.feedback.pending',
  },
  {
    id: 'task-3',
    titleKey: 'student.encadrant.task.platform.items.weeklyReport',
    descriptionKey: 'student.encadrant.task.platform.items.weeklyReportDesc',
    status: 'in_review',
    priority: 'critical',
    category: 'reports',
    dueAt: '2026-04-17',
    daysRemaining: 1,
    progress: 100,
    supervisorKey: 'student.encadrant.task.platform.supervisors.bennani',
    fromSupervisor: true,
    assignedByKey: 'student.encadrant.task.platform.supervisors.bennani',
    assignedAt: '2026-04-11',
    feedbackStatusKey: 'student.encadrant.task.platform.feedback.approved',
  },
  {
    id: 'task-4',
    titleKey: 'student.encadrant.task.platform.items.userTesting',
    descriptionKey: 'student.encadrant.task.platform.items.userTestingDesc',
    status: 'todo',
    priority: 'medium',
    category: 'internship',
    dueAt: '2026-04-28',
    daysRemaining: 12,
    progress: 0,
    supervisorKey: 'student.encadrant.task.platform.supervisors.bennani',
  },
  {
    id: 'task-5',
    titleKey: 'student.encadrant.task.platform.items.bibliography',
    descriptionKey: 'student.encadrant.task.platform.items.bibliographyDesc',
    status: 'done',
    priority: 'low',
    category: 'reports',
    dueAt: '2026-04-30',
    daysRemaining: 14,
    progress: 100,
    supervisorKey: 'student.encadrant.task.platform.supervisors.bennani',
  },
  {
    id: 'task-6',
    titleKey: 'student.encadrant.task.platform.items.convention',
    descriptionKey: 'student.encadrant.task.platform.items.conventionDesc',
    status: 'blocked',
    priority: 'high',
    category: 'administrative',
    dueAt: '2026-04-22',
    daysRemaining: 6,
    progress: 30,
    supervisorKey: 'student.encadrant.task.platform.supervisors.admin',
  },
  {
    id: 'task-7',
    titleKey: 'student.encadrant.task.platform.items.srfPayment',
    descriptionKey: 'student.encadrant.task.platform.items.srfPaymentDesc',
    status: 'todo',
    priority: 'high',
    category: 'srf',
    dueAt: '2026-04-28',
    daysRemaining: 12,
    progress: 0,
    supervisorKey: 'student.encadrant.task.platform.supervisors.finance',
  },
  {
    id: 'task-8',
    titleKey: 'student.encadrant.task.platform.items.supervisorFeedback',
    descriptionKey: 'student.encadrant.task.platform.items.supervisorFeedbackDesc',
    status: 'in_progress',
    priority: 'high',
    category: 'reports',
    dueAt: '2026-04-19',
    daysRemaining: 3,
    progress: 40,
    supervisorKey: 'student.encadrant.task.platform.supervisors.bennani',
    fromSupervisor: true,
    assignedByKey: 'student.encadrant.task.platform.supervisors.bennani',
    assignedAt: '2026-04-14',
    feedbackStatusKey: 'student.encadrant.task.platform.feedback.pending',
  },
];

export const taskDeadlineItems: TaskDeadlineItem[] = [
  {
    id: 'dl-1',
    titleKey: 'student.encadrant.task.platform.items.weeklyReport',
    dueAt: '2026-04-17',
    daysRemaining: 1,
    risk: 'critical',
  },
  {
    id: 'dl-2',
    titleKey: 'student.encadrant.task.platform.items.chapter2',
    dueAt: '2026-04-20',
    daysRemaining: 4,
    risk: 'high',
  },
  {
    id: 'dl-3',
    titleKey: 'student.encadrant.task.platform.items.convention',
    dueAt: '2026-04-22',
    daysRemaining: 6,
    risk: 'medium',
  },
];

export const taskMilestones: TaskMilestone[] = [
  {
    id: 'm1',
    labelKey: 'student.encadrant.task.platform.milestones.validated',
    status: 'completed',
    dateKey: 'student.encadrant.task.platform.milestones.dates.validated',
  },
  {
    id: 'm2',
    labelKey: 'student.encadrant.task.platform.milestones.supervisor',
    status: 'completed',
    dateKey: 'student.encadrant.task.platform.milestones.dates.supervisor',
  },
  {
    id: 'm3',
    labelKey: 'student.encadrant.task.platform.milestones.midterm',
    status: 'current',
    dateKey: 'student.encadrant.task.platform.milestones.dates.midterm',
  },
  {
    id: 'm4',
    labelKey: 'student.encadrant.task.platform.milestones.final',
    status: 'upcoming',
    dateKey: 'student.encadrant.task.platform.milestones.dates.final',
  },
  {
    id: 'm5',
    labelKey: 'student.encadrant.task.platform.milestones.defense',
    status: 'upcoming',
    dateKey: 'student.encadrant.task.platform.milestones.dates.defense',
  },
];

export const taskNotifications: TaskNotification[] = [
  {
    id: 'tn-1',
    messageKey: 'student.encadrant.task.platform.notifications.assigned',
    timeKey: 'student.encadrant.task.platform.notifications.time1',
  },
  {
    id: 'tn-2',
    messageKey: 'student.encadrant.task.platform.notifications.deadline',
    timeKey: 'student.encadrant.task.platform.notifications.time2',
  },
  {
    id: 'tn-3',
    messageKey: 'student.encadrant.task.platform.notifications.comment',
    timeKey: 'student.encadrant.task.platform.notifications.time3',
  },
  {
    id: 'tn-4',
    messageKey: 'student.encadrant.task.platform.notifications.approved',
    timeKey: 'student.encadrant.task.platform.notifications.time4',
  },
];

export const taskDetailActivity: TaskActivityItem[] = [
  {
    id: 'a1',
    messageKey: 'student.encadrant.task.platform.activity.created',
    timeKey: 'student.encadrant.task.platform.activity.time1',
  },
  {
    id: 'a2',
    messageKey: 'student.encadrant.task.platform.activity.progress',
    timeKey: 'student.encadrant.task.platform.activity.time2',
  },
  {
    id: 'a3',
    messageKey: 'student.encadrant.task.platform.activity.comment',
    timeKey: 'student.encadrant.task.platform.activity.time3',
  },
];

import type {
  AgendaDeadlineItem,
  AgendaExportAction,
  AgendaNotification,
  AgendaPersonalTask,
  AgendaPlatformEvent,
  AgendaProgressMetric,
  AgendaStatCard,
  AgendaSupervisorMeeting,
  AgendaTimelineStep,
} from '../types';

export const agendaPlatformStats: AgendaStatCard[] = [
  { id: 'meetings', value: '4', trend: 12, iconKey: 'meetings' },
  { id: 'tasks', value: '7', trend: -5, iconKey: 'tasks' },
  { id: 'deadlines', value: '3', trend: 0, iconKey: 'deadlines' },
  { id: 'completed', value: '12', trend: 18, iconKey: 'completed' },
];

export const agendaPlatformEvents: AgendaPlatformEvent[] = [
  {
    id: 'evt-1',
    titleKey: 'student.encadrant.agenda.events.weeklyReview.title',
    descriptionKey: 'student.encadrant.agenda.events.weeklyReview.description',
    startAt: '2026-04-18T14:00:00',
    endAt: '2026-04-18T15:00:00',
    category: 'meeting',
    status: 'confirmed',
    organizerKey: 'student.encadrant.agenda.organizers.supervisor',
    showJoin: true,
  },
  {
    id: 'evt-2',
    titleKey: 'student.encadrant.agenda.events.submitChapter2.title',
    descriptionKey: 'student.encadrant.agenda.events.submitChapter2.description',
    startAt: '2026-04-20T23:59:00',
    category: 'deadline',
    status: 'pending',
    priority: 'high',
    organizerKey: 'student.encadrant.agenda.organizers.academic',
  },
  {
    id: 'evt-3',
    titleKey: 'student.encadrant.agenda.events.reportDiscussion.title',
    descriptionKey: 'student.encadrant.agenda.events.reportDiscussion.description',
    startAt: '2026-04-22T10:00:00',
    endAt: '2026-04-22T11:00:00',
    category: 'meeting',
    status: 'confirmed',
    organizerKey: 'student.encadrant.agenda.organizers.supervisor',
    showJoin: true,
  },
  {
    id: 'evt-4',
    titleKey: 'student.encadrant.agenda.events.preparePresentation.title',
    descriptionKey: 'student.encadrant.agenda.events.preparePresentation.description',
    startAt: '2026-04-25T18:00:00',
    category: 'deadline',
    status: 'pending',
    priority: 'medium',
    organizerKey: 'student.encadrant.agenda.organizers.self',
  },
  {
    id: 'evt-5',
    titleKey: 'student.encadrant.agenda.events.midtermEvaluation.title',
    descriptionKey: 'student.encadrant.agenda.events.midtermEvaluation.description',
    startAt: '2026-04-30T15:00:00',
    endAt: '2026-04-30T17:00:00',
    category: 'evaluation',
    status: 'confirmed',
    priority: 'high',
    organizerKey: 'student.encadrant.agenda.organizers.jury',
  },
  {
    id: 'evt-6',
    titleKey: 'student.encadrant.agenda.platform.events.internshipStart.title',
    descriptionKey: 'student.encadrant.agenda.platform.events.internshipStart.description',
    startAt: '2026-04-01T09:00:00',
    category: 'milestone',
    status: 'completed',
    organizerKey: 'student.encadrant.agenda.organizers.careerCenter',
  },
  {
    id: 'evt-7',
    titleKey: 'student.encadrant.agenda.platform.events.srfPayment.title',
    descriptionKey: 'student.encadrant.agenda.platform.events.srfPayment.description',
    startAt: '2026-04-28T12:00:00',
    category: 'financial',
    status: 'pending',
    priority: 'high',
    organizerKey: 'student.encadrant.agenda.organizers.finance',
  },
  {
    id: 'evt-8',
    titleKey: 'student.encadrant.agenda.platform.events.documentUpload.title',
    descriptionKey: 'student.encadrant.agenda.platform.events.documentUpload.description',
    startAt: '2026-04-24T17:00:00',
    category: 'admin',
    status: 'pending',
    organizerKey: 'student.encadrant.agenda.organizers.administration',
  },
];

export const agendaPersonalTasks: AgendaPersonalTask[] = [
  {
    id: 'task-1',
    titleKey: 'student.encadrant.agenda.platform.tasks.literatureReview',
    dueAt: '2026-04-20',
    priority: 'high',
    status: 'in_progress',
  },
  {
    id: 'task-2',
    titleKey: 'student.encadrant.agenda.platform.tasks.slides',
    dueAt: '2026-04-25',
    priority: 'medium',
    status: 'todo',
  },
  {
    id: 'task-3',
    titleKey: 'student.encadrant.agenda.platform.tasks.weeklyReport',
    dueAt: '2026-04-18',
    priority: 'medium',
    status: 'todo',
  },
  {
    id: 'task-4',
    titleKey: 'student.encadrant.agenda.platform.tasks.uploadCv',
    dueAt: '2026-04-12',
    priority: 'low',
    status: 'completed',
  },
];

export const agendaDeadlineItems: AgendaDeadlineItem[] = [
  {
    id: 'dl-1',
    titleKey: 'student.encadrant.agenda.events.submitChapter2.title',
    dueAt: '2026-04-20',
    daysRemaining: 5,
    progress: 72,
    priority: 'high',
    category: 'report',
  },
  {
    id: 'dl-2',
    titleKey: 'student.encadrant.agenda.platform.deadlines.insuranceDoc',
    dueAt: '2026-04-24',
    daysRemaining: 9,
    progress: 40,
    priority: 'medium',
    category: 'document',
  },
  {
    id: 'dl-3',
    titleKey: 'student.encadrant.agenda.events.midtermEvaluation.title',
    dueAt: '2026-04-30',
    daysRemaining: 15,
    progress: 20,
    priority: 'high',
    category: 'evaluation',
  },
  {
    id: 'dl-4',
    titleKey: 'student.encadrant.agenda.platform.deadlines.conventionSign',
    dueAt: '2026-04-26',
    daysRemaining: 11,
    progress: 55,
    priority: 'medium',
    category: 'admin',
  },
];

export const agendaSupervisorMeetings: AgendaSupervisorMeeting[] = [
  {
    id: 'sm-1',
    subjectKey: 'student.encadrant.agenda.events.weeklyReview.title',
    date: '2026-04-18',
    time: '14:00',
    status: 'confirmed',
    meetingTypeKey: 'student.encadrant.agenda.platform.meetingTypes.weekly',
  },
  {
    id: 'sm-2',
    subjectKey: 'student.encadrant.agenda.events.reportDiscussion.title',
    date: '2026-04-22',
    time: '10:00',
    status: 'confirmed',
    meetingTypeKey: 'student.encadrant.agenda.platform.meetingTypes.report',
  },
  {
    id: 'sm-3',
    subjectKey: 'student.encadrant.agenda.platform.meetings.feedback',
    date: '2026-05-02',
    time: '11:30',
    status: 'pending',
    meetingTypeKey: 'student.encadrant.agenda.platform.meetingTypes.feedback',
  },
  {
    id: 'sm-4',
    subjectKey: 'student.encadrant.agenda.platform.meetings.defensePrep',
    date: '2026-05-15',
    time: '09:00',
    status: 'pending',
    meetingTypeKey: 'student.encadrant.agenda.platform.meetingTypes.defense',
  },
];

export const agendaProgressMetrics: AgendaProgressMetric[] = [
  { id: 'internship', labelKey: 'student.encadrant.agenda.platform.progress.internship', progress: 68 },
  { id: 'documents', labelKey: 'student.encadrant.agenda.platform.progress.documents', progress: 54 },
  { id: 'meetings', labelKey: 'student.encadrant.agenda.platform.progress.meetings', progress: 82 },
  { id: 'report', labelKey: 'student.encadrant.agenda.platform.progress.report', progress: 45 },
];

export const agendaNotifications: AgendaNotification[] = [
  {
    id: 'n-1',
    messageKey: 'student.encadrant.agenda.platform.notifications.meetingTomorrow',
    timeKey: 'student.encadrant.agenda.platform.notifications.time1',
    type: 'meeting',
  },
  {
    id: 'n-2',
    messageKey: 'student.encadrant.agenda.platform.notifications.deadlineSoon',
    timeKey: 'student.encadrant.agenda.platform.notifications.time2',
    type: 'deadline',
  },
  {
    id: 'n-3',
    messageKey: 'student.encadrant.agenda.platform.notifications.supervisorMessage',
    timeKey: 'student.encadrant.agenda.platform.notifications.time3',
    type: 'message',
  },
  {
    id: 'n-4',
    messageKey: 'student.encadrant.agenda.platform.notifications.evaluationScheduled',
    timeKey: 'student.encadrant.agenda.platform.notifications.time4',
    type: 'evaluation',
  },
];

export const agendaTimelineSteps: AgendaTimelineStep[] = [
  {
    id: 'step-1',
    labelKey: 'student.encadrant.agenda.platform.timeline.requestSubmitted',
    status: 'completed',
    dateKey: 'student.encadrant.agenda.platform.timeline.dates.request',
  },
  {
    id: 'step-2',
    labelKey: 'student.encadrant.agenda.platform.timeline.approved',
    status: 'completed',
    dateKey: 'student.encadrant.agenda.platform.timeline.dates.approved',
  },
  {
    id: 'step-3',
    labelKey: 'student.encadrant.agenda.platform.timeline.supervisorAssigned',
    status: 'completed',
    dateKey: 'student.encadrant.agenda.platform.timeline.dates.supervisor',
  },
  {
    id: 'step-4',
    labelKey: 'student.encadrant.agenda.platform.timeline.started',
    status: 'completed',
    dateKey: 'student.encadrant.agenda.platform.timeline.dates.started',
  },
  {
    id: 'step-5',
    labelKey: 'student.encadrant.agenda.platform.timeline.midTerm',
    status: 'current',
    dateKey: 'student.encadrant.agenda.platform.timeline.dates.midTerm',
  },
  {
    id: 'step-6',
    labelKey: 'student.encadrant.agenda.platform.timeline.finalReport',
    status: 'upcoming',
    dateKey: 'student.encadrant.agenda.platform.timeline.dates.final',
  },
  {
    id: 'step-7',
    labelKey: 'student.encadrant.agenda.platform.timeline.defense',
    status: 'upcoming',
    dateKey: 'student.encadrant.agenda.platform.timeline.dates.defense',
  },
];

export const agendaExportActions: AgendaExportAction[] = [
  { id: 'pdf', labelKey: 'student.encadrant.agenda.platform.export.pdf', iconKey: 'pdf' },
  { id: 'excel', labelKey: 'student.encadrant.agenda.platform.export.excel', iconKey: 'excel' },
  { id: 'ics', labelKey: 'student.encadrant.agenda.platform.export.ics', iconKey: 'ics' },
  { id: 'google', labelKey: 'student.encadrant.agenda.platform.export.google', iconKey: 'google' },
  { id: 'outlook', labelKey: 'student.encadrant.agenda.platform.export.outlook', iconKey: 'outlook' },
];

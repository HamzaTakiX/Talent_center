import type {
  WorkspaceActivityItem,
  WorkspaceCollaborator,
  WorkspaceDiscussionThread,
  WorkspaceDocument,
  WorkspaceFeedbackItem,
  WorkspaceKpi,
  WorkspaceKnowledgeItem,
  WorkspaceMeetingItem,
  WorkspaceNote,
  WorkspaceNotification,
  WorkspacePlatformTask,
  WorkspaceProgressMetric,
  WorkspaceStickyNote,
} from '../types';

export const workspaceKpis: WorkspaceKpi[] = [
  { id: 'collaborators', value: '3', trend: 0 },
  { id: 'documents', value: '12', trend: 15 },
  { id: 'discussions', value: '5', trend: 8 },
  { id: 'reviews', value: '2', trend: -10 },
  { id: 'activity', value: '28', trend: 22 },
];

export const workspaceCollaborators: WorkspaceCollaborator[] = [
  {
    id: 'c1',
    nameKey: 'student.encadrant.workspace.platform.people.student',
    roleKey: 'student.encadrant.workspace.platform.roles.student',
    initials: 'SA',
    status: 'online',
    isActive: true,
  },
  {
    id: 'c2',
    nameKey: 'student.encadrant.workspace.platform.people.supervisor',
    roleKey: 'student.encadrant.workspace.platform.roles.supervisor',
    initials: 'AB',
    status: 'reviewing',
    isActive: true,
  },
  {
    id: 'c3',
    nameKey: 'student.encadrant.workspace.platform.people.peer',
    roleKey: 'student.encadrant.workspace.platform.roles.peer',
    initials: 'YK',
    status: 'offline',
    isActive: false,
  },
];

export const workspaceStickyNotes: WorkspaceStickyNote[] = [
  {
    id: 'n1',
    textKey: 'student.encadrant.workspace.platform.whiteboard.note1',
    color: 'yellow',
    positionClass: 'absolute left-4 top-4 sm:left-6 sm:top-6',
    editedByKey: 'student.encadrant.workspace.platform.people.student',
  },
  {
    id: 'n2',
    textKey: 'student.encadrant.workspace.platform.whiteboard.note2',
    color: 'blue',
    positionClass: 'absolute left-4 top-28 sm:left-[38%] sm:top-8',
    editedByKey: 'student.encadrant.workspace.platform.people.supervisor',
  },
  {
    id: 'n3',
    textKey: 'student.encadrant.workspace.platform.whiteboard.note3',
    color: 'green',
    positionClass: 'absolute left-4 top-52 sm:left-8 sm:top-36',
    editedByKey: 'student.encadrant.workspace.platform.people.student',
  },
  {
    id: 'n4',
    textKey: 'student.encadrant.workspace.platform.whiteboard.note4',
    color: 'purple',
    positionClass: 'absolute right-4 top-16 sm:right-12 sm:top-20',
    editedByKey: 'student.encadrant.workspace.platform.people.supervisor',
  },
];

export const workspaceDocuments: WorkspaceDocument[] = [
  {
    id: 'd1',
    nameKey: 'student.encadrant.workspace.platform.documents.chapter2',
    category: 'report',
    authorKey: 'student.encadrant.workspace.platform.people.student',
    date: '15/04/2026',
    size: '2.3 MB',
    version: 'v3',
  },
  {
    id: 'd2',
    nameKey: 'student.encadrant.workspace.platform.documents.references',
    category: 'research',
    authorKey: 'student.encadrant.workspace.platform.people.supervisor',
    date: '14/04/2026',
    size: '850 KB',
    version: 'v2',
  },
  {
    id: 'd3',
    nameKey: 'student.encadrant.workspace.platform.documents.meetingNotes',
    category: 'meeting',
    authorKey: 'student.encadrant.workspace.platform.people.student',
    date: '10/04/2026',
    size: '45 KB',
    version: 'v1',
  },
  {
    id: 'd4',
    nameKey: 'student.encadrant.workspace.platform.documents.convention',
    category: 'internship',
    authorKey: 'student.encadrant.workspace.platform.people.admin',
    date: '01/04/2026',
    size: '1.1 MB',
    version: 'v1',
  },
];

export const workspaceNotes: WorkspaceNote[] = [
  {
    id: 'note-1',
    titleKey: 'student.encadrant.workspace.platform.notes.literature',
    excerptKey: 'student.encadrant.workspace.platform.notes.literatureExcerpt',
    tags: ['research', 'chapter2'],
    pinned: true,
    updatedAt: '2026-04-16',
  },
  {
    id: 'note-2',
    titleKey: 'student.encadrant.workspace.platform.notes.methodology',
    excerptKey: 'student.encadrant.workspace.platform.notes.methodologyExcerpt',
    tags: ['methodology'],
    pinned: false,
    updatedAt: '2026-04-15',
  },
];

export const workspaceDiscussions: WorkspaceDiscussionThread[] = [
  {
    id: 'th-1',
    titleKey: 'student.encadrant.workspace.platform.discussions.supervisor',
    type: 'supervisor',
    lastMessageKey: 'student.encadrant.workspace.platform.discussions.last1',
    replies: 4,
    timeKey: 'student.encadrant.workspace.platform.time.1h',
  },
  {
    id: 'th-2',
    titleKey: 'student.encadrant.workspace.platform.discussions.project',
    type: 'project',
    lastMessageKey: 'student.encadrant.workspace.platform.discussions.last2',
    replies: 7,
    timeKey: 'student.encadrant.workspace.platform.time.3h',
  },
  {
    id: 'th-3',
    titleKey: 'student.encadrant.workspace.platform.discussions.review',
    type: 'review',
    lastMessageKey: 'student.encadrant.workspace.platform.discussions.last3',
    replies: 2,
    timeKey: 'student.encadrant.workspace.platform.time.yesterday',
  },
];

export const workspaceTasks: WorkspacePlatformTask[] = [
  {
    id: 'wt-1',
    titleKey: 'student.encadrant.task.platform.items.chapter2',
    status: 'in_progress',
    dueAt: '2026-04-20',
    fromSupervisor: false,
  },
  {
    id: 'wt-2',
    titleKey: 'student.encadrant.task.platform.items.supervisorFeedback',
    status: 'todo',
    dueAt: '2026-04-19',
    fromSupervisor: true,
  },
  {
    id: 'wt-3',
    titleKey: 'student.encadrant.task.platform.items.weeklyReport',
    status: 'done',
    dueAt: '2026-04-17',
    fromSupervisor: true,
  },
];

export const workspaceActivities: WorkspaceActivityItem[] = [
  {
    id: 'a1',
    type: 'upload',
    messageKey: 'student.encadrant.workspace.platform.activity.upload',
    timeKey: 'student.encadrant.workspace.platform.time.30m',
    actorKey: 'student.encadrant.workspace.platform.people.student',
  },
  {
    id: 'a2',
    type: 'comment',
    messageKey: 'student.encadrant.workspace.platform.activity.comment',
    timeKey: 'student.encadrant.workspace.platform.time.1h',
    actorKey: 'student.encadrant.workspace.platform.people.supervisor',
  },
  {
    id: 'a3',
    type: 'feedback',
    messageKey: 'student.encadrant.workspace.platform.activity.feedback',
    timeKey: 'student.encadrant.workspace.platform.time.2h',
    actorKey: 'student.encadrant.workspace.platform.people.supervisor',
  },
  {
    id: 'a4',
    type: 'meeting',
    messageKey: 'student.encadrant.workspace.platform.activity.meeting',
    timeKey: 'student.encadrant.workspace.platform.time.yesterday',
    actorKey: 'student.encadrant.workspace.platform.people.supervisor',
  },
  {
    id: 'a5',
    type: 'task',
    messageKey: 'student.encadrant.workspace.platform.activity.task',
    timeKey: 'student.encadrant.workspace.platform.time.yesterday',
    actorKey: 'student.encadrant.workspace.platform.people.student',
  },
];

export const workspaceFeedback: WorkspaceFeedbackItem[] = [
  {
    id: 'fb-1',
    commentKey: 'student.encadrant.workspace.platform.feedback.comment1',
    date: '16/04/2026',
    status: 'pending',
    documentKey: 'student.encadrant.workspace.platform.documents.chapter2',
  },
  {
    id: 'fb-2',
    commentKey: 'student.encadrant.workspace.platform.feedback.comment2',
    date: '14/04/2026',
    status: 'in_review',
    documentKey: 'student.encadrant.workspace.platform.documents.references',
  },
  {
    id: 'fb-3',
    commentKey: 'student.encadrant.workspace.platform.feedback.comment3',
    date: '10/04/2026',
    status: 'resolved',
    documentKey: 'student.encadrant.workspace.platform.documents.meetingNotes',
  },
];

export const workspaceKnowledge: WorkspaceKnowledgeItem[] = [
  {
    id: 'k1',
    titleKey: 'student.encadrant.workspace.platform.knowledge.apa',
    type: 'reference',
    url: '#',
  },
  {
    id: 'k2',
    titleKey: 'student.encadrant.workspace.platform.knowledge.methodology',
    type: 'methodology',
    url: '#',
  },
  {
    id: 'k3',
    titleKey: 'student.encadrant.workspace.platform.knowledge.dataset',
    type: 'link',
    url: '#',
  },
];

export const workspaceMeetings: WorkspaceMeetingItem[] = [
  {
    id: 'm1',
    titleKey: 'student.encadrant.agenda.events.weeklyReview.title',
    date: '18/04/2026',
    time: '14:00',
    status: 'upcoming',
    hasNotes: true,
    hasRecording: false,
  },
  {
    id: 'm2',
    titleKey: 'student.encadrant.agenda.events.reportDiscussion.title',
    date: '22/04/2026',
    time: '10:00',
    status: 'upcoming',
    hasNotes: false,
    hasRecording: false,
  },
  {
    id: 'm3',
    titleKey: 'student.encadrant.workspace.platform.meetings.past',
    date: '10/04/2026',
    time: '14:00',
    status: 'past',
    hasNotes: true,
    hasRecording: true,
  },
];

export const workspaceProgress: WorkspaceProgressMetric[] = [
  { id: 'research', labelKey: 'student.encadrant.workspace.platform.progress.research', progress: 62 },
  { id: 'report', labelKey: 'student.encadrant.workspace.platform.progress.report', progress: 48 },
  { id: 'internship', labelKey: 'student.encadrant.workspace.platform.progress.internship', progress: 71 },
  { id: 'docs', labelKey: 'student.encadrant.workspace.platform.progress.docs', progress: 55 },
];

export const workspaceNotifications: WorkspaceNotification[] = [
  {
    id: 'wn1',
    messageKey: 'student.encadrant.workspace.platform.notifications.feedback',
    timeKey: 'student.encadrant.workspace.platform.time.1h',
  },
  {
    id: 'wn2',
    messageKey: 'student.encadrant.workspace.platform.notifications.document',
    timeKey: 'student.encadrant.workspace.platform.time.2h',
  },
  {
    id: 'wn3',
    messageKey: 'student.encadrant.workspace.platform.notifications.meeting',
    timeKey: 'student.encadrant.workspace.platform.time.yesterday',
  },
];

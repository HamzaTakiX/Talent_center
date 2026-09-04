import type {
  WorkspaceActivityItem,
  WorkspaceCollaborator,
  WorkspaceMeetingItem,
  WorkspaceNote,
  WorkspaceNotification,
  WorkspaceStickyNote,
} from '../types';

export const workspaceCollaborators: WorkspaceCollaborator[] = [
  {
    id: 'c1',
    nameKey: 'student.encadrant.workspace.platform.people.student',
    roleKey: 'student.encadrant.workspace.platform.roles.student',
    initials: 'SA',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    status: 'online',
    isActive: true,
  },
  {
    id: 'c2',
    nameKey: 'student.encadrant.workspace.platform.people.supervisor',
    roleKey: 'student.encadrant.workspace.platform.roles.supervisor',
    initials: 'AB',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'reviewing',
    isActive: true,
  },
  {
    id: 'c3',
    nameKey: 'student.encadrant.workspace.platform.people.peer',
    roleKey: 'student.encadrant.workspace.platform.roles.peer',
    initials: 'YK',
    avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
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

export const workspaceMeetings: WorkspaceMeetingItem[] = [
  {
    id: 'm1',
    titleKey: 'student.encadrant.agenda.events.weeklyReview.title',
    date: '18/04/2026',
    time: '14:00',
    startAt: '2026-04-18T14:00:00',
    status: 'upcoming',
    hasNotes: true,
    hasRecording: false,
  },
  {
    id: 'm2',
    titleKey: 'student.encadrant.agenda.events.reportDiscussion.title',
    date: '22/04/2026',
    time: '10:00',
    startAt: '2026-04-22T10:00:00',
    status: 'upcoming',
    hasNotes: false,
    hasRecording: false,
  },
  {
    id: 'm3',
    titleKey: 'student.encadrant.workspace.platform.meetings.past',
    date: '10/04/2026',
    time: '14:00',
    startAt: '2026-04-10T14:00:00',
    status: 'past',
    hasNotes: true,
    hasRecording: true,
  },
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

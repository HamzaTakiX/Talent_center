export type StudentAnnouncementsHistoryStatus =
  | 'viewed_announcement'
  | 'read_announcement'
  | 'saved_announcement'
  | 'dismissed_announcement'
  | 'replied_in_chat'
  | 'event_registered'
  | 'deadline_reminder';

export type StudentAnnouncementsActivityCategory =
  | 'events'
  | 'deadlines'
  | 'competitions'
  | 'general'
  | 'chat';

export type StudentAnnouncementPriority = 'high' | 'medium' | 'low';

export interface StudentAnnouncementsHistoryRow {
  id: string;
  status: StudentAnnouncementsHistoryStatus;
  actorName: string;
  headline: string;
  channel: string;
  date: string;
  time: string;
  activityCategory: StudentAnnouncementsActivityCategory;
  priority: StudentAnnouncementPriority;
}

export const studentAnnouncementsHistoryTimelineSeed: StudentAnnouncementsHistoryRow[] = [
  {
    id: 'sanh1',
    status: 'read_announcement',
    actorName: 'You',
    headline: 'Read announcement — Internship deadline reminder',
    channel: 'Portal • All graduating students',
    date: '14/05/2026',
    time: '11:30',
    activityCategory: 'deadlines',
    priority: 'high',
  },
  {
    id: 'sanh2',
    status: 'replied_in_chat',
    actorName: 'You',
    headline: 'Asked a question in Chat about deadline scope',
    channel: 'Talent Center • Announcements',
    date: '14/05/2026',
    time: '09:14',
    activityCategory: 'chat',
    priority: 'medium',
  },
  {
    id: 'sanh3',
    status: 'event_registered',
    actorName: 'You',
    headline: 'Registered for career forum — mock interview slot',
    channel: 'Student Affairs • Spring forum',
    date: '13/05/2026',
    time: '17:05',
    activityCategory: 'events',
    priority: 'medium',
  },
  {
    id: 'sanh4',
    status: 'viewed_announcement',
    actorName: 'You',
    headline: 'Viewed announcement — Mentorship office hours',
    channel: 'Portal carousel',
    date: '12/05/2026',
    time: '10:20',
    activityCategory: 'general',
    priority: 'low',
  },
  {
    id: 'sanh5',
    status: 'saved_announcement',
    actorName: 'You',
    headline: 'Saved announcement — Innovathon 2026 rules',
    channel: 'Competitions • Product track',
    date: '10/05/2026',
    time: '14:00',
    activityCategory: 'competitions',
    priority: 'high',
  },
  {
    id: 'sanh6',
    status: 'deadline_reminder',
    actorName: 'System',
    headline: 'Deadline reminder — Innovathon submission',
    channel: 'Innovathon 2026 • Extended to May 12',
    date: '10/05/2026',
    time: '15:30',
    activityCategory: 'competitions',
    priority: 'high',
  },
  {
    id: 'sanh7',
    status: 'read_announcement',
    actorName: 'You',
    headline: 'Read announcement — Alumni panel invitation',
    channel: 'ESCA Events • M2 cohort',
    date: '09/05/2026',
    time: '08:45',
    activityCategory: 'events',
    priority: 'medium',
  },
  {
    id: 'sanh8',
    status: 'dismissed_announcement',
    actorName: 'You',
    headline: 'Dismissed announcement — Optional workshop',
    channel: 'Student Life • Optional',
    date: '08/05/2026',
    time: '16:00',
    activityCategory: 'general',
    priority: 'low',
  },
];

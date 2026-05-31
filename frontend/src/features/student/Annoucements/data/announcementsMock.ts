import { Bell, Eye, UserPlus } from 'lucide-react';
import type {
  AnnouncementsStatColorMap,
  AnnouncementsStatIconMap,
  AnnouncementsStatItem,
  StudentAnnouncementItem,
} from '../types';

export const announcementsStatIconMap: AnnouncementsStatIconMap = {
  total: Bell,
  interviews: UserPlus,
  unread: Eye,
};

export const announcementsStatColorMap: AnnouncementsStatColorMap = {
  total: 'bg-[#2b7fff]',
  interviews: 'bg-[#22c55e]',
  unread: 'bg-[#f97316]',
};

export const announcementsStats: AnnouncementsStatItem[] = [
  { label: 'Total Announcements', value: '24', iconKey: 'total' },
  { label: 'Interview Invitations', value: '5', iconKey: 'interviews' },
  { label: 'Unread Announcements', value: '8', iconKey: 'unread' },
];

export const recentAnnouncements: StudentAnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Marketing Internship Interview - Round 1',
    tag: 'Interview',
    company: 'Maroc Telecom',
    date: 'Apr 12, 2026',
  },
  {
    id: 'ann-2',
    title: 'ESCA Career Fair 2026',
    tag: 'Event',
    company: 'ESCA Business School',
    date: 'Apr 10, 2026',
  },
  {
    id: 'ann-3',
    title: 'National Business Case Competition',
    tag: 'Competition',
    company: 'McKinsey & Company',
    date: 'Apr 9, 2026',
  },
  {
    id: 'ann-4',
    title: 'Summer Internship Program Opening',
    tag: 'Internship',
    company: 'OCP Group',
    date: 'Apr 8, 2026',
  },
  {
    id: 'ann-5',
    title: 'Leadership Development Seminar',
    tag: 'Seminar',
    company: 'Deloitte Morocco',
    date: 'Apr 7, 2026',
  },
];

/** Variantes admin-badge — compatibles light/dark */
export const announcementTagClassMap: Record<StudentAnnouncementItem['tag'], string> = {
  Interview: 'admin-badge--info',
  Event: 'admin-badge--interview',
  Competition: 'admin-badge--warning',
  Internship: 'admin-badge--success',
  Seminar: 'admin-badge--event',
  Announcement: 'admin-badge--neutral',
};

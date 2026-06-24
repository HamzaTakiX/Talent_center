import { Bell, Bookmark, Clock, Eye } from 'lucide-react';
import type {
  AnnouncementsStatColorMap,
  AnnouncementsStatIconMap,
  AnnouncementsStatItem,
  StudentAnnouncementItem,
} from '../types';

export const announcementsStatIconMap: AnnouncementsStatIconMap = {
  total: Bell,
  saved: Bookmark,
  recent: Clock,
  unread: Eye,
};

export const announcementsStatColorMap: AnnouncementsStatColorMap = {
  total: 'bg-[#2b7fff]',
  saved: 'bg-[#22c55e]',
  recent: 'bg-[#a855f7]',
  unread: 'bg-[#f97316]',
};

export const announcementsStats: AnnouncementsStatItem[] = [
  { label: 'Total Announcements', value: '24', iconKey: 'total' },
  { label: 'Saved Announcements', value: '5', iconKey: 'saved' },
  { label: 'Recent Announcements', value: '8', iconKey: 'recent' },
  { label: 'Unread Announcements', value: '8', iconKey: 'unread' },
];

export const recentAnnouncements: StudentAnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Marketing Internship Interview - Round 1',
    typeCode: 'recruitment-interview',
    typeName: 'Interview',
    company: 'Maroc Telecom',
    date: 'Apr 12, 2026',
  },
  {
    id: 'ann-2',
    title: 'ESCA Career Fair 2026',
    typeCode: 'forum-career-fair',
    typeName: 'Event',
    company: 'ESCA Business School',
    date: 'Apr 10, 2026',
  },
  {
    id: 'ann-3',
    title: 'National Business Case Competition',
    typeCode: 'competition',
    typeName: 'Competition',
    company: 'McKinsey & Company',
    date: 'Apr 9, 2026',
  },
  {
    id: 'ann-4',
    title: 'Summer Internship Program Opening',
    typeCode: 'internship-offer',
    typeName: 'Internship',
    company: 'OCP Group',
    date: 'Apr 8, 2026',
  },
  {
    id: 'ann-5',
    title: 'Leadership Development Seminar',
    typeCode: 'seminar',
    typeName: 'Seminar',
    company: 'Deloitte Morocco',
    date: 'Apr 7, 2026',
  },
];

/** @deprecated mock tag styles */
export const announcementTagClassMap: Record<string, string> = {
  Interview: 'admin-badge--info',
  Event: 'admin-badge--interview',
  Competition: 'admin-badge--warning',
  Internship: 'admin-badge--success',
  Seminar: 'admin-badge--event',
  Announcement: 'admin-badge--neutral',
};

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

export const announcementTagClassMap: Record<StudentAnnouncementItem['tag'], string> = {
  Interview:
    'border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8] hover:border-[#93c5fd] hover:bg-[#dbeafe] focus-visible:ring-[#2563eb]/30',
  Event:
    'border-[#e9d4ff] bg-[#f3e8ff] text-[#7c3aed] hover:border-[#d8b4fe] hover:bg-[#ede9fe] focus-visible:ring-[#7c3aed]/30',
  Competition:
    'border-[#fde68a] bg-[#fef9c3] text-[#a16207] hover:border-[#fcd34d] hover:bg-[#fef08a] focus-visible:ring-[#ca8a04]/30',
  Internship:
    'border-[#bbf7d0] bg-[#ecfdf5] text-[#059669] hover:border-[#86efac] hover:bg-[#d1fae5] focus-visible:ring-[#059669]/30',
  Seminar:
    'border-[#c7d2fe] bg-[#eef2ff] text-[#4f46e5] hover:border-[#a5b4fc] hover:bg-[#e0e7ff] focus-visible:ring-[#4f46e5]/30',
  Announcement:
    'border-[#e5e7eb] bg-[var(--admin-surface-inset)] text-[#4b5563] hover:border-[#d1d5db] hover:bg-[#e5e7eb] focus-visible:ring-[#6b7280]/30',
};

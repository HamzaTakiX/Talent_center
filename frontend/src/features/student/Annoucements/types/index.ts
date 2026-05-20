import type { LucideIcon } from 'lucide-react';

export type AnnouncementTag =
  | 'Interview'
  | 'Event'
  | 'Competition'
  | 'Internship'
  | 'Seminar'
  | 'Announcement';

export type AnnouncementPriority = 'Urgent' | 'Important' | 'Normal';

export type AnnouncementsStatIconKey = 'total' | 'interviews' | 'unread';

export interface AnnouncementsStatItem {
  label: string;
  value: string;
  iconKey: AnnouncementsStatIconKey;
}

/** Carte compacte — dashboard annonces. */
export interface StudentAnnouncementItem {
  id: string;
  title: string;
  tag: AnnouncementTag;
  company: string;
  date: string;
}

/** Carte détaillée — page View All. */
export interface FullAnnouncementItem {
  id: string;
  title: string;
  tag: AnnouncementTag;
  company: string;
  postedDate: string;
  deadlineLabel: string;
  deadlineUrgent?: boolean;
  description: string;
  priority: AnnouncementPriority;
  matchScore?: number;
  recommended?: boolean;
}

export type AnnouncementsStatIconMap = Record<AnnouncementsStatIconKey, LucideIcon>;
export type AnnouncementsStatColorMap = Record<AnnouncementsStatIconKey, string>;

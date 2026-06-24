import type { LucideIcon } from 'lucide-react';

export type AnnouncementTag =
  | 'Interview'
  | 'Event'
  | 'Competition'
  | 'Internship'
  | 'Seminar'
  | 'Announcement';

export type AnnouncementPriority = 'Urgent' | 'Important' | 'Normal';

export type AnnouncementDateFilter = 'all' | 'today' | 'week' | 'month';

export type AnnouncementsStatIconKey = 'total' | 'saved' | 'recent' | 'unread';

export interface AnnouncementsStatItem {
  label: string;
  value: string;
  iconKey: AnnouncementsStatIconKey;
}

export interface StudentAnnouncementAttachment {
  id: number;
  kind: string;
  fileUrl: string | null;
  externalUrl?: string | null;
  originalFilename: string;
  label: string;
  mimeType?: string;
  fileSizeBytes?: number;
}

export interface StudentAnnouncementInternshipDetails {
  duration: string;
  location: string;
  workMode: string;
  compensation: string;
  offerStatus: string;
}

/** API feed item from backend. */
export interface StudentAnnouncementFeedItem {
  id: string;
  title: string;
  summary: string;
  body: string;
  typeCode: string;
  typeName: string;
  typeIcon?: string;
  typeColor?: string;
  priority: string;
  priorityBucket: string;
  companyName: string;
  coverImageUrl?: string | null;
  externalLink?: string | null;
  publishedAt?: string | null;
  applicationDeadline?: string | null;
  deadlineUrgent?: boolean;
  attachments: StudentAnnouncementAttachment[];
  internshipDetails?: StudentAnnouncementInternshipDetails | null;
  matchScore?: number | null;
  recommended?: boolean;
  isUnread?: boolean;
  isPinned?: boolean;
  allowComments?: boolean;
  isSaved?: boolean;
  isFavorited?: boolean;
}

export interface StudentAnnouncementsStats {
  total: number;
  saved: number;
  recent: number;
  unread: number;
}

export interface StudentAnnouncementTypeOption {
  code: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface StudentAnnouncementFeedResponse {
  items: StudentAnnouncementFeedItem[];
  recommended: StudentAnnouncementFeedItem[];
  stats: StudentAnnouncementsStats;
  types: StudentAnnouncementTypeOption[];
}

export interface StudentAnnouncementFeedParams {
  type?: string;
  priority?: string;
  date?: AnnouncementDateFilter;
  search?: string;
  limit?: number;
}

export type StudentAnnouncementBookmarkType = 'SAVE' | 'FAVORITE';

export interface StudentAnnouncementBookmarkResult {
  active: boolean;
  bookmarkType: StudentAnnouncementBookmarkType;
  announcementId: string;
  isSaved: boolean;
  isFavorited: boolean;
}

export interface StudentAnnouncementDetailResponse {
  announcement: Record<string, unknown>;
}

export interface StudentSavedAnnouncementsResponse {
  items: StudentAnnouncementFeedItem[];
  stats: { total: number };
}

/** Carte compacte — dashboard annonces. */
export interface StudentAnnouncementItem {
  id: string;
  title: string;
  typeCode: string;
  typeName: string;
  typeIcon?: string;
  company: string;
  date: string;
  coverImageUrl?: string | null;
}

/** Carte détaillée — feed annonces. */
export interface FullAnnouncementItem {
  id: string;
  title: string;
  typeCode: string;
  typeName: string;
  typeIcon?: string;
  typeColor?: string;
  company: string;
  postedDate: string;
  deadlineLabel: string;
  deadlineUrgent?: boolean;
  description: string;
  body?: string;
  priority: AnnouncementPriority;
  matchScore?: number | null;
  recommended?: boolean;
  coverImageUrl?: string | null;
  externalLink?: string | null;
  attachments?: StudentAnnouncementAttachment[];
  internshipDetails?: StudentAnnouncementInternshipDetails | null;
  isUnread?: boolean;
  isPinned?: boolean;
  allowComments?: boolean;
  publishedAt?: string | null;
  applicationDeadline?: string | null;
  isSaved?: boolean;
  isFavorited?: boolean;
  /** @deprecated mock tag — use typeCode/typeName */
  tag?: AnnouncementTag;
}

export type AnnouncementsStatIconMap = Record<AnnouncementsStatIconKey, LucideIcon>;
export type AnnouncementsStatColorMap = Record<AnnouncementsStatIconKey, string>;

export const ANNOUNCEMENT_DATE_FILTER_VALUES = ['all', 'today', 'week', 'month'] as const;
export const ANNOUNCEMENT_PRIORITY_FILTER_VALUES = ['all', 'Urgent', 'Important', 'Normal'] as const;

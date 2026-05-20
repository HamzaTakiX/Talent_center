import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Archive,
  Briefcase,
  CalendarClock,
  Eye,
  FileEdit,
  Megaphone,
  Pin,
  Radio,
  Sparkles,
} from 'lucide-react';

export type AnnStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'EXPIRED'
  | 'ARCHIVED'
  | 'HIDDEN';

export type AnnPriority =
  | 'NORMAL'
  | 'IMPORTANT'
  | 'URGENT'
  | 'PINNED'
  | 'INSTITUTIONAL_CRITICAL';

export const statusMeta: Record<
  string,
  { badgeClass: string; icon: LucideIcon; chartColor: string }
> = {
  DRAFT: { badgeClass: 'admin-ann-status--draft', icon: FileEdit, chartColor: '#64748b' },
  SCHEDULED: { badgeClass: 'admin-ann-status--scheduled', icon: CalendarClock, chartColor: '#4f46e5' },
  PUBLISHED: { badgeClass: 'admin-ann-status--published', icon: Radio, chartColor: '#2563eb' },
  EXPIRED: { badgeClass: 'admin-ann-status--expired', icon: Archive, chartColor: '#94a3b8' },
  ARCHIVED: { badgeClass: 'admin-ann-status--archived', icon: Archive, chartColor: '#64748b' },
  HIDDEN: { badgeClass: 'admin-ann-status--hidden', icon: Eye, chartColor: '#475569' },
};

export const priorityMeta: Record<string, { badgeClass: string; icon: LucideIcon }> = {
  NORMAL: { badgeClass: 'admin-ann-priority--normal', icon: Megaphone },
  IMPORTANT: { badgeClass: 'admin-ann-priority--important', icon: Sparkles },
  URGENT: { badgeClass: 'admin-ann-priority--urgent', icon: AlertTriangle },
  PINNED: { badgeClass: 'admin-ann-priority--pinned', icon: Pin },
  INSTITUTIONAL_CRITICAL: {
    badgeClass: 'admin-ann-priority--critical',
    icon: AlertTriangle,
  },
};

export const typeIcon = (code?: string): LucideIcon => {
  if (!code) return Megaphone;
  if (code.includes('internship') || code.includes('pfe')) return Briefcase;
  return Megaphone;
};

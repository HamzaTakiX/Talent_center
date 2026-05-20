import type { AdminBadgeVariant } from '../../ui/AdminBadge';
import { adminBadgeClass, ADMIN_CHIP_BADGE } from '../../ui/adminStatusBadges';
import type { HistoryActionType, HistoryPriority, HistoryStatus } from '../types';

export const HISTORY_MODULE_FILTER_OPTIONS = [
  'All Modules',
  'Internship Offers',
  'Documents',
  'Students',
  'Announcements',
  'SRF',
  'Encadrants',
  'Reports',
  'Chat',
] as const;

export const HISTORY_USER_FILTER_OPTIONS = [
  'All Users',
  'Admin Stage',
  'Admin Documents',
  'Admin Finance',
  'Admin Communication',
  'Multiple Users',
  'Youssef Benani',
  'Sarah Alami',
] as const;

export const HISTORY_ACTION_FILTER_OPTIONS = [
  'All Types',
  'create',
  'update',
  'validate',
  'archive',
  'review',
  'assign',
  'submit',
] as const;

export const HISTORY_STATUS_BADGE_CLASS: Record<HistoryStatus, string> = {
  success: 'bg-[#e7f6ec] text-[#0f7b3a]',
  pending: 'bg-[#fff4db] text-[#9a5c00]',
  warning: 'bg-[#fee9eb] text-[#b4232d]',
};

export const HISTORY_PRIORITY_BADGE_CLASS: Record<HistoryPriority, string> = {
  high: 'bg-[#fee9eb] text-[#b4232d]',
  medium: 'bg-[#f2ecff] text-[#6a32c9]',
  low: 'bg-[#eaf1ff] text-[#2458d3]',
};

export const HISTORY_ACTION_LABEL: Record<HistoryActionType, string> = {
  create: 'Create',
  update: 'Update',
  validate: 'Validate',
  archive: 'Archive',
  review: 'Review',
  assign: 'Assign',
  submit: 'Submit',
};

/** Variantes badge design system (light + dark). */
export const HISTORY_ACTION_BADGE_VARIANT: Record<HistoryActionType, AdminBadgeVariant> = {
  create: 'success',
  update: 'info',
  validate: 'interview',
  archive: 'danger',
  review: 'warning',
  assign: 'event',
  submit: 'warning',
};

export function historyActionBadgeClass(actionType: HistoryActionType): string {
  return adminBadgeClass(HISTORY_ACTION_BADGE_VARIANT[actionType], ADMIN_CHIP_BADGE);
}

export function historyModuleBadgeClass(): string {
  return adminBadgeClass('neutral', ADMIN_CHIP_BADGE);
}

/** Compact badges for timeline rows — keeps action buttons inside the card. */
export const HISTORY_TIMELINE_BADGE =
  'inline-flex h-[18px] max-w-[7rem] min-w-0 shrink items-center truncate rounded px-1.5 py-0 text-[10px] font-medium leading-none sm:max-w-[8.5rem]';

export function historyTimelineBadgeClass(baseClass: string): string {
  return `${baseClass} ${HISTORY_TIMELINE_BADGE}`;
}

/** @deprecated Utiliser historyActionBadgeClass — conservé pour scripts legacy */
export const HISTORY_ACTION_BADGE_CLASS: Record<HistoryActionType, string> = {
  create: 'bg-[#dcfce7] text-[#016630]',
  update: 'bg-[#dbeafe] text-[#193cb8]',
  validate: 'bg-[#f3e8ff] text-[#6e11b0]',
  archive: 'bg-[#fee9eb] text-[#b4232d]',
  review: 'bg-[#fff4db] text-[#9a5c00]',
  assign: 'bg-[#e0e7ff] text-[#372aac]',
  submit: 'bg-[#ffedd4] text-[#9f2d00]',
};

import type { StudentHistoryManagementStatus, StudentHistoryModuleKey } from '../types';
import {
  STUDENT_BADGE_DANGER,
  STUDENT_BADGE_EVENT,
  STUDENT_BADGE_INFO,
  STUDENT_BADGE_INTERVIEW,
  STUDENT_BADGE_SUCCESS,
  STUDENT_BADGE_WARNING,
  STUDENT_INLINE_BADGE,
} from '../../design-system/studentSemanticStyles';

export const STUDENT_HISTORY_MODULE_FILTER_ALL = 'all' as const;

export const STUDENT_HISTORY_MODULE_FILTER_KEYS = [
  STUDENT_HISTORY_MODULE_FILTER_ALL,
  'internshipOffers',
  'myApplications',
  'announcements',
  'documents',
  'srf',
  'careerTools',
  'chat',
] as const satisfies readonly (typeof STUDENT_HISTORY_MODULE_FILTER_ALL | StudentHistoryModuleKey)[];

export const STUDENT_HISTORY_STATUS_FILTER_ALL = 'all' as const;

export const STUDENT_HISTORY_STATUS_FILTER_KEYS = [
  STUDENT_HISTORY_STATUS_FILTER_ALL,
  'submitted',
  'in_review',
  'accepted',
  'declined',
  'completed',
] as const satisfies readonly (typeof STUDENT_HISTORY_STATUS_FILTER_ALL | StudentHistoryManagementStatus)[];

/** Maps filter key → row.managementStatus */
export const STUDENT_HISTORY_STATUS_FILTER_MAP: Record<
  (typeof STUDENT_HISTORY_STATUS_FILTER_KEYS)[number],
  StudentHistoryManagementStatus | null
> = {
  all: null,
  submitted: 'submitted',
  in_review: 'in_review',
  accepted: 'accepted',
  declined: 'declined',
  completed: 'completed',
};

export const STUDENT_HISTORY_PRIORITY_BADGE_CLASS = {
  high: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_DANGER}`,
  medium: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_INTERVIEW}`,
  low: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_INFO}`,
} as const;

export const STUDENT_HISTORY_EVENT_TYPE_BADGE_CLASS = {
  application: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_SUCCESS}`,
  offer: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_INFO}`,
  announcement: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_DANGER}`,
  document: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_WARNING}`,
  payment: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_WARNING}`,
  tool: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_INTERVIEW}`,
  message: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_SUCCESS}`,
} as const;

export const STUDENT_HISTORY_MANAGEMENT_STATUS_BADGE_CLASS = {
  submitted: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_INFO}`,
  in_review: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_WARNING}`,
  accepted: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_SUCCESS}`,
  declined: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_DANGER}`,
  completed: `${STUDENT_INLINE_BADGE} ${STUDENT_BADGE_EVENT}`,
} as const;

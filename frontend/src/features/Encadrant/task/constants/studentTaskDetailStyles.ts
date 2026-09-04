import {
  ENC_BADGE_DANGER,
  ENC_BADGE_INFO,
  ENC_BADGE_NEUTRAL,
  ENC_BADGE_SUCCESS,
  ENC_BADGE_WARNING,
  ENC_PANEL,
} from '../../constants/encadrantTokens';
import type { StudentTaskItemPriority, StudentTaskItemStatus } from '../types';

export const STUDENT_TASK_STATUS_BADGE: Record<StudentTaskItemStatus, string> = {
  done: ENC_BADGE_SUCCESS,
  in_progress: ENC_BADGE_INFO,
  upcoming: ENC_BADGE_NEUTRAL,
};

export const STUDENT_TASK_STATUS_LABEL_KEY: Record<StudentTaskItemStatus, string> = {
  done: 'encadrant.status.done',
  in_progress: 'encadrant.status.inProgress',
  upcoming: 'encadrant.status.upcoming',
};

export const STUDENT_TASK_PRIORITY_BADGE: Record<StudentTaskItemPriority, string> = {
  high: ENC_BADGE_DANGER,
  medium: ENC_BADGE_WARNING,
};

export const STUDENT_TASK_PRIORITY_LABEL_KEY: Record<StudentTaskItemPriority, string> = {
  high: 'encadrant.task.priority.high',
  medium: 'encadrant.task.priority.medium',
};

export const STUDENT_TASK_ITEM_CARD_BG: Record<StudentTaskItemStatus, string> = {
  done: 'border-[color-mix(in_srgb,#059669_35%,var(--admin-border))] bg-[color-mix(in_srgb,#059669_8%,var(--admin-bg-elevated))]',
  in_progress: 'border-[color-mix(in_srgb,var(--admin-brand)_35%,var(--admin-border))] bg-[var(--admin-brand-muted)]',
  upcoming: `${ENC_PANEL} border-[var(--admin-border)]`,
};

export const STUDENT_TASK_ITEM_TITLE_DONE = 'line-through text-[var(--admin-text-secondary)]';

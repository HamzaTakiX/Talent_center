/** Tokens UI — module Report Encadrant (design system admin). */
export {
  STUDENT_OUTLINE_BUTTON as REPORT_OUTLINE_BTN,
  STUDENT_PRIMARY_BUTTON as REPORT_PRIMARY_BTN,
} from '../../../design-system/studentTokens';

export const REPORT_EDITOR_TAB_BAR =
  'flex w-full min-w-0 flex-wrap gap-1 border-b border-[var(--admin-border)] px-3 pt-2 sm:px-4';

export const REPORT_EDITOR_TAB_ACTIVE =
  'inline-flex shrink-0 items-center gap-1.5 border-b-2 border-[var(--admin-brand)] px-2 pb-2.5 pt-1 text-sm font-medium text-[var(--admin-text)]';

export const REPORT_EDITOR_TAB_INACTIVE =
  'inline-flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-2 pb-2.5 pt-1 text-sm font-medium text-[var(--admin-text-muted)] transition-colors hover:text-[var(--admin-text)]';

export const REPORT_TOOLBAR = 'student-segment-tabs';

export const REPORT_TOOLBAR_BTN = 'admin-btn admin-btn-ghost admin-btn--sm';

export const REPORT_TOOLBAR_SELECT = 'admin-form-input admin-field h-8 sm:h-9 text-xs sm:text-sm';

export const REPORT_EDITOR_SURFACE = 'admin-module-panel flex min-h-0 flex-1 flex-col overflow-hidden';

export const REPORT_AI_CARD = 'student-ai-banner admin-module-panel';

export const REPORT_PROGRESS_FILL =
  'h-full rounded-full bg-[var(--admin-brand)] transition-[width] duration-300';

export const REPORT_PROGRESS_TRACK =
  'h-2.5 w-full overflow-hidden rounded-full bg-[var(--admin-surface-inset)] sm:h-3';

/** Tokens UI — module Workspace Encadrant (design system admin). */
export {
  STUDENT_SEGMENT_TABS as WORKSPACE_TAB_BAR,
  STUDENT_SEGMENT_TAB_ACTIVE as WORKSPACE_TAB_ACTIVE,
  STUDENT_SEGMENT_TAB_INACTIVE as WORKSPACE_TAB_INACTIVE,
  STUDENT_SURFACE_CARD as WORKSPACE_SURFACE_CARD,
  STUDENT_OUTLINE_BUTTON as WORKSPACE_OUTLINE_BTN,
  STUDENT_PRIMARY_BUTTON as WORKSPACE_PRIMARY_BTN,
} from '../../../design-system/studentTokens';

export const WORKSPACE_TOOLBAR_ROW =
  'admin-module-toolbar flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between';

export const WORKSPACE_TOOLBAR_ACTIONS =
  'flex min-w-0 max-w-full flex-wrap items-center gap-2';

export const WORKSPACE_TOOLBAR_GROUP = 'student-segment-tabs !w-auto shrink-0';

export const WORKSPACE_TOOL_BTN = 'admin-btn admin-btn-ghost admin-btn--sm';

export const WORKSPACE_TOOL_BTN_ACTIVE = 'student-segment-tab student-segment-tab--active';

export const WORKSPACE_ACTIVE_USERS_BADGE =
  'admin-badge admin-badge--info inline-flex items-center gap-1.5';

export const WORKSPACE_FIELD_TEXTAREA =
  'admin-form-input admin-field min-h-[12rem] w-full flex-1 resize-y';

export const WORKSPACE_FIELD_INPUT = 'admin-form-input admin-field h-10 min-w-0 flex-1';

export const WORKSPACE_FOOTER_ROW =
  'flex w-full min-w-0 flex-col gap-3 border-t border-[var(--admin-border)] pt-4 sm:flex-row sm:items-center sm:justify-between';

export const WORKSPACE_DISCUSSION_FORM =
  'flex w-full min-w-0 items-center gap-2 border-t border-[var(--admin-border)] pt-3';

export const WORKSPACE_DOCUMENT_ROW =
  'admin-module-panel admin-panel-interactive flex w-full flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between';

export const WORKSPACE_MEETING_START_BTN = 'admin-btn admin-btn-primary admin-btn--md';

export const WORKSPACE_MEETING_CONTROL_BTN =
  'admin-icon-btn admin-icon-btn--lg text-[var(--admin-text)]';

export const WORKSPACE_MEETING_CONTROL_BTN_OUTLINE =
  'admin-btn admin-btn-outline admin-btn--md !size-11 !p-0';

export const WORKSPACE_MEETING_CONTROL_BTN_END =
  'admin-btn admin-btn-primary admin-btn--md !size-11 !p-0 !bg-[var(--admin-badge-danger-bg,#ef4444)]';

export const WORKSPACE_MEETING_CONTROLS_ROW =
  'flex w-full min-w-0 flex-wrap items-center justify-center gap-2';

export const WORKSPACE_MEETING_LIVE_BADGE = 'admin-badge admin-badge--danger inline-flex items-center gap-1.5';

export const WORKSPACE_MEETING_META_ROW =
  'flex w-full min-w-0 flex-wrap items-center justify-center gap-4 text-[var(--admin-text-secondary)]';

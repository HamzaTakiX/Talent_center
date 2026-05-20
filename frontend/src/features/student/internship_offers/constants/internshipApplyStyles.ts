/** Tokens UI — candidature (design system admin). */
import {
  STUDENT_SURFACE_CARD,
  STUDENT_PRIMARY_BUTTON,
  STUDENT_OUTLINE_BUTTON,
} from '../../design-system/studentTokens';

export const APPLY_SURFACE_CARD = STUDENT_SURFACE_CARD;

export const APPLY_BLUE_BUTTON = `${STUDENT_PRIMARY_BUTTON} h-11 w-full`;

export const APPLY_PURPLE_BUTTON =
  'admin-btn admin-btn-primary admin-btn--md h-11 w-full !bg-[var(--admin-brand)]';

export const APPLY_ICON_BOX_BLUE =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--admin-radius-sm)] bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]';

export const APPLY_ICON_BOX_PURPLE =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--admin-radius-sm)] bg-[color-mix(in_srgb,var(--admin-brand)_12%,var(--admin-bg-elevated))] text-[var(--admin-brand)]';

export const APPLY_CV_PREVIEW_CARD =
  'admin-module-panel flex w-full min-w-0 items-center gap-3 p-4';

export const APPLY_OUTLINE_LINK = STUDENT_OUTLINE_BUTTON;

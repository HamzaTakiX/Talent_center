/**
 * Shared Encadrant visual tokens mapped to the ESCA platform design system.
 * Use these instead of hardcoded hex / light-only surfaces.
 */
import {
  PLATFORM_BADGE_DANGER,
  PLATFORM_BADGE_INFO,
  PLATFORM_BADGE_NEUTRAL,
  PLATFORM_BADGE_SUCCESS,
  PLATFORM_BADGE_WARNING,
  PLATFORM_BTN_OUTLINE,
  PLATFORM_BTN_PRIMARY,
  PLATFORM_BTN_SECONDARY,
  PLATFORM_FORM_INPUT,
  PLATFORM_ICON_BTN,
  PLATFORM_PAGE_WIDE,
  PLATFORM_PANEL,
  PLATFORM_PANEL_INTERACTIVE,
  PLATFORM_SEARCH_FIELD,
  PLATFORM_SEARCH_ICON,
  PLATFORM_SEARCH_WRAP,
} from '../../../design-system/platformTokens';

export const ENC_PAGE = PLATFORM_PAGE_WIDE;

export const ENC_PANEL = PLATFORM_PANEL;

export const ENC_PANEL_INTERACTIVE = PLATFORM_PANEL_INTERACTIVE;

export const ENC_SEARCH_WRAP = PLATFORM_SEARCH_WRAP;

export const ENC_SEARCH_FIELD = PLATFORM_SEARCH_FIELD;

export const ENC_SEARCH_ICON = PLATFORM_SEARCH_ICON;

export const ENC_ICON_BTN = PLATFORM_ICON_BTN;

export const ENC_FORM_INPUT = PLATFORM_FORM_INPUT;

export const ENC_BTN_PRIMARY = PLATFORM_BTN_PRIMARY;

export const ENC_BTN_SECONDARY = PLATFORM_BTN_SECONDARY;

export const ENC_BTN_OUTLINE = PLATFORM_BTN_OUTLINE;

export const ENC_BADGE_SUCCESS = PLATFORM_BADGE_SUCCESS;
export const ENC_BADGE_WARNING = PLATFORM_BADGE_WARNING;
export const ENC_BADGE_DANGER = PLATFORM_BADGE_DANGER;
export const ENC_BADGE_INFO = PLATFORM_BADGE_INFO;
export const ENC_BADGE_NEUTRAL = PLATFORM_BADGE_NEUTRAL;

/** Section card with standard padding. */
export const ENC_SECTION =
  'admin-module-panel admin-section-panel box-border flex w-full min-w-0 max-w-full flex-col gap-4 overflow-x-clip p-4 sm:gap-5 sm:p-5 md:p-6';

/** KPI / summary card shell. */
export const ENC_KPI_CARD =
  'admin-module-panel admin-panel-interactive box-border flex h-[114px] w-full min-w-0 flex-col text-left';

/** Student / entity card. */
export const ENC_ENTITY_CARD =
  'admin-module-panel admin-panel-interactive relative box-border flex w-full min-w-0 max-w-full flex-col gap-3 overflow-x-clip p-4 sm:gap-3.5 sm:p-5';

/** Toolbar row: search + actions. */
export const ENC_TOOLBAR =
  'flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3';

export const ENC_TEXT = 'text-[var(--admin-text)]';
export const ENC_TEXT_SECONDARY = 'text-[var(--admin-text-secondary)]';
export const ENC_TEXT_MUTED = 'text-[var(--admin-text-muted)]';

/** Semantic icon wells for KPI tones (maps to platform semantic colors). */
export const ENC_TONE_ICON = {
  blue: {
    iconBg: 'bg-[var(--admin-brand)]',
    iconText: 'text-white',
  },
  red: {
    iconBg: 'bg-[color-mix(in_srgb,var(--admin-danger)_90%,transparent)]',
    iconText: 'text-white',
  },
  orange: {
    iconBg: 'bg-[color-mix(in_srgb,#d97706_95%,transparent)]',
    iconText: 'text-white',
  },
  green: {
    iconBg: 'bg-[color-mix(in_srgb,#059669_95%,transparent)]',
    iconText: 'text-white',
  },
} as const;

export const ENC_RISK = {
  low: {
    dot: 'bg-[#059669]',
    progress: 'bg-[#059669]',
    badge: PLATFORM_BADGE_SUCCESS,
  },
  medium: {
    dot: 'bg-[#d97706]',
    progress: 'bg-[#d97706]',
    badge: PLATFORM_BADGE_WARNING,
  },
  high: {
    dot: 'bg-[var(--admin-danger)]',
    progress: 'bg-[var(--admin-danger)]',
    badge: PLATFORM_BADGE_DANGER,
  },
} as const;

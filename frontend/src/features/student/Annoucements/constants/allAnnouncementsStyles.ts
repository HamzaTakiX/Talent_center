/** Styles — page View All Announcements (design system admin). */
import {
  STUDENT_CATALOG_CARD,
  STUDENT_SEARCH_WRAP,
  STUDENT_SEARCH_FIELD,
  STUDENT_SEARCH_ICON,
  STUDENT_OUTLINE_BUTTON,
  STUDENT_SURFACE_CARD_INTERACTIVE,
} from '../../design-system/studentTokens';

export const ALL_ANNOUNCEMENTS_FILTER_BAR =
  'admin-module-toolbar flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5';

export const ALL_ANNOUNCEMENTS_FILTER_ACTIONS = 'grid w-full min-w-0 grid-cols-2 gap-2 sm:contents';

export const ALL_ANNOUNCEMENTS_SEARCH_INPUT = STUDENT_SEARCH_FIELD;

export const ALL_ANNOUNCEMENTS_FILTER_BTN = `${STUDENT_OUTLINE_BUTTON} h-9 w-full rounded-full sm:w-auto sm:shrink-0`;

export const ALL_ANNOUNCEMENTS_FILTER_BTN_OPEN =
  'border-[var(--admin-brand)] bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]';

export const RECOMMENDED_CARD_SURFACE = `${STUDENT_SURFACE_CARD_INTERACTIVE} border-[color-mix(in_srgb,var(--admin-brand)_24%,var(--admin-border))]`;

export const LIST_CARD_SURFACE = STUDENT_CATALOG_CARD;

export const MATCH_SCORE_BADGE = 'admin-badge admin-badge--info';

export const PRIORITY_BADGE_BASE = 'admin-badge';

export const PRIORITY_BADGE_URGENT = 'admin-badge admin-badge--danger';

export const PRIORITY_BADGE_IMPORTANT = 'admin-badge admin-badge--warning';

export const PRIORITY_BADGE_NORMAL = 'admin-badge admin-badge--neutral';

export const ANNOUNCEMENT_MENU_PANEL = 'admin-chat-dropdown';

export const ANNOUNCEMENT_MENU_ITEM = 'admin-chat-menu-item';

export { STUDENT_SEARCH_WRAP, STUDENT_SEARCH_ICON };

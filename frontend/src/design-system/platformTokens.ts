/**
 * Platform design tokens — source unique admin + student.
 * Toutes les surfaces utilisent les variables CSS `--admin-*` (écosystème ESCA).
 */

export const PLATFORM_SHELL = 'admin-shell-bg';

export const PLATFORM_PAGE = 'admin-page';

export const PLATFORM_PAGE_WIDE =
  'admin-page mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-4 scroll-mt-4 pb-2 sm:gap-6 md:gap-8 sm:pb-4';

export const PLATFORM_PAGE_DEFAULT =
  'admin-page mx-auto flex w-full min-w-0 max-w-[1680px] flex-col gap-5 scroll-mt-4 pb-2 sm:gap-6 md:gap-7 sm:pb-4';

export const PLATFORM_PAGE_NARROW =
  'admin-page mx-auto flex w-full min-w-0 max-w-[1228px] flex-col gap-5 scroll-mt-4 pb-2 sm:gap-6 sm:pb-4';

export const PLATFORM_PANEL = 'admin-module-panel';

export const PLATFORM_PANEL_INTERACTIVE =
  'admin-module-panel admin-panel-interactive transition-[box-shadow,border-color,transform] duration-200 ease-out';

export const PLATFORM_CARD = PLATFORM_PANEL_INTERACTIVE;

export const PLATFORM_BTN_PRIMARY = 'admin-btn admin-btn-primary admin-btn--md';

export const PLATFORM_BTN_SECONDARY = 'admin-btn admin-btn-secondary admin-btn--md';

export const PLATFORM_BTN_OUTLINE = 'admin-btn admin-btn-outline admin-btn--md';

export const PLATFORM_BTN_GHOST = 'admin-btn admin-btn-ghost admin-btn--md';

export const PLATFORM_BTN_SURFACE = 'admin-btn admin-btn-surface admin-btn--md';

export const PLATFORM_LINK = PLATFORM_BTN_GHOST;

export const PLATFORM_TEXT = 'text-[var(--admin-text)]';

export const PLATFORM_TEXT_SECONDARY = 'text-[var(--admin-text-secondary)]';

export const PLATFORM_TEXT_MUTED = 'text-[var(--admin-text-muted)]';

export const PLATFORM_BG_ELEVATED = 'bg-[var(--admin-bg-elevated)]';

export const PLATFORM_BG_SUBTLE = 'bg-[var(--admin-bg-subtle)]';

export const PLATFORM_BORDER = 'border-[var(--admin-border)]';

export const PLATFORM_SEARCH_WRAP = 'admin-search-wrap w-full min-w-0';

export const PLATFORM_SEARCH_FIELD = 'admin-search-field';

export const PLATFORM_SEARCH_ICON = 'admin-search-icon';

export const PLATFORM_ICON_BTN = 'admin-icon-btn admin-icon-btn--md shrink-0';

export const PLATFORM_BADGE_INFO = 'admin-badge admin-badge--info';

export const PLATFORM_BADGE_SUCCESS = 'admin-badge admin-badge--success';

export const PLATFORM_BADGE_WARNING = 'admin-badge admin-badge--warning';

export const PLATFORM_BADGE_DANGER = 'admin-badge admin-badge--danger';

export const PLATFORM_BADGE_NEUTRAL = 'admin-badge admin-badge--neutral';

export const PLATFORM_SEGMENT_TABS = 'student-segment-tabs';

export const PLATFORM_SEGMENT_TAB_ACTIVE = 'student-segment-tab student-segment-tab--active';

export const PLATFORM_SEGMENT_TAB = 'student-segment-tab';

export const PLATFORM_FORM_INPUT = 'admin-form-input admin-field';

export const PLATFORM_TABLE = 'admin-table';

export const PLATFORM_TABLE_SCROLL = 'admin-table-scroll';

export const PLATFORM_EMPTY = 'admin-search-empty-state admin-search-empty-state--panel';

export const PLATFORM_KPI_PANEL = 'admin-kpi-panel';

export const PLATFORM_KPI_GRID_4 = 'admin-kpi-grid admin-kpi-grid--4';

export const PLATFORM_KPI_CELL = 'admin-kpi-cell';

export const PLATFORM_STATS_PANEL =
  'admin-stats-panel overflow-hidden rounded-admin-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-admin-sm';

export const PLATFORM_STATS_GRID_5 = 'admin-stats-grid admin-stats-grid--5';

/** Alias rétrocompat student */
export const STUDENT_SHELL_CLASS = PLATFORM_SHELL;
export const STUDENT_SURFACE_CARD = PLATFORM_PANEL;
export const STUDENT_SURFACE_CARD_INTERACTIVE = PLATFORM_PANEL_INTERACTIVE;
export const STUDENT_CATALOG_CARD = PLATFORM_CARD;
export const STUDENT_PRIMARY_BUTTON = PLATFORM_BTN_PRIMARY;
export const STUDENT_SECONDARY_BUTTON = PLATFORM_BTN_SECONDARY;
export const STUDENT_OUTLINE_BUTTON = PLATFORM_BTN_OUTLINE;
export const STUDENT_GHOST_BUTTON = PLATFORM_BTN_GHOST;
export const STUDENT_SURFACE_BUTTON = PLATFORM_BTN_SURFACE;
export const STUDENT_SECTION_LINK = `${PLATFORM_BTN_GHOST} admin-btn--sm !h-auto !px-2 !py-1 text-[var(--admin-brand)]`;
export const STUDENT_BACK_LINK = `${PLATFORM_BTN_GHOST} admin-btn--sm !h-auto !px-0 !py-0 text-[var(--admin-brand)] underline-offset-2 hover:underline`;
export const STUDENT_EMPTY_STATE = 'admin-empty-state';
export const STUDENT_TEXT_PRIMARY = PLATFORM_TEXT;
export const STUDENT_TEXT_SECONDARY = PLATFORM_TEXT_SECONDARY;
export const STUDENT_TEXT_MUTED = PLATFORM_TEXT_MUTED;
export const STUDENT_PAGE_CONTAINER = PLATFORM_PAGE_DEFAULT;
export const STUDENT_PAGE_CONTAINER_WIDE = PLATFORM_PAGE_WIDE;
export const STUDENT_PAGE_CONTAINER_NARROW = PLATFORM_PAGE_NARROW;
export const STUDENT_SEGMENT_TABS = PLATFORM_SEGMENT_TABS;
export const STUDENT_SEGMENT_TAB_ACTIVE = PLATFORM_SEGMENT_TAB_ACTIVE;
export const STUDENT_SEGMENT_TAB_INACTIVE = PLATFORM_SEGMENT_TAB;
export const STUDENT_SEARCH_WRAP = PLATFORM_SEARCH_WRAP;
export const STUDENT_SEARCH_FIELD = PLATFORM_SEARCH_FIELD;
export const STUDENT_SEARCH_ICON = PLATFORM_SEARCH_ICON;
export const STUDENT_FILTER_ICON_BTN = PLATFORM_ICON_BTN;
export const STUDENT_TAG_BADGE = PLATFORM_BADGE_INFO;
export const STUDENT_CARD_CTA_BTN = `${PLATFORM_BTN_PRIMARY} w-full`;

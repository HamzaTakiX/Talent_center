/** Layout responsive — module Agenda Encadrant. */

import {
  ENC_BTN_OUTLINE,
  ENC_BTN_PRIMARY,
  ENC_ICON_BTN,
  ENC_KPI_CARD,
  ENC_PAGE,
  ENC_PANEL,
  ENC_SEARCH_FIELD,
  ENC_SEARCH_WRAP,
  ENC_SECTION,
  ENC_TOOLBAR,
} from '../../constants/encadrantTokens';

export const AGENDA_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const AGENDA_PAGE_HEADER =
  'flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4';

export const AGENDA_STATS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4';

export const AGENDA_STAT_CARD = `${ENC_KPI_CARD} font-inter`;

export const AGENDA_SECTION_CARD = `${ENC_SECTION} font-inter`;

export const AGENDA_TOOLBAR_ROW =
  'flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between';

export const AGENDA_VIEW_TOGGLE =
  'admin-section-nav inline-flex w-full min-w-0 shrink-0 gap-1 rounded-xl border border-[var(--admin-border)] p-1 sm:w-auto';

export const AGENDA_VIEW_TOGGLE_BTN =
  'admin-section-tab inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition-all sm:h-10 sm:flex-none sm:px-4';

export const AGENDA_VIEW_TOGGLE_BTN_ACTIVE = 'admin-section-tab--active';

export const AGENDA_VIEW_TOGGLE_BTN_INACTIVE = '';

export const AGENDA_MONTH_NAV =
  'flex w-full min-w-0 items-center justify-center gap-2 sm:w-auto sm:shrink-0';

export const AGENDA_MONTH_NAV_BTN = ENC_ICON_BTN;

export const AGENDA_SEARCH_ROW = ENC_TOOLBAR;

export const AGENDA_SEARCH_WRAP = `${ENC_SEARCH_WRAP} relative flex min-h-[44px] flex-1 items-center`;

export const AGENDA_SEARCH_INPUT = ENC_SEARCH_FIELD;

export const AGENDA_FILTER_BTN = ENC_ICON_BTN;

export const AGENDA_WEEK_SCROLL =
  'w-full min-w-0 overflow-x-auto overscroll-x-contain';

export const AGENDA_WEEK_GRID =
  'grid min-w-[640px] grid-cols-7 gap-2 sm:min-w-[720px] sm:gap-3';

export const AGENDA_DAY_COLUMN =
  'flex min-w-[88px] flex-col rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] sm:min-w-[100px]';

export const AGENDA_DAY_COLUMN_HIGHLIGHT =
  'border-[var(--admin-brand)] bg-[var(--admin-brand-muted)]';

export const AGENDA_DAY_HEADER =
  'flex items-center justify-between gap-1 border-b border-solid border-[var(--admin-border)] px-2 py-2 sm:px-2.5';

export const AGENDA_DAY_BODY =
  'flex min-h-[120px] flex-col gap-2 p-2 sm:min-h-[140px] sm:p-2.5';

export const AGENDA_ADD_DAY_BTN =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-bg-elevated)] hover:text-[var(--admin-text)]';

export const AGENDA_PRIMARY_BTN = `${ENC_BTN_PRIMARY} self-start`;

export const AGENDA_LIST =
  'flex w-full min-w-0 flex-col gap-3';

export const AGENDA_LIST_DAY_GROUP =
  'flex w-full min-w-0 flex-col gap-2';

export const AGENDA_EVENT_CARD_BTN =
  'relative box-border flex w-full min-w-0 cursor-pointer flex-col gap-1 rounded-[10px] border border-solid p-2.5 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-brand)]/30 sm:p-3';

export const AGENDA_MODAL_OVERLAY =
  'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[color-mix(in_srgb,var(--admin-text)_45%,transparent)] p-3 backdrop-blur-[2px] sm:p-4';

export const AGENDA_MODAL_PANEL = `${ENC_PANEL} relative box-border flex max-h-[min(92dvh,720px)] w-full min-w-0 max-w-[560px] flex-col overflow-hidden shadow-[0_20px_50px_color-mix(in_srgb,var(--admin-text)_18%,transparent)]`;

export const AGENDA_MODAL_BODY =
  'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-1 sm:px-6 sm:pb-5';

export const AGENDA_MODAL_DETAILS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5';

export const AGENDA_MODAL_FOOTER =
  'flex shrink-0 flex-col gap-2 border-t border-solid border-[var(--admin-border)] px-4 py-4 sm:flex-row sm:flex-wrap sm:px-6';

export const AGENDA_MODAL_PRIMARY_ACTION = `${ENC_BTN_PRIMARY} min-w-0 flex-1 sm:flex-none`;

export const AGENDA_MODAL_SECONDARY_ACTION = `${ENC_BTN_OUTLINE} min-w-0 flex-1 sm:flex-none`;

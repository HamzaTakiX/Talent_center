/** Layout responsive — page Reports Pending. */

import {
  ENC_BTN_OUTLINE,
  ENC_BTN_PRIMARY,
  ENC_KPI_CARD,
  ENC_PAGE,
  ENC_PANEL,
  ENC_SECTION,
  ENC_TEXT,
  ENC_TEXT_MUTED,
} from '../../../../constants/encadrantTokens';

export const REPORTS_PENDING_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const REPORTS_PENDING_STATS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4';

export const REPORTS_PENDING_STAT_CARD = `${ENC_KPI_CARD} font-inter`;

export const REPORTS_PENDING_SECTION_CARD = `${ENC_SECTION} font-inter`;

export const REPORTS_PENDING_TABLE_WRAP = 'hidden w-full min-w-0 md:block';

export const REPORTS_PENDING_MOBILE_LIST = 'flex w-full min-w-0 flex-col gap-3 md:hidden';

export const REPORTS_PENDING_TABLE =
  'w-full min-w-0 border-collapse text-left font-inter';

export const REPORTS_PENDING_TABLE_HEAD =
  'border-b border-solid border-[var(--admin-border)]';

export const REPORTS_PENDING_TH = `pb-3 pr-4 text-sm font-medium leading-5 ${ENC_TEXT_MUTED} last:pr-0`;

export const REPORTS_PENDING_ROW =
  'border-b border-solid border-[var(--admin-border)] last:border-b-0';

export const REPORTS_PENDING_TD = `py-4 pr-4 align-middle text-sm font-normal leading-5 ${ENC_TEXT} last:pr-0`;

export const REPORTS_PENDING_ACTIONS_CELL =
  'flex min-w-0 flex-wrap items-center gap-2';

export const REPORTS_PENDING_PRIMARY_ACTION = `${ENC_BTN_PRIMARY} admin-btn--sm shrink-0`;

export const REPORTS_PENDING_SECONDARY_ACTION = `${ENC_BTN_OUTLINE} admin-btn--sm shrink-0`;

export const REPORTS_PENDING_MOBILE_CARD = `${ENC_PANEL} box-border flex w-full min-w-0 flex-col gap-3 bg-[var(--admin-bg-subtle)] p-4`;

export const REPORTS_PENDING_MOBILE_ROW =
  'flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3';

export const REPORTS_PENDING_MOBILE_LABEL = `text-xs font-medium uppercase tracking-wide ${ENC_TEXT_MUTED}`;

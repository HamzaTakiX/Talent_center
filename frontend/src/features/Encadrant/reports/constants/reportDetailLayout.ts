/** Layout responsive — page détail rapports étudiant. */

import {
  ENC_BTN_OUTLINE,
  ENC_BTN_PRIMARY,
  ENC_PAGE,
  ENC_PANEL,
  ENC_TEXT,
  ENC_TEXT_MUTED,
  ENC_TEXT_SECONDARY,
} from '../../constants/encadrantTokens';

export const REPORT_DETAIL_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const REPORT_DETAIL_CARD = `${ENC_PANEL} box-border flex w-full min-w-0 flex-col gap-0 overflow-hidden font-inter`;

export const REPORT_DETAIL_HEADER =
  'flex w-full min-w-0 flex-col gap-4 border-b border-solid border-[var(--admin-border)] p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-5 md:p-6';

export const REPORT_DETAIL_HEADER_MAIN =
  'flex min-w-0 flex-1 flex-col gap-1';

export const REPORT_DETAIL_TITLE = `m-0 text-xl font-semibold leading-7 tracking-tight ${ENC_TEXT} sm:text-2xl`;

export const REPORT_DETAIL_SUBTITLE = `m-0 text-sm font-normal leading-5 ${ENC_TEXT_MUTED}`;

export const REPORT_DETAIL_STATUS_BADGE =
  'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-4';

export const REPORT_DETAIL_TABLE_HEAD =
  'hidden min-w-0 grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,2.2fr)] items-center gap-3 border-b border-solid border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-4 py-3 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)] md:grid md:px-5 lg:px-6';

export const REPORT_DETAIL_TABLE_BODY =
  'flex w-full min-w-0 flex-col';

export const REPORT_DETAIL_TABLE_ROW =
  'hidden min-w-0 grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,2.2fr)] items-center gap-3 border-b border-solid border-[var(--admin-border)] px-4 py-4 last:border-b-0 md:grid md:px-5 lg:px-6';

export const REPORT_DETAIL_ROW_TITLE = `m-0 text-sm font-semibold leading-5 ${ENC_TEXT}`;

export const REPORT_DETAIL_ROW_CELL = `text-sm font-normal leading-5 ${ENC_TEXT_SECONDARY}`;

export const REPORT_DETAIL_ROW_BADGE =
  'inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-4';

export const REPORT_DETAIL_ACTIONS =
  'flex min-w-0 flex-nowrap items-center justify-start gap-1.5 sm:gap-2';

export const REPORT_DETAIL_ACTION_BTN = `${ENC_BTN_OUTLINE} admin-btn--sm shrink-0 whitespace-nowrap`;

export const REPORT_DETAIL_VALIDATE_BTN = `${ENC_BTN_PRIMARY} admin-btn--sm shrink-0 whitespace-nowrap`;

export const REPORT_DETAIL_MOBILE_CARD =
  'flex w-full min-w-0 flex-col gap-3 border-b border-solid border-[var(--admin-border)] p-4 last:border-b-0 md:hidden';

export const REPORT_DETAIL_MOBILE_FIELD =
  'flex min-w-0 flex-col gap-0.5';

export const REPORT_DETAIL_MOBILE_LABEL = `text-xs font-medium uppercase tracking-wide ${ENC_TEXT_MUTED}`;

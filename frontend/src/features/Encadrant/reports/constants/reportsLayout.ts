/** Layout responsive — module Reports Encadrant. */

import {
  ENC_ENTITY_CARD,
  ENC_ICON_BTN,
  ENC_KPI_CARD,
  ENC_PAGE,
  ENC_SEARCH_FIELD,
  ENC_SEARCH_WRAP,
  ENC_SECTION,
  ENC_TEXT,
  ENC_TEXT_MUTED,
  ENC_TOOLBAR,
} from '../../constants/encadrantTokens';

export const REPORTS_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const REPORTS_STATS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4';

export const REPORTS_STAT_CARD = `${ENC_KPI_CARD} font-inter`;

export const REPORTS_SECTION_CARD = `${ENC_SECTION} font-inter`;

export const REPORTS_TOOLBAR_ROW = ENC_TOOLBAR;

export const REPORTS_SEARCH_WRAP = `${ENC_SEARCH_WRAP} relative flex min-h-[44px] flex-1 items-center sm:min-h-[48px]`;

export const REPORTS_SEARCH_INPUT = ENC_SEARCH_FIELD;

export const REPORTS_FILTER_BTN = ENC_ICON_BTN;

export const REPORTS_STUDENT_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-5';

export const REPORTS_STUDENT_CARD = `${ENC_ENTITY_CARD} gap-4 p-4 font-inter sm:gap-4 sm:p-5`;

export const REPORTS_STUDENT_HEADER =
  'flex min-w-0 items-start justify-between gap-3';

export const REPORTS_STUDENT_NAME = `m-0 text-base font-semibold leading-6 ${ENC_TEXT} sm:text-lg`;

export const REPORTS_STUDENT_LEVEL = `m-0 mt-0.5 text-sm font-normal leading-5 ${ENC_TEXT_MUTED}`;

export const REPORTS_STATUS_BADGE =
  'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-4';

export const REPORTS_INFO_BLOCK =
  'flex w-full min-w-0 flex-col gap-3';

export const REPORTS_INFO_ROW =
  'flex min-w-0 flex-col gap-1';

export const REPORTS_INFO_LABEL = `text-xs font-normal leading-4 ${ENC_TEXT_MUTED} sm:text-sm`;

export const REPORTS_INFO_VALUE = `m-0 text-sm font-semibold leading-5 ${ENC_TEXT}`;

export const REPORTS_INFO_SUB = `m-0 text-xs font-normal leading-4 ${ENC_TEXT_MUTED}`;

export const REPORTS_PROGRESS_WRAP =
  'flex w-full min-w-0 flex-col gap-2 pt-1';

export const REPORTS_PROGRESS_HEADER =
  'flex min-w-0 items-center justify-between gap-2';

export const REPORTS_PROGRESS_LABEL = `text-sm font-medium leading-5 ${ENC_TEXT_MUTED}`;

export const REPORTS_PROGRESS_VALUE = `text-sm font-semibold tabular-nums leading-5 ${ENC_TEXT}`;

export const REPORTS_PROGRESS_TRACK =
  'h-2 w-full overflow-hidden rounded-full bg-[var(--admin-bg-subtle)]';

export const REPORTS_PROGRESS_FILL =
  'h-full rounded-full transition-all';

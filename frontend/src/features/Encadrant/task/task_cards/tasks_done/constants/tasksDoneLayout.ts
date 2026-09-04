/** Layout responsive — page Tasks Done. */

import {
  ENC_ENTITY_CARD,
  ENC_ICON_BTN,
  ENC_KPI_CARD,
  ENC_PAGE,
  ENC_SEARCH_FIELD,
  ENC_SEARCH_WRAP,
  ENC_SECTION,
  ENC_TOOLBAR,
} from '../../../../constants/encadrantTokens';

export const TASKS_DONE_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const TASKS_DONE_STATS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4';

export const TASKS_DONE_STAT_CARD = `${ENC_KPI_CARD} font-inter`;

export const TASKS_DONE_SECTION_CARD = `${ENC_SECTION} font-inter`;

export const TASKS_DONE_SEARCH_ROW = ENC_TOOLBAR;

export const TASKS_DONE_SEARCH_WRAP = `${ENC_SEARCH_WRAP} relative flex min-h-[44px] flex-1 items-center`;

export const TASKS_DONE_SEARCH_INPUT = ENC_SEARCH_FIELD;

export const TASKS_DONE_FILTER_BTN = ENC_ICON_BTN;

export const TASKS_DONE_STUDENT_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5';

export const TASKS_DONE_STUDENT_CARD = `${ENC_ENTITY_CARD} p-4 sm:p-5`;

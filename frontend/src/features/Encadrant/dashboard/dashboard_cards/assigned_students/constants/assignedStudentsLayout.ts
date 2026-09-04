/** Layout responsive — page Assigned Students. */

import {
  ENC_BTN_OUTLINE,
  ENC_ENTITY_CARD,
  ENC_KPI_CARD,
  ENC_PAGE,
  ENC_SEARCH_FIELD,
  ENC_SEARCH_WRAP,
  ENC_SECTION,
  ENC_TOOLBAR,
} from '../../../../constants/encadrantTokens';

export const ASSIGNED_STUDENTS_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const ASSIGNED_STUDENTS_STATS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4';

export const ASSIGNED_STUDENTS_STAT_CARD = `${ENC_KPI_CARD} font-inter`;

export const ASSIGNED_STUDENTS_SECTION_CARD = `${ENC_SECTION} font-inter`;

export const ASSIGNED_STUDENTS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-5';

export const ASSIGNED_STUDENTS_CARD = `${ENC_ENTITY_CARD} font-inter`;

export const ASSIGNED_STUDENTS_TOOLBAR_ROW = ENC_TOOLBAR;

export const ASSIGNED_STUDENTS_SEARCH_WRAP = `${ENC_SEARCH_WRAP} relative flex min-h-[44px] flex-1 items-center sm:min-h-[48px]`;

export const ASSIGNED_STUDENTS_SEARCH_INPUT = ENC_SEARCH_FIELD;

export const ASSIGNED_STUDENTS_FILTER_BUTTON = `${ENC_BTN_OUTLINE} shrink-0 gap-2 whitespace-nowrap`;

export const ASSIGNED_STUDENTS_FILTER_GROUP =
  'flex w-full min-w-0 shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2';

/** Layout responsive — module Dashboard Encadrant. */

import {
  ENC_ENTITY_CARD,
  ENC_ICON_BTN,
  ENC_KPI_CARD,
  ENC_PAGE,
  ENC_SEARCH_FIELD,
  ENC_SEARCH_WRAP,
  ENC_SECTION,
  ENC_TOOLBAR,
} from '../../constants/encadrantTokens';

export const DASHBOARD_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const DASHBOARD_STATS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-3 max-[429px]:gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4';

export const DASHBOARD_STAT_CARD = `${ENC_KPI_CARD} font-inter`;

export const DASHBOARD_SECTION_CARD = `${ENC_SECTION} font-inter`;

export const DASHBOARD_STUDENTS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-5';

export const DASHBOARD_STUDENT_CARD = `${ENC_ENTITY_CARD} font-inter`;

export const DASHBOARD_SEARCH_ROW = ENC_TOOLBAR;

export const DASHBOARD_SEARCH_INPUT_WRAP = `${ENC_SEARCH_WRAP} relative flex min-h-[40px] flex-1 items-center`;

export const DASHBOARD_SEARCH_INPUT = ENC_SEARCH_FIELD;

export const DASHBOARD_FILTER_BUTTON = ENC_ICON_BTN;

/** Layout responsive — page Students at Risk. */

import {
  ENC_BTN_OUTLINE,
  ENC_BTN_PRIMARY,
  ENC_KPI_CARD,
  ENC_PAGE,
  ENC_SECTION,
} from '../../../../constants/encadrantTokens';

export const STUDENTS_AT_RISK_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const STUDENTS_AT_RISK_STATS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4';

export const STUDENTS_AT_RISK_STAT_CARD = `${ENC_KPI_CARD} font-inter`;

export const STUDENTS_AT_RISK_SECTION_CARD = `${ENC_SECTION} font-inter`;

export const STUDENTS_AT_RISK_ALERT_LIST =
  'flex w-full min-w-0 flex-col gap-4';

export const STUDENTS_AT_RISK_ALERT_ACTIONS =
  'flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap';

export const STUDENTS_AT_RISK_PRIMARY_ACTION = `${ENC_BTN_PRIMARY} min-w-0 flex-1 sm:flex-none`;

export const STUDENTS_AT_RISK_SECONDARY_ACTION = `${ENC_BTN_OUTLINE} min-w-0 flex-1 sm:flex-none`;

export const STUDENTS_AT_RISK_METRICS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 border-t border-solid border-[var(--admin-border)] pt-4 sm:grid-cols-3 sm:gap-5';

export const STUDENTS_AT_RISK_FACTORS_ROW =
  'flex w-full min-w-0 flex-wrap gap-2';

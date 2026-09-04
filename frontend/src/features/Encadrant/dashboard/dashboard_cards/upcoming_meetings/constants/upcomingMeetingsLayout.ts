/** Layout responsive — page Upcoming Meetings. */

import {
  ENC_BTN_OUTLINE,
  ENC_BTN_PRIMARY,
  ENC_KPI_CARD,
  ENC_PAGE,
  ENC_PANEL,
  ENC_SECTION,
  ENC_TEXT,
} from '../../../../constants/encadrantTokens';

export const UPCOMING_MEETINGS_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const UPCOMING_MEETINGS_STATS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4';

export const UPCOMING_MEETINGS_STAT_CARD = `${ENC_KPI_CARD} font-inter`;

export const UPCOMING_MEETINGS_SECTION_CARD = `${ENC_SECTION} font-inter`;

export const UPCOMING_MEETINGS_LIST =
  'flex w-full min-w-0 flex-col gap-4';

export const UPCOMING_MEETINGS_MEETING_CARD = `${ENC_PANEL} box-border flex w-full min-w-0 flex-col gap-4 overflow-hidden border-l-4 border-l-[var(--admin-brand)] p-4 sm:gap-5 sm:p-5`;

export const UPCOMING_MEETINGS_DETAILS_ROW =
  'flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 md:gap-6';

export const UPCOMING_MEETINGS_DETAIL_ITEM = `inline-flex min-w-0 items-center gap-2 text-sm font-normal leading-5 ${ENC_TEXT}`;

export const UPCOMING_MEETINGS_ACTIONS_ROW =
  'flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap';

export const UPCOMING_MEETINGS_PRIMARY_ACTION = `${ENC_BTN_PRIMARY} min-w-0 flex-1 sm:flex-none`;

export const UPCOMING_MEETINGS_SECONDARY_ACTION = `${ENC_BTN_OUTLINE} min-w-0 flex-1 sm:flex-none`;

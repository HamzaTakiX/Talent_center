/** Layout responsive — page Reports Validated. */

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
  ENC_TEXT_SECONDARY,
  ENC_TOOLBAR,
} from '../../../../constants/encadrantTokens';

export const REPORTS_VALIDATED_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const REPORTS_VALIDATED_STATS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4';

export const REPORTS_VALIDATED_STAT_CARD = `${ENC_KPI_CARD} font-inter`;

export const REPORTS_VALIDATED_SECTION_CARD = `${ENC_SECTION} font-inter`;

export const REPORTS_VALIDATED_SEARCH_ROW = ENC_TOOLBAR;

export const REPORTS_VALIDATED_SEARCH_WRAP = `${ENC_SEARCH_WRAP} relative flex min-h-[44px] flex-1 items-center`;

export const REPORTS_VALIDATED_SEARCH_INPUT = ENC_SEARCH_FIELD;

export const REPORTS_VALIDATED_FILTER_BTN = ENC_ICON_BTN;

export const REPORTS_VALIDATED_STUDENT_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5';

export const REPORTS_VALIDATED_STUDENT_CARD = `${ENC_ENTITY_CARD} gap-4 p-4 sm:gap-4 sm:p-5`;

export const REPORTS_VALIDATED_STUDENT_NAME = `m-0 text-base font-semibold leading-6 ${ENC_TEXT} sm:text-lg`;

export const REPORTS_VALIDATED_STUDENT_LEVEL = `m-0 mt-0.5 text-sm font-normal leading-5 ${ENC_TEXT_MUTED}`;

export const REPORTS_VALIDATED_REPORTS_COUNT = `flex shrink-0 items-center gap-1.5 text-sm font-medium ${ENC_TEXT_SECONDARY}`;

export const REPORTS_VALIDATED_FIELD_LABEL = `m-0 text-sm font-semibold leading-5 ${ENC_TEXT}`;

export const REPORTS_VALIDATED_FIELD_VALUE = `m-0 mt-1 text-sm font-medium leading-5 ${ENC_TEXT}`;

export const REPORTS_VALIDATED_FIELD_SUB = `m-0 mt-0.5 text-xs font-normal leading-4 ${ENC_TEXT_MUTED}`;

export const REPORTS_VALIDATED_FIELD_SUB_OVERDUE =
  'm-0 mt-0.5 text-xs font-semibold leading-4 text-[var(--admin-danger)]';

export const REPORTS_VALIDATED_PROGRESS_TRACK =
  'h-2 w-full overflow-hidden rounded-full bg-[var(--admin-bg-subtle)]';

export const REPORTS_VALIDATED_STATUS_BADGE =
  'inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-4';

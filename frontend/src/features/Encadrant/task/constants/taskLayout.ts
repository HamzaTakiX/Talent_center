/** Layout responsive — module Task Encadrant. */

import {
  ENC_ENTITY_CARD,
  ENC_ICON_BTN,
  ENC_KPI_CARD,
  ENC_PAGE,
  ENC_PANEL,
  ENC_SEARCH_FIELD,
  ENC_SEARCH_WRAP,
  ENC_SECTION,
  ENC_TOOLBAR,
} from '../../constants/encadrantTokens';

export const TASK_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const TASK_STATS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4';

export const TASK_STAT_CARD = `${ENC_KPI_CARD} font-inter`;

export const TASK_CREATION_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4';

export const TASK_CREATION_CARD_MANUAL = `${ENC_PANEL} box-border flex w-full min-w-0 flex-col items-center justify-center gap-3 border-2 border-dashed border-[var(--admin-border)] px-4 py-8 text-center transition-colors hover:border-[var(--admin-brand)] hover:bg-[var(--admin-bg-subtle)] sm:py-10`;

export const TASK_CREATION_CARD_AI = `${ENC_PANEL} box-border flex w-full min-w-0 flex-col items-center justify-center gap-3 border-2 border-dashed border-[var(--admin-brand)] bg-[var(--admin-brand-muted)] px-4 py-8 text-center transition-colors hover:border-[var(--admin-brand)] hover:bg-[color-mix(in_srgb,var(--admin-brand-muted)_80%,var(--admin-bg-elevated))] sm:py-10`;

export const TASK_SECTION_CARD = `${ENC_SECTION} font-inter`;

export const TASK_SEARCH_ROW = ENC_TOOLBAR;

export const TASK_SEARCH_WRAP = `${ENC_SEARCH_WRAP} relative flex min-h-[44px] flex-1 items-center`;

export const TASK_SEARCH_INPUT = ENC_SEARCH_FIELD;

export const TASK_FILTER_BTN = ENC_ICON_BTN;

export const TASK_STUDENT_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5';

export const TASK_STUDENT_CARD = `${ENC_ENTITY_CARD} p-4 sm:p-5`;

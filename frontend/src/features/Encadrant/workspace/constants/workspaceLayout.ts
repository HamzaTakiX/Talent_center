/** Layout responsive — module Workspace Encadrant. */

import {
  ENC_BADGE_SUCCESS,
  ENC_BTN_OUTLINE,
  ENC_BTN_PRIMARY,
  ENC_ENTITY_CARD,
  ENC_PAGE,
  ENC_SEARCH_FIELD,
  ENC_SEARCH_WRAP,
  ENC_SECTION,
  ENC_TEXT,
  ENC_TEXT_MUTED,
  ENC_TOOLBAR,
} from '../../constants/encadrantTokens';

export const WORKSPACE_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const WORKSPACE_SECTION_CARD = `${ENC_SECTION} font-inter`;

export const WORKSPACE_TOOLBAR_ROW = ENC_TOOLBAR;

export const WORKSPACE_SEARCH_WRAP = `${ENC_SEARCH_WRAP} relative flex min-h-[44px] flex-1 items-center sm:min-h-[48px]`;

export const WORKSPACE_SEARCH_INPUT = ENC_SEARCH_FIELD;

export const WORKSPACE_FILTER_BTN = `${ENC_BTN_OUTLINE} w-full shrink-0 gap-2 whitespace-nowrap sm:w-auto`;

export const WORKSPACE_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-5';

export const WORKSPACE_CARD = `${ENC_ENTITY_CARD} gap-4 p-4 font-inter sm:gap-5 sm:p-5`;

export const WORKSPACE_CARD_HEADER =
  'flex min-w-0 items-start justify-between gap-3';

export const WORKSPACE_CARD_HEADER_MAIN =
  'min-w-0 flex-1';

export const WORKSPACE_CARD_NAME = `m-0 text-base font-semibold leading-6 ${ENC_TEXT} sm:text-lg`;

export const WORKSPACE_CARD_LEVEL = `m-0 mt-0.5 text-sm font-normal leading-5 ${ENC_TEXT_MUTED}`;

export const WORKSPACE_ACTIVE_BADGE = ENC_BADGE_SUCCESS;

export const WORKSPACE_STATS =
  'flex w-full min-w-0 flex-col gap-2.5';

export const WORKSPACE_STAT_ROW =
  'flex min-w-0 items-center justify-between gap-3';

export const WORKSPACE_STAT_LABEL = `text-sm font-normal leading-5 ${ENC_TEXT_MUTED}`;

export const WORKSPACE_STAT_VALUE = `text-sm font-semibold leading-5 tabular-nums ${ENC_TEXT}`;

export const WORKSPACE_OPEN_BTN = `${ENC_BTN_PRIMARY} w-full min-w-0`;

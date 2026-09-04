/** Layout responsive — page vue rapport. */

import {
  ENC_BADGE_WARNING,
  ENC_BTN_OUTLINE,
  ENC_BTN_PRIMARY,
  ENC_FORM_INPUT,
  ENC_ICON_BTN,
  ENC_PAGE,
  ENC_PANEL,
  ENC_SECTION,
  ENC_TEXT,
  ENC_TEXT_MUTED,
  ENC_TEXT_SECONDARY,
} from '../../constants/encadrantTokens';

export const REPORT_VIEW_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const REPORT_VIEW_GRID =
  'grid w-full min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_380px]';

export const REPORT_VIEW_DETAILS_CARD = `${ENC_SECTION} gap-5 sm:gap-6 sm:p-5 md:p-6 font-inter`;

export const REPORT_VIEW_DETAILS_HEADER =
  'flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6';

export const REPORT_VIEW_DETAILS_HEADER_MAIN =
  'min-w-0 flex-1';

export const REPORT_VIEW_TITLE = `m-0 text-xl font-semibold leading-7 tracking-tight ${ENC_TEXT} sm:text-2xl`;

export const REPORT_VIEW_SUBTITLE = `m-0 mt-1 text-sm font-normal leading-5 ${ENC_TEXT_MUTED}`;

export const REPORT_VIEW_REVIEW_BADGE = ENC_BADGE_WARNING;

export const REPORT_VIEW_INFO_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 border-y border-solid border-[var(--admin-border)] py-5 sm:grid-cols-2 sm:gap-6';

export const REPORT_VIEW_INFO_FIELD =
  'flex min-w-0 flex-col gap-1';

export const REPORT_VIEW_INFO_LABEL = `text-sm font-normal leading-5 ${ENC_TEXT_MUTED}`;

export const REPORT_VIEW_INFO_VALUE = `m-0 text-sm font-semibold leading-5 ${ENC_TEXT}`;

export const REPORT_VIEW_SECTION_TITLE = `m-0 text-base font-semibold leading-6 ${ENC_TEXT}`;

export const REPORT_VIEW_FILE_CARD = `${ENC_PANEL} box-border flex w-full min-w-0 flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4`;

export const REPORT_VIEW_FILE_ICON_WRAP =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[color-mix(in_srgb,var(--admin-danger)_12%,var(--admin-bg-elevated))] text-[var(--admin-danger)]';

export const REPORT_VIEW_FILE_MAIN =
  'min-w-0 flex-1';

export const REPORT_VIEW_FILE_NAME = `m-0 text-sm font-semibold leading-5 ${ENC_TEXT}`;

export const REPORT_VIEW_FILE_META = `m-0 mt-0.5 text-xs font-normal leading-4 ${ENC_TEXT_MUTED}`;

export const REPORT_VIEW_FILE_ACTIONS =
  'flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:shrink-0';

export const REPORT_VIEW_OUTLINE_BTN = `${ENC_BTN_OUTLINE} admin-btn--sm shrink-0 whitespace-nowrap`;

export const REPORT_VIEW_SUMMARY_TEXT = `m-0 text-sm font-normal leading-relaxed ${ENC_TEXT_SECONDARY}`;

export const REPORT_VIEW_ACTIONS_ROW =
  'flex w-full min-w-0 flex-col gap-2 border-t border-solid border-[var(--admin-border)] pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3';

export const REPORT_VIEW_VALIDATE_BTN = `${ENC_BTN_PRIMARY} min-w-0 flex-1 sm:flex-none sm:min-w-[160px]`;

export const REPORT_VIEW_SECONDARY_BTN = `${ENC_BTN_OUTLINE} min-w-0 flex-1 sm:flex-none sm:min-w-[160px]`;

export const REPORT_VIEW_DELETE_BTN = `${ENC_BTN_OUTLINE} min-w-0 flex-1 sm:flex-none sm:min-w-[120px]`;

export const REPORT_VIEW_COMMENTS_CARD = `${ENC_PANEL} box-border flex w-full min-w-0 flex-col overflow-hidden font-inter lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)]`;

export const REPORT_VIEW_COMMENTS_HEADER =
  'border-b border-solid border-[var(--admin-border)] p-4 sm:p-5';

export const REPORT_VIEW_COMMENTS_TITLE = `m-0 text-base font-semibold leading-6 ${ENC_TEXT} sm:text-lg`;

export const REPORT_VIEW_COMMENTS_SUBTITLE = `m-0 mt-1 text-sm font-normal leading-5 ${ENC_TEXT_MUTED}`;

export const REPORT_VIEW_COMMENTS_LIST =
  'flex min-h-[240px] flex-1 flex-col gap-4 overflow-y-auto p-4 sm:gap-5 sm:p-5';

export const REPORT_VIEW_COMMENT_BUBBLE_WRAP =
  'flex w-full min-w-0 flex-col gap-1';

export const REPORT_VIEW_COMMENT_BUBBLE_WRAP_YOU =
  'items-end';

export const REPORT_VIEW_COMMENT_BUBBLE_WRAP_STUDENT =
  'items-start';

export const REPORT_VIEW_COMMENT_AUTHOR = `m-0 text-xs font-medium leading-4 ${ENC_TEXT_MUTED}`;

export const REPORT_VIEW_COMMENT_BUBBLE =
  'max-w-[92%] rounded-[12px] px-3.5 py-2.5 text-sm font-normal leading-relaxed sm:max-w-[85%]';

export const REPORT_VIEW_COMMENT_BUBBLE_YOU =
  'bg-[var(--admin-brand)] text-white';

export const REPORT_VIEW_COMMENT_BUBBLE_STUDENT =
  'bg-[var(--admin-bg-subtle)] text-[var(--admin-text)]';

export const REPORT_VIEW_COMMENT_TIME = `m-0 text-xs font-normal leading-4 ${ENC_TEXT_MUTED}`;

export const REPORT_VIEW_COMMENTS_INPUT_ROW =
  'flex w-full min-w-0 items-center gap-2 border-t border-solid border-[var(--admin-border)] p-3 sm:p-4';

export const REPORT_VIEW_ATTACH_BTN = ENC_ICON_BTN;

export const REPORT_VIEW_COMMENT_INPUT = `${ENC_FORM_INPUT} h-10 flex-1`;

export const REPORT_VIEW_SEND_BTN = `${ENC_BTN_PRIMARY} !h-10 !w-10 !min-w-0 !p-0 shrink-0`;

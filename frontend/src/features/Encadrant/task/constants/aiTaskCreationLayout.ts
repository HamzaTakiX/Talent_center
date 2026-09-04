/** Layout responsive — page AI Task Creation. */

import {
  ENC_BTN_OUTLINE,
  ENC_BTN_PRIMARY,
  ENC_FORM_INPUT,
  ENC_PAGE,
  ENC_PANEL,
  ENC_SECTION,
  ENC_TEXT,
  ENC_TEXT_MUTED,
} from '../../constants/encadrantTokens';

export const AI_TASK_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const AI_TASK_FORM_CARD = `${ENC_SECTION} gap-6 sm:gap-7 sm:p-6 md:p-8 font-inter`;

export const AI_TASK_HEADER_ROW =
  'flex min-w-0 flex-col gap-1';

export const AI_TASK_HEADER_TITLE_ROW =
  'flex min-w-0 flex-wrap items-center gap-2';

export const AI_TASK_HEADER_ICON =
  'flex h-8 w-8 shrink-0 items-center justify-center text-[var(--admin-brand)] sm:h-9 sm:w-9';

export const AI_TASK_FIELD =
  'flex w-full min-w-0 flex-col gap-2';

export const AI_TASK_LABEL = `text-sm font-semibold leading-5 ${ENC_TEXT}`;

export const AI_TASK_REQUIRED =
  'text-[var(--admin-danger)]';

export const AI_TASK_UPLOAD_ZONE =
  'relative flex w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-4 py-10 text-center transition-colors hover:border-[var(--admin-brand)] hover:bg-[var(--admin-brand-muted)] sm:gap-2.5 sm:py-12';

export const AI_TASK_UPLOAD_ICON = ENC_TEXT_MUTED;

export const AI_TASK_UPLOAD_TITLE = `m-0 text-sm font-semibold leading-5 ${ENC_TEXT} sm:text-base`;

export const AI_TASK_UPLOAD_SUBTEXT = `m-0 text-xs font-normal leading-4 ${ENC_TEXT_MUTED} sm:text-sm`;

export const AI_TASK_STUDENTS_SELECT = `${ENC_FORM_INPUT} min-h-[160px] px-2 py-2 sm:min-h-[180px]`;

export const AI_TASK_HELPER = `m-0 text-xs font-normal leading-4 ${ENC_TEXT_MUTED}`;

export const AI_TASK_INFO_CARD = `${ENC_PANEL} box-border flex w-full min-w-0 flex-col gap-3 border-[var(--admin-brand)] bg-[var(--admin-brand-muted)] p-4 sm:gap-3.5 sm:p-5`;

export const AI_TASK_INFO_HEADER =
  'flex min-w-0 items-center gap-2';

export const AI_TASK_INFO_ICON =
  'flex h-5 w-5 shrink-0 items-center justify-center text-[var(--admin-brand)]';

export const AI_TASK_INFO_TITLE =
  'm-0 text-sm font-semibold leading-5 text-[var(--admin-brand)] sm:text-base';

export const AI_TASK_INFO_LIST =
  'm-0 flex min-w-0 list-disc flex-col gap-1.5 pl-5 text-sm font-normal leading-5 text-[var(--admin-brand)] marker:text-[var(--admin-brand)]';

export const AI_TASK_ACTIONS_ROW =
  'flex w-full min-w-0 flex-col-reverse gap-3 border-t border-solid border-[var(--admin-border)] pt-6 sm:flex-row sm:justify-end sm:gap-4';

export const AI_TASK_CANCEL_BTN = `${ENC_BTN_OUTLINE} min-w-0 flex-1 sm:flex-none sm:min-w-[140px]`;

export const AI_TASK_SUBMIT_BTN = `${ENC_BTN_PRIMARY} min-w-0 flex-1 sm:flex-none sm:min-w-[200px]`;

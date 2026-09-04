/** Layout responsive — page Create Task Manually. */

import {
  ENC_BTN_OUTLINE,
  ENC_BTN_PRIMARY,
  ENC_FORM_INPUT,
  ENC_PAGE,
  ENC_SECTION,
  ENC_TEXT,
  ENC_TEXT_MUTED,
} from '../../constants/encadrantTokens';

export const CREATE_TASK_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const CREATE_TASK_FORM_CARD = `${ENC_SECTION} gap-6 sm:gap-7 sm:p-6 md:p-8 font-inter`;

export const CREATE_TASK_FORM_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6';

export const CREATE_TASK_FIELD =
  'flex w-full min-w-0 flex-col gap-2';

export const CREATE_TASK_LABEL = `text-sm font-semibold leading-5 ${ENC_TEXT}`;

export const CREATE_TASK_REQUIRED =
  'text-[var(--admin-danger)]';

export const CREATE_TASK_INPUT = ENC_FORM_INPUT;

export const CREATE_TASK_TEXTAREA = `${ENC_FORM_INPUT} min-h-[120px] resize-y py-3 leading-relaxed sm:min-h-[140px]`;

export const CREATE_TASK_SELECT_WRAP =
  'relative flex w-full min-w-0 items-center';

export const CREATE_TASK_SELECT = `${ENC_FORM_INPUT} appearance-none pr-10`;

export const CREATE_TASK_DATE_WRAP =
  'relative flex w-full min-w-0 items-center';

export const CREATE_TASK_STUDENTS_SELECT = `${ENC_FORM_INPUT} min-h-[160px] px-2 py-2 sm:min-h-[180px]`;

export const CREATE_TASK_HELPER = `m-0 text-xs font-normal leading-4 ${ENC_TEXT_MUTED}`;

export const CREATE_TASK_ACTIONS_ROW =
  'flex w-full min-w-0 flex-col-reverse gap-3 border-t border-solid border-[var(--admin-border)] pt-6 sm:flex-row sm:justify-end sm:gap-4';

export const CREATE_TASK_CANCEL_BTN = `${ENC_BTN_OUTLINE} min-w-0 flex-1 sm:flex-none sm:min-w-[140px]`;

export const CREATE_TASK_SUBMIT_BTN = `${ENC_BTN_PRIMARY} min-w-0 flex-1 sm:flex-none sm:min-w-[160px]`;

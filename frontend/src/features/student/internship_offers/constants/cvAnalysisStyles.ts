/** Tokens UI — analyse CV (design system admin). */
import {
  STUDENT_SURFACE_CARD,
  STUDENT_PRIMARY_BUTTON,
  STUDENT_OUTLINE_BUTTON,
  STUDENT_GHOST_BUTTON,
} from '../../design-system/studentTokens';

export const CV_ANALYSIS_CARD = STUDENT_SURFACE_CARD;

export const CV_ANALYSIS_CANCEL_BUTTON = `${STUDENT_GHOST_BUTTON} h-11 w-full sm:w-auto sm:min-w-[120px]`;

export const CV_ANALYSIS_EDIT_BUTTON = `${STUDENT_OUTLINE_BUTTON} h-11 w-full sm:w-auto sm:min-w-[140px]`;

export const CV_ANALYSIS_CONFIRM_BUTTON = `${STUDENT_PRIMARY_BUTTON} h-11 w-full gap-2 sm:min-w-[180px] sm:flex-1`;

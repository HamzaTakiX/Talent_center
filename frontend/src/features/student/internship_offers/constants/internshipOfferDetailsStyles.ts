/** Tokens UI — détail offre (design system admin). */
import {
  STUDENT_PRIMARY_BUTTON,
  STUDENT_OUTLINE_BUTTON,
  STUDENT_SURFACE_CARD,
  STUDENT_TEXT_PRIMARY,
} from '../../design-system/studentTokens';

export const DETAILS_SURFACE_CARD = STUDENT_SURFACE_CARD;

export const DETAILS_PRIMARY_BUTTON = `${STUDENT_PRIMARY_BUTTON} h-11 w-full sm:w-auto sm:min-w-[140px] sm:flex-1`;

export const DETAILS_OUTLINE_BUTTON = `${STUDENT_OUTLINE_BUTTON} h-11 w-full sm:w-auto sm:min-w-[140px] sm:flex-1`;

export const DETAILS_SIDEBAR_ACTION_BUTTON = `${STUDENT_OUTLINE_BUTTON} h-10 w-full gap-2`;

export const DETAILS_SECTION_TITLE = `text-base font-semibold leading-6 ${STUDENT_TEXT_PRIMARY}`;

export const DETAILS_TAG_PRIMARY = 'admin-badge admin-badge--info';

export const DETAILS_TAG_NEUTRAL = 'admin-badge admin-badge--neutral';

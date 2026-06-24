/** Tokens UI — détail offre (design system admin). */

import {

  STUDENT_PRIMARY_BUTTON,

  STUDENT_OUTLINE_BUTTON,

  STUDENT_SURFACE_CARD,

  STUDENT_TEXT_PRIMARY,

  STUDENT_TEXT_SECONDARY,

} from '../../design-system/studentTokens';



export const DETAILS_SURFACE_CARD = STUDENT_SURFACE_CARD;



export const DETAILS_SURFACE_CARD_ELEVATED = `${STUDENT_SURFACE_CARD} transition-shadow duration-200 hover:shadow-sm`;



export const DETAILS_PRIMARY_BUTTON = `${STUDENT_PRIMARY_BUTTON} h-11 w-full sm:w-auto sm:min-w-[148px]`;



export const DETAILS_OUTLINE_BUTTON = `${STUDENT_OUTLINE_BUTTON} h-11 w-full sm:w-auto sm:min-w-[148px]`;



export const DETAILS_SECTION_TITLE = `text-base font-semibold leading-6 tracking-tight ${STUDENT_TEXT_PRIMARY}`;



export const DETAILS_SECTION_SUBTITLE = `text-sm leading-5 ${STUDENT_TEXT_SECONDARY}`;



export const DETAILS_SUBSECTION_LABEL =

  'm-0 mb-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]';



export const DETAILS_TAG_PRIMARY = 'admin-badge admin-badge--info';



export const DETAILS_TAG_NEUTRAL = 'admin-badge admin-badge--neutral';



export const DETAILS_PAGE_SECTION_GAP = 'flex min-w-0 flex-col gap-4 sm:gap-5';



export const DETAILS_MATCH_ZONE =

  'mt-6 flex min-w-0 flex-col gap-4 border-t border-[var(--admin-border)] pt-6 sm:mt-8 sm:gap-5 sm:pt-8';

export const DETAILS_SIMULATION_CTA =
  'student-interview-sim-cta inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-brand)] focus-visible:ring-offset-2';



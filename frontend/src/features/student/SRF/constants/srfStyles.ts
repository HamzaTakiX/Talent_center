/** Tokens UI — module SRF étudiant (design system admin). */
export {
  STUDENT_OUTLINE_BUTTON as SRF_OUTLINE_BTN,
  STUDENT_PRIMARY_BUTTON as SRF_PRIMARY_BTN,
  STUDENT_SEGMENT_TABS as SRF_TAB_BAR,
  STUDENT_SEGMENT_TAB_ACTIVE as SRF_TAB_ACTIVE,
  STUDENT_SEGMENT_TAB_INACTIVE as SRF_TAB_INACTIVE,
} from '../../design-system/studentTokens';

/** Compact table row actions — equal width, centered in the actions column. */
const SRF_TABLE_BTN_BASE = 'admin-table-btn min-w-[6.25rem] justify-center text-[13px]';
export const SRF_TABLE_OUTLINE_BTN = SRF_TABLE_BTN_BASE;
export const SRF_TABLE_PRIMARY_BTN = `${SRF_TABLE_BTN_BASE} admin-table-btn--primary`;
export const SRF_TABLE_BTN_MOBILE =
  'admin-table-btn admin-table-btn--mobile min-w-[6.25rem] justify-center text-[13px]';
export const SRF_TABLE_PRIMARY_BTN_MOBILE = `${SRF_TABLE_BTN_MOBILE} admin-table-btn--primary`;

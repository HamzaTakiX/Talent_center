import {
  STUDENT_SURFACE_CARD,
  STUDENT_SURFACE_CARD_INTERACTIVE,
  STUDENT_PRIMARY_BUTTON,
  STUDENT_SECTION_LINK,
  STUDENT_TEXT_PRIMARY,
  STUDENT_TEXT_SECONDARY,
} from '../../../design-system/studentTokens';

export const CV_TOOL_SURFACE_CARD = STUDENT_SURFACE_CARD;

export const CV_TOOL_SECTION_CARD = `${STUDENT_SURFACE_CARD_INTERACTIVE} px-4 py-4 sm:px-5 sm:py-4`;

export const CV_TOOL_YOUR_CV_CARD = CV_TOOL_SECTION_CARD;

export const CV_TOOL_CONTEXT_CARD = CV_TOOL_SECTION_CARD;

export const CV_TOOL_SECTION_TITLE = `text-base font-semibold leading-6 ${STUDENT_TEXT_PRIMARY}`;

export const CV_TOOL_SECTION_DESC = `text-sm leading-5 ${STUDENT_TEXT_SECONDARY}`;

export const CV_TOOL_PRIMARY_BUTTON = `${STUDENT_PRIMARY_BUTTON} h-11 min-h-[44px] w-full gap-2 rounded-xl`;

export const CV_TOOL_UPLOAD_LINK = STUDENT_SECTION_LINK;

export const CV_TOOL_CV_PREVIEW_CARD = 'admin-module-panel flex w-full items-center gap-3 p-4';

export const CV_TOOL_CV_ICON_BOX =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--admin-radius-sm)] bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]';

export const CV_TOOL_CONTEXT_INPUT = 'admin-form-input admin-field w-full min-h-[88px] resize-y';

export const CV_TOOL_CONTEXT_ROW_DEFAULT = `${STUDENT_SURFACE_CARD_INTERACTIVE} flex w-full cursor-pointer items-start gap-3 p-3 text-left`;

export const CV_TOOL_CONTEXT_ROW_HIGHLIGHT =
  'admin-module-panel flex w-full cursor-pointer items-start gap-3 border-[var(--admin-brand)] bg-[var(--admin-brand-muted)] p-3 text-left';

export const CV_TOOL_ICON_BOX_BLUE = CV_TOOL_CV_ICON_BOX;

export const CV_TOOL_READY_PANEL = `${STUDENT_SURFACE_CARD_INTERACTIVE} flex flex-col items-center gap-4 p-6 text-center`;

export const CV_TOOL_READY_ICON =
  'flex h-14 w-14 items-center justify-center rounded-full bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]';

export const CV_TOOL_PRO_TIP_BOX =
  'student-ai-banner w-full text-start text-sm';

export const CV_TOOL_SCORE_RING =
  'inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--admin-brand)] bg-[var(--admin-brand-muted)] text-lg font-bold text-[var(--admin-brand)]';

export const CV_TOOL_SELECTABLE_ROW = CV_TOOL_CONTEXT_ROW_DEFAULT;

export const CV_TOOL_SELECTABLE_ROW_ACTIVE = CV_TOOL_CONTEXT_ROW_HIGHLIGHT;

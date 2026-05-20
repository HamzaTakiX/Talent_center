/** Tokens UI — AI CV Assistant (design system plateforme). */
import {
  PLATFORM_PANEL_INTERACTIVE,
  PLATFORM_TEXT,
  PLATFORM_TEXT_MUTED,
  PLATFORM_BTN_GHOST,
  PLATFORM_BTN_OUTLINE,
  PLATFORM_BTN_SECONDARY,
  PLATFORM_BTN_PRIMARY,
  PLATFORM_FORM_INPUT,
  PLATFORM_BADGE_INFO,
} from '../../../../../design-system/platformTokens';

export const CV_ASSISTANT_CARD = `${PLATFORM_PANEL_INTERACTIVE} p-5 max-[429px]:p-4`;

export const CV_ASSISTANT_YOUR_CV_CARD = `${PLATFORM_PANEL_INTERACTIVE} px-5 py-4 sm:py-5`;

export const CV_ASSISTANT_MAIN_PANEL = `${PLATFORM_PANEL_INTERACTIVE} flex h-full min-h-0 flex-col overflow-hidden`;

export const CV_ASSISTANT_SECTION_TITLE = `m-0 text-base font-semibold tracking-tight ${PLATFORM_TEXT}`;

export const CV_ASSISTANT_SECTION_LABEL = `m-0 text-xs font-medium uppercase tracking-wide ${PLATFORM_TEXT_MUTED}`;

export const CV_ASSISTANT_CV_PREVIEW = 'admin-module-panel flex w-full items-center gap-3 p-3';

export const CV_ASSISTANT_ICON_BOX =
  'admin-kpi-icon-wrap flex h-9 w-9 shrink-0 items-center justify-center';

export const CV_ASSISTANT_CONTEXT_PILL = PLATFORM_BADGE_INFO;

export const CV_ASSISTANT_EDIT_BTN = PLATFORM_BTN_GHOST;

export const CV_ASSISTANT_PROGRESS_TRACK =
  'h-2.5 w-full overflow-hidden rounded-full bg-[var(--admin-surface-inset)]';

export const CV_ASSISTANT_PROGRESS_FILL =
  'h-full rounded-full bg-[var(--admin-brand)] transition-[width] duration-700 ease-out';

export const CV_ASSISTANT_SCORE_VALUE =
  'text-2xl font-bold leading-8 text-[var(--admin-brand)] tabular-nums';

export const CV_ASSISTANT_SCORE_BADGE = 'admin-badge admin-badge--success';

export const CV_ASSISTANT_HEADER_ICON =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]';

export const CV_ASSISTANT_AVATAR_ICON = CV_ASSISTANT_HEADER_ICON;

export const CV_ASSISTANT_BETA_BADGE = 'admin-badge admin-badge--info';

export const CV_ASSISTANT_MESSAGE_BUBBLE = 'admin-chat-bubble--in max-w-[min(520px,92%)] rounded-2xl px-4 py-3 text-sm';

export const CV_ASSISTANT_MESSAGE_USER = 'admin-chat-bubble--out max-w-[min(520px,92%)] rounded-2xl px-4 py-3 text-sm';

export const CV_ASSISTANT_MESSAGE_AI = CV_ASSISTANT_MESSAGE_BUBBLE;

export const CV_ASSISTANT_LIST_ITEM_STRENGTH = 'text-sm text-[var(--admin-text-secondary)]';

export const CV_ASSISTANT_LIST_ITEM_IMPROVE = 'text-sm text-[var(--admin-text-muted)]';

export const CV_ASSISTANT_INPUT_WRAP =
  'admin-chat-composer-row flex w-full items-end gap-2 border-t border-[var(--admin-border)] p-3';

export const CV_ASSISTANT_TEXTAREA = `${PLATFORM_FORM_INPUT} min-h-10 flex-1 resize-none`;

export const CV_ASSISTANT_SEND_BUTTON = `${PLATFORM_BTN_PRIMARY} !size-10 !p-0 shrink-0`;

export const CV_ASSISTANT_BTN_SECONDARY = PLATFORM_BTN_SECONDARY;

export const CV_ASSISTANT_BTN_OUTLINE_PURPLE = PLATFORM_BTN_OUTLINE;

export const CV_ASSISTANT_REFRESH_BUTTON = PLATFORM_BTN_GHOST;

export const CV_ASSISTANT_SUGGESTION_PILL = 'admin-btn admin-btn-outline admin-btn--sm whitespace-nowrap';

export const CV_ASSISTANT_SUGGESTION_CHIP = CV_ASSISTANT_SUGGESTION_PILL;

export const CV_ASSISTANT_SCORES_CARD = PLATFORM_PANEL_INTERACTIVE;

export const CV_ASSISTANT_COMPOSER = CV_ASSISTANT_INPUT_WRAP;

export const CV_ASSISTANT_COMPOSER_INPUT = CV_ASSISTANT_TEXTAREA;

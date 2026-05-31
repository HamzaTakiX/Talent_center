/** Tokens UI — Interview Simulator (design system admin). */

export const IS_MAIN_PAGE =
  'flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--admin-bg-elevated)]';

export const IS_HEADER =
  'flex shrink-0 items-center gap-3 border-b border-[var(--admin-border)] px-5 py-4 sm:gap-4 sm:px-6 sm:py-5';

export const IS_HEADER_ICON =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--admin-brand)] text-white shadow-[var(--admin-shadow-md)] sm:h-12 sm:w-12';

export const IS_BODY =
  'admin-scroll flex min-h-0 min-w-0 flex-1 flex-col px-5 py-6 sm:px-6 sm:py-8';

export const IS_AVATAR_ICON =
  'flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--admin-brand-muted)] text-[var(--admin-brand)] sm:h-20 sm:w-20';

export const IS_MESSAGE_BUBBLE = 'admin-chat-bubble--in max-w-[min(520px,92%)] rounded-2xl px-4 py-3 text-sm leading-relaxed';

export const IS_MESSAGE_BUBBLE_AI = IS_MESSAGE_BUBBLE;

export const IS_MESSAGE_BUBBLE_USER =
  'admin-chat-bubble--out max-w-[min(520px,92%)] rounded-2xl px-4 py-3 text-sm leading-relaxed';

export const IS_COMPOSER_ROW =
  'flex w-full min-w-0 items-end gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-3 sm:px-5';

export const IS_COMPOSER_INPUT = 'admin-form-input admin-field min-h-10 flex-1 resize-none';

export const IS_SEND_BTN = 'admin-btn admin-btn-primary admin-btn--md !size-10 !p-0 shrink-0';

export const IS_WELCOME_CARD = 'admin-module-panel flex flex-col gap-4 p-5 sm:p-6';

export const IS_ACTIONS_SECTION = 'admin-module-panel mt-4 p-4 sm:p-5';

export const IS_ACTIONS_INNER = 'student-action-grid';

export const IS_ACTION_BTN_BASE =
  'admin-btn admin-btn-outline admin-btn--md h-11 w-full min-w-0 justify-center gap-2 sm:flex-1';

export const IS_ACTION_BTN_UPLOAD = IS_ACTION_BTN_BASE;

export const IS_ACTION_BTN_OFFER = `${IS_ACTION_BTN_BASE} border-[var(--admin-brand)] text-[var(--admin-brand)]`;

export const IS_ACTION_BTN_COMPANY = IS_ACTION_BTN_BASE;

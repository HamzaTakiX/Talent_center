/** Classes Tailwind réutilisables — protection overflow module Offers */

export const SAFE_MIN_WIDTH = 'min-w-0 max-w-full';

export const SAFE_TRUNCATE_SINGLE = `${SAFE_MIN_WIDTH} truncate`;

export const SAFE_LINE_CLAMP_2 = `${SAFE_MIN_WIDTH} line-clamp-2 break-words`;

export const SAFE_LINE_CLAMP_3 = `${SAFE_MIN_WIDTH} line-clamp-3 break-words`;

export const SAFE_LINE_CLAMP_5 = `${SAFE_MIN_WIDTH} line-clamp-5 break-words`;

export const SAFE_BADGE =
  'inline-flex max-w-[10rem] shrink-0 items-center truncate whitespace-nowrap';

export const SAFE_BUTTON_LABEL = 'min-w-0 max-w-full truncate';

export const SAFE_CARD_TITLE = `${SAFE_MIN_WIDTH} truncate font-semibold`;

export const SAFE_FILE_NAME = `${SAFE_MIN_WIDTH} truncate font-medium tabular-nums`;

export const SAFE_TABLE_CELL = `${SAFE_MIN_WIDTH} max-w-[14rem] truncate [overflow-wrap:anywhere]`;

export const SAFE_TABLE_CELL_WIDE = `${SAFE_MIN_WIDTH} max-w-[17.5rem] truncate [overflow-wrap:anywhere]`;

export const SAFE_TITLE_CELL = `${SAFE_MIN_WIDTH} max-w-[17.5rem] line-clamp-2 [overflow-wrap:anywhere] break-words`;

export const SAFE_COMPANY_CELL = `${SAFE_MIN_WIDTH} max-w-[13.75rem] truncate [overflow-wrap:anywhere]`;

export const SAFE_LOCATION_CELL = `${SAFE_MIN_WIDTH} max-w-[11.25rem] truncate [overflow-wrap:anywhere]`;

export const SAFE_CHAT_MESSAGE =
  'max-w-full min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word]';

export const SAFE_CHAT_BUBBLE = 'max-w-[min(85%,28rem)] min-w-0';

export const SAFE_MODAL_BODY = 'max-h-[min(70vh,32rem)] overflow-y-auto overscroll-contain';

export const SAFE_IMAGE =
  'max-h-48 max-w-full object-contain object-center';

export const SAFE_FILTER_CHIP =
  'inline-flex max-w-[8rem] shrink-0 items-center truncate whitespace-nowrap';

export const SAFE_CONTAINER = 'min-w-0 overflow-hidden';

export const CHAR_COUNT_CLASS =
  'mt-1 text-end text-xs tabular-nums text-[var(--admin-text-muted)]';

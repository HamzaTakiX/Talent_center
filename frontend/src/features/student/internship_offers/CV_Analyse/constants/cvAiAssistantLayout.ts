/** Layout responsive — AI CV Assistant (viewport fixe, scroll chat uniquement). */

export const CV_ASSISTANT_VIEWPORT_SHELL =
  'box-border flex h-[calc(100dvh-76px)] max-h-[calc(100dvh-76px)] min-h-0 w-full max-w-none flex-col overflow-hidden font-inter antialiased -mt-3 -mb-3 sm:-mt-5 sm:-mb-5 md:-mt-6 md:-mb-6';

export const CV_ASSISTANT_GRID =
  'grid h-full min-h-0 w-full min-w-0 max-w-none grid-cols-1 gap-4 overflow-hidden max-[429px]:gap-3.5 lg:grid-cols-[minmax(0,248px)_minmax(0,1fr)] lg:items-stretch lg:gap-5 lg:overflow-hidden xl:grid-cols-[minmax(0,272px)_minmax(0,1fr)] xl:gap-6';

export const CV_ASSISTANT_SIDEBAR =
  'flex min-h-0 min-w-0 shrink-0 flex-col gap-3.5 overflow-x-hidden overflow-y-auto overscroll-contain max-lg:max-h-[42vh] lg:max-h-full lg:self-start max-[429px]:gap-3 sm:gap-4';

export const CV_ASSISTANT_CHAT_COLUMN =
  'flex h-full min-h-0 min-w-0 w-full max-w-none flex-1 flex-col self-stretch overflow-hidden max-lg:min-h-[min(52vh,520px)]';

export const CV_ASSISTANT_PANEL_SCROLL =
  'min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain scroll-smooth px-4 py-5 sm:px-6 sm:py-6 max-[429px]:px-3.5 max-[429px]:py-4';

export const CV_ASSISTANT_PANEL_FOOTER =
  'flex shrink-0 flex-col gap-5 border-t border-solid border-[#f1f5f9] bg-gradient-to-t from-white via-white to-[#fafafa]/50 px-4 py-5 backdrop-blur-sm sm:gap-5 sm:px-6 sm:py-6 max-[429px]:gap-4 max-[429px]:px-3.5 max-[429px]:py-4';

export const CV_ASSISTANT_PANEL_HEADER =
  'flex shrink-0 flex-col gap-4 border-b border-solid border-[#f1f5f9] bg-gradient-to-r from-[#faf5ff]/50 via-white to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 max-[429px]:px-3.5 max-[429px]:py-3.5';

export const CV_ASSISTANT_ACTIONS_ROW =
  'flex w-full min-w-0 flex-wrap items-center gap-3 max-[429px]:flex-col max-[429px]:gap-2.5 max-[429px]:[&>button]:w-full';

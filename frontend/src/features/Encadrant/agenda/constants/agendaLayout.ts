/** Layout responsive — module Agenda Encadrant. */

export const AGENDA_PAGE_ROOT =
  'mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-5 overflow-x-clip scroll-mt-4 pb-2 font-inter max-[429px]:gap-4 sm:gap-6 sm:pb-4';

export const AGENDA_PAGE_HEADER =
  'flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4';

export const AGENDA_STATS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4';

export const AGENDA_STAT_CARD =
  'box-border flex h-[114px] w-full min-w-0 flex-col rounded-[14px] border border-solid border-[rgba(0,0,0,0.1)] bg-white text-left font-inter shadow-[0_1px_2px_rgba(16,24,40,0.04)]';

export const AGENDA_SECTION_CARD =
  'box-border flex w-full min-w-0 flex-col gap-4 overflow-hidden rounded-[14px] border border-solid border-[rgba(0,0,0,0.08)] bg-white p-4 font-inter shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:gap-5 sm:p-5 md:p-6';

export const AGENDA_TOOLBAR_ROW =
  'flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between';

export const AGENDA_VIEW_TOGGLE =
  'inline-flex w-full min-w-0 shrink-0 items-center gap-2 sm:w-auto';

export const AGENDA_VIEW_TOGGLE_BTN =
  'inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-solid px-3.5 text-sm font-medium transition-colors sm:h-10 sm:flex-none sm:px-4';

export const AGENDA_VIEW_TOGGLE_BTN_ACTIVE =
  'border-[#030213] bg-[#030213] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]';

export const AGENDA_VIEW_TOGGLE_BTN_INACTIVE =
  'border-[rgba(0,0,0,0.1)] bg-white text-[#171717] hover:bg-[#fafafa]';

export const AGENDA_MONTH_NAV =
  'flex w-full min-w-0 items-center justify-center gap-2 sm:w-auto sm:shrink-0';

export const AGENDA_MONTH_NAV_BTN =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-solid border-[rgba(0,0,0,0.1)] bg-white text-[#171717] transition-colors hover:bg-[#fafafa]';

export const AGENDA_SEARCH_ROW =
  'flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2';

export const AGENDA_SEARCH_WRAP =
  'relative flex min-h-[44px] w-full min-w-0 flex-1 items-center';

export const AGENDA_SEARCH_INPUT =
  'box-border h-11 w-full min-w-0 rounded-[10px] border border-solid border-[rgba(0,0,0,0.08)] bg-white py-2.5 pl-10 pr-4 text-sm font-normal text-[#171717] placeholder:text-[#9ca3af] focus:border-[rgba(0,0,0,0.12)] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/10 sm:h-10';

export const AGENDA_FILTER_BTN =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-solid border-[rgba(0,0,0,0.1)] bg-white text-[#171717] transition-colors hover:bg-[#fafafa] sm:h-10 sm:w-10';

export const AGENDA_WEEK_SCROLL =
  'w-full min-w-0 overflow-x-auto overscroll-x-contain';

export const AGENDA_WEEK_GRID =
  'grid min-w-[640px] grid-cols-7 gap-2 sm:min-w-[720px] sm:gap-3';

export const AGENDA_DAY_COLUMN =
  'flex min-w-[88px] flex-col rounded-[12px] border border-solid border-[rgba(0,0,0,0.06)] bg-[#fafafa] sm:min-w-[100px]';

export const AGENDA_DAY_COLUMN_HIGHLIGHT =
  'border-[#3b82f6] bg-[#eff6ff]';

export const AGENDA_DAY_HEADER =
  'flex items-center justify-between gap-1 border-b border-solid border-[rgba(0,0,0,0.06)] px-2 py-2 sm:px-2.5';

export const AGENDA_DAY_BODY =
  'flex min-h-[120px] flex-col gap-2 p-2 sm:min-h-[140px] sm:p-2.5';

export const AGENDA_ADD_DAY_BTN =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#717182] transition-colors hover:bg-white hover:text-[#171717]';

export const AGENDA_PRIMARY_BTN =
  'inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-[10px] bg-[#0f172a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1e293b] sm:h-11 sm:px-5';

export const AGENDA_LIST =
  'flex w-full min-w-0 flex-col gap-3';

export const AGENDA_LIST_DAY_GROUP =
  'flex w-full min-w-0 flex-col gap-2';

export const AGENDA_EVENT_CARD_BTN =
  'relative box-border flex w-full min-w-0 cursor-pointer flex-col gap-1 rounded-[10px] border border-solid p-2.5 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fff]/30 sm:p-3';

export const AGENDA_MODAL_OVERLAY =
  'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.45)] p-3 backdrop-blur-[2px] sm:p-4';

export const AGENDA_MODAL_PANEL =
  'relative box-border flex max-h-[min(92dvh,720px)] w-full min-w-0 max-w-[560px] flex-col overflow-hidden rounded-[16px] border border-solid border-[rgba(0,0,0,0.08)] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]';

export const AGENDA_MODAL_BODY =
  'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-1 sm:px-6 sm:pb-5';

export const AGENDA_MODAL_DETAILS_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5';

export const AGENDA_MODAL_FOOTER =
  'flex shrink-0 flex-col gap-2 border-t border-solid border-[rgba(0,0,0,0.08)] px-4 py-4 sm:flex-row sm:flex-wrap sm:px-6';

export const AGENDA_MODAL_PRIMARY_ACTION =
  'inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#0f172a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1e293b] sm:flex-none';

export const AGENDA_MODAL_SECONDARY_ACTION =
  'inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-[10px] border border-solid border-[rgba(0,0,0,0.1)] bg-white px-4 text-sm font-medium text-[#171717] transition-colors hover:bg-[#fafafa] sm:flex-none';

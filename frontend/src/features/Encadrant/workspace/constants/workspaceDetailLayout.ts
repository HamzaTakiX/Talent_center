import type { StickyNoteColor } from '../types';

/** Layout responsive — page détail workspace étudiant. */

export const WORKSPACE_DETAIL_PAGE_ROOT =
  'mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-5 overflow-x-clip scroll-mt-4 pb-2 font-inter max-[429px]:gap-4 sm:gap-6 sm:pb-4';

export const WORKSPACE_DETAIL_TOP_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_320px]';

export const WORKSPACE_DETAIL_PANEL =
  'box-border flex w-full min-w-0 flex-col gap-4 overflow-hidden rounded-[14px] border border-solid border-[rgba(0,0,0,0.08)] bg-white p-4 font-inter shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:gap-5 sm:p-5';

export const WORKSPACE_DETAIL_PANEL_TITLE =
  'm-0 text-base font-semibold leading-6 text-[#171717] sm:text-lg';

export const WORKSPACE_DETAIL_BOARD_HEADER =
  'flex w-full min-w-0 flex-wrap items-center justify-between gap-3';

export const WORKSPACE_DETAIL_BOARD_ACTIONS =
  'flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto';

export const WORKSPACE_DETAIL_ADD_NOTE_BTN =
  'inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-[10px] border border-solid border-[rgba(0,0,0,0.1)] bg-white px-4 text-sm font-medium text-[#171717] transition-colors hover:bg-[#fafafa]';

export const WORKSPACE_DETAIL_UPLOAD_BTN =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-solid border-[rgba(0,0,0,0.1)] bg-white text-[#171717] transition-colors hover:bg-[#fafafa]';

export const WORKSPACE_DETAIL_BOARD_AREA =
  'relative box-border min-h-[280px] w-full min-w-0 overflow-hidden rounded-[12px] border-2 border-dashed border-[rgba(0,0,0,0.12)] bg-white p-3 sm:min-h-[340px] md:min-h-[400px] md:p-4';

export const WORKSPACE_DETAIL_STICKY_NOTE =
  'absolute box-border max-w-[min(200px,46%)] rounded-[10px] border border-solid border-[rgba(0,0,0,0.06)] p-3 shadow-[0_2px_8px_rgba(16,24,40,0.08)] sm:max-w-[220px]';

export const WORKSPACE_DETAIL_STICKY_NOTE_TEXT =
  'm-0 pr-4 text-xs font-medium leading-4 text-[#171717] sm:text-sm sm:leading-5';

export const WORKSPACE_DETAIL_STICKY_ICON =
  'absolute left-2.5 top-2.5 text-[#717182]';

export const WORKSPACE_DETAIL_SIDEBAR =
  'flex w-full min-w-0 flex-col gap-5';

export const WORKSPACE_DETAIL_FILE_CARD =
  'box-border flex w-full min-w-0 items-start gap-3 rounded-[10px] border border-solid border-[rgba(0,0,0,0.08)] bg-white p-3 transition-colors hover:bg-[#fafafa] sm:p-3.5';

export const WORKSPACE_DETAIL_FILE_MAIN =
  'min-w-0 flex-1';

export const WORKSPACE_DETAIL_FILE_NAME =
  'm-0 text-sm font-semibold leading-5 text-[#171717]';

export const WORKSPACE_DETAIL_FILE_META =
  'm-0 mt-0.5 text-xs font-normal leading-4 text-[#717182]';

export const WORKSPACE_DETAIL_FILE_UPLOADER =
  'm-0 mt-1 text-xs font-normal leading-4 text-[#9ca3af]';

export const WORKSPACE_DETAIL_DOWNLOAD_BTN =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[#717182] transition-colors hover:bg-[#f4f4f6] hover:text-[#171717]';

export const WORKSPACE_DETAIL_ACTIVITY_LIST =
  'm-0 flex w-full min-w-0 list-none flex-col gap-3 p-0';

export const WORKSPACE_DETAIL_ACTIVITY_ITEM =
  'relative flex min-w-0 flex-col gap-0.5 pl-5';

export const WORKSPACE_DETAIL_ACTIVITY_DOT =
  'absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[#3b82f6]';

export const WORKSPACE_DETAIL_ACTIVITY_ACTION =
  'm-0 text-sm font-medium leading-5 text-[#171717]';

export const WORKSPACE_DETAIL_ACTIVITY_TIME =
  'm-0 text-xs font-normal leading-4 text-[#717182]';

export const WORKSPACE_DETAIL_VIDEO_SECTION =
  'box-border flex w-full min-w-0 flex-col gap-4 overflow-hidden rounded-[14px] border border-solid border-[rgba(0,0,0,0.08)] bg-[#0f172a] p-4 sm:gap-5 sm:p-5 md:p-6';

export const WORKSPACE_DETAIL_VIDEO_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4';

export const WORKSPACE_DETAIL_PARTICIPANT_CARD =
  'relative flex min-h-[180px] w-full min-w-0 flex-col items-center justify-center gap-3 overflow-hidden rounded-[12px] p-6 sm:min-h-[200px]';

export const WORKSPACE_DETAIL_PARTICIPANT_AVATAR =
  'flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-semibold text-white sm:h-20 sm:w-20 sm:text-2xl';

export const WORKSPACE_DETAIL_PARTICIPANT_NAME =
  'm-0 text-sm font-semibold leading-5 text-white sm:text-base';

export const WORKSPACE_DETAIL_SPEAKING_BADGE =
  'inline-flex items-center gap-1.5 rounded-full bg-[#22c55e] px-2.5 py-0.5 text-xs font-medium leading-4 text-white';

export const STICKY_NOTE_COLORS: Record<StickyNoteColor, string> = {
  yellow: 'bg-[#fef9c3] border-[#fde047]',
  blue: 'bg-[#dbeafe] border-[#93c5fd]',
  green: 'bg-[#dcfce7] border-[#86efac]',
  pink: 'bg-[#fce7f3] border-[#f9a8d4]',
  purple: 'bg-[#ede9fe] border-[#c4b5fd]',
};

export const PARTICIPANT_GRADIENT_STUDENT =
  'bg-gradient-to-br from-[#3b82f6] via-[#6366f1] to-[#7c3aed]';

export const PARTICIPANT_GRADIENT_ENCADRANT =
  'bg-gradient-to-br from-[#14b8a6] via-[#0d9488] to-[#065f46]';

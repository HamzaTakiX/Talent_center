/** Layout responsive — module Workspace Encadrant. */

export const WORKSPACE_PAGE_ROOT =
  'mx-auto box-border flex w-full min-w-0 max-w-full flex-col overflow-x-clip font-inter';

export const WORKSPACE_PANEL_ROOT =
  'flex w-full min-w-0 max-w-full flex-col gap-4 overflow-x-clip';

export const WORKSPACE_SURFACE_INNER =
  'flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-hidden';

export const WORKSPACE_TAB_ROOT =
  'flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-hidden';

export const WORKSPACE_PANEL_HEADER =
  'box-border flex w-full min-w-0 max-w-full shrink-0 flex-col gap-3 border-b border-solid border-[var(--admin-border)] px-3 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5';

export const WORKSPACE_PANEL_BODY =
  'box-border flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-x-hidden p-3 sm:p-5';

export const WORKSPACE_WHITEBOARD_CANVAS =
  'relative mt-4 box-border min-h-[min(360px,50vh)] w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] sm:min-h-[min(420px,55vh)]';

export const WORKSPACE_WHITEBOARD_CANVAS_INNER =
  'relative box-border flex min-h-[inherit] w-full min-w-0 max-w-full flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain p-3 sm:block sm:min-h-[min(380px,50vh)] sm:overflow-hidden sm:p-0';

export const WORKSPACE_STICKY_NOTE =
  'relative box-border w-full max-w-full shrink-0 rounded-lg border border-solid p-3 pr-8 shadow-[0_2px_8px_rgba(16,24,40,0.08)] sm:absolute sm:max-w-[min(100%-1.5rem,280px)]';

export const WORKSPACE_DISCUSSION_SCROLL =
  'flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-contain pb-4';

export const WORKSPACE_MESSAGE_BUBBLE =
  'm-0 max-w-full break-words rounded-2xl px-3.5 py-2.5 font-inter text-[13px] leading-5 [overflow-wrap:anywhere] sm:text-[14px]';

export const WORKSPACE_MEETING_ACTIONS_ROW =
  'flex w-full min-w-0 max-w-full flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center';

export const WORKSPACE_MEETING_CARD =
  'box-border flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-[14px] border border-solid border-[#bfdbfe] bg-[var(--admin-bg-elevated)] font-inter shadow-[0_1px_2px_rgba(16,24,40,0.04)]';

export const WORKSPACE_MEETING_HEADER =
  'box-border flex w-full min-w-0 max-w-full flex-col gap-3 border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5';

export const WORKSPACE_MEETING_BODY =
  'box-border flex w-full min-w-0 max-w-full flex-col gap-4 overflow-x-hidden p-4 sm:p-5';

export const WORKSPACE_MEETING_VIDEO_GRID =
  'grid w-full min-w-0 max-w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4';

export const WORKSPACE_MEETING_VIDEO_TILE =
  'relative box-border flex aspect-[4/3] min-h-[180px] w-full min-w-0 max-w-full items-center justify-center overflow-hidden rounded-xl sm:aspect-[16/10] sm:min-h-[200px]';

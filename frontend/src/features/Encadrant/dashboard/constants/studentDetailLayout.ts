/** Layout responsive — page détail étudiant (Dashboard Encadrant). */

import { DASHBOARD_PAGE_ROOT } from './dashboardLayout';

/** Même conteneur pleine largeur que le dashboard principal. */
export const STUDENT_DETAIL_PAGE_ROOT = DASHBOARD_PAGE_ROOT;

/** Contenu page — pleine largeur, sans carte englobante. */
export const STUDENT_DETAIL_CONTENT =
  'box-border flex w-full min-w-0 max-w-full flex-col gap-5 font-inter sm:gap-6 md:gap-8';

export const STUDENT_DETAIL_SECTION =
  'flex w-full min-w-0 max-w-full flex-col gap-3 sm:gap-4';

export const STUDENT_DETAIL_DATES_GRID =
  'grid w-full min-w-0 max-w-full grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5';

export const STUDENT_DETAIL_REPORTS_LIST =
  'flex w-full min-w-0 max-w-full flex-col gap-3';

export const STUDENT_DETAIL_ACTIONS_ROW =
  'flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row sm:gap-4';

export const STUDENT_DETAIL_REPORT_ROW =
  'box-border grid w-full min-w-0 max-w-full grid-cols-1 gap-3 rounded-[12px] border border-solid border-[rgba(0,0,0,0.08)] bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-5';

export const STUDENT_DETAIL_BACK_BUTTON =
  'inline-flex h-9 w-fit max-w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-solid border-[rgba(0,0,0,0.1)] bg-white px-4 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-[#fafafa]';

export const STUDENT_DETAIL_PRIMARY_BUTTON =
  'inline-flex h-11 w-full min-w-0 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#0f172a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1e293b]';

export const STUDENT_DETAIL_SECONDARY_BUTTON =
  'inline-flex h-11 w-full min-w-0 flex-1 items-center justify-center gap-2 rounded-[10px] border border-solid border-[rgba(0,0,0,0.1)] bg-white px-4 text-sm font-medium text-[#171717] transition-colors hover:bg-[#fafafa]';

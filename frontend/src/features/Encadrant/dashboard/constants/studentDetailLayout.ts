/** Layout responsive — page détail étudiant (Dashboard Encadrant). */

import {
  ENC_BTN_OUTLINE,
  ENC_BTN_PRIMARY,
  ENC_PANEL,
} from '../../constants/encadrantTokens';
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

export const STUDENT_DETAIL_REPORT_ROW = `${ENC_PANEL} box-border grid w-full min-w-0 max-w-full grid-cols-1 gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-5`;

export const STUDENT_DETAIL_BACK_BUTTON = `${ENC_BTN_OUTLINE} admin-btn--sm w-fit max-w-full shrink-0 gap-2`;

export const STUDENT_DETAIL_PRIMARY_BUTTON = `${ENC_BTN_PRIMARY} w-full min-w-0 flex-1`;

export const STUDENT_DETAIL_SECONDARY_BUTTON = `${ENC_BTN_OUTLINE} w-full min-w-0 flex-1`;

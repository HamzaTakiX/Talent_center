import type { StickyNoteColor } from '../types';
import {
  ENC_BTN_OUTLINE,
  ENC_ICON_BTN,
  ENC_PAGE,
  ENC_PANEL,
  ENC_SECTION,
  ENC_TEXT,
  ENC_TEXT_MUTED,
} from '../../constants/encadrantTokens';

/** Layout responsive — page détail workspace étudiant. */

export const WORKSPACE_DETAIL_PAGE_ROOT = `${ENC_PAGE} overflow-x-clip font-inter max-[429px]:gap-4`;

export const WORKSPACE_DETAIL_TOP_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_320px]';

export const WORKSPACE_DETAIL_PANEL = `${ENC_SECTION} gap-4 sm:gap-5 sm:p-5 font-inter`;

export const WORKSPACE_DETAIL_PANEL_TITLE = `m-0 text-base font-semibold leading-6 ${ENC_TEXT} sm:text-lg`;

export const WORKSPACE_DETAIL_BOARD_HEADER =
  'flex w-full min-w-0 flex-wrap items-center justify-between gap-3';

export const WORKSPACE_DETAIL_BOARD_ACTIONS =
  'flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto';

export const WORKSPACE_DETAIL_ADD_NOTE_BTN = `${ENC_BTN_OUTLINE} min-w-0`;

export const WORKSPACE_DETAIL_UPLOAD_BTN = ENC_ICON_BTN;

export const WORKSPACE_DETAIL_BOARD_AREA = `${ENC_PANEL} relative box-border min-h-[280px] w-full min-w-0 overflow-hidden border-2 border-dashed border-[var(--admin-border)] p-3 sm:min-h-[340px] md:min-h-[400px] md:p-4`;

export const WORKSPACE_DETAIL_STICKY_NOTE =
  'absolute box-border max-w-[min(200px,46%)] rounded-[10px] border border-solid border-[var(--admin-border)] p-3 shadow-[0_2px_8px_color-mix(in_srgb,var(--admin-text)_8%,transparent)] sm:max-w-[220px]';

export const WORKSPACE_DETAIL_STICKY_NOTE_TEXT = `m-0 pr-4 text-xs font-medium leading-4 ${ENC_TEXT} sm:text-sm sm:leading-5`;

export const WORKSPACE_DETAIL_STICKY_ICON =
  'absolute left-2.5 top-2.5 text-[var(--admin-text-muted)]';

export const WORKSPACE_DETAIL_SIDEBAR =
  'flex w-full min-w-0 flex-col gap-5';

export const WORKSPACE_DETAIL_FILE_CARD = `${ENC_PANEL} box-border flex w-full min-w-0 items-start gap-3 p-3 transition-colors hover:bg-[var(--admin-bg-subtle)] sm:p-3.5`;

export const WORKSPACE_DETAIL_FILE_MAIN =
  'min-w-0 flex-1';

export const WORKSPACE_DETAIL_FILE_NAME = `m-0 text-sm font-semibold leading-5 ${ENC_TEXT}`;

export const WORKSPACE_DETAIL_FILE_META = `m-0 mt-0.5 text-xs font-normal leading-4 ${ENC_TEXT_MUTED}`;

export const WORKSPACE_DETAIL_FILE_UPLOADER = `m-0 mt-1 text-xs font-normal leading-4 ${ENC_TEXT_MUTED}`;

export const WORKSPACE_DETAIL_DOWNLOAD_BTN =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-bg-subtle)] hover:text-[var(--admin-text)]';

export const WORKSPACE_DETAIL_ACTIVITY_LIST =
  'm-0 flex w-full min-w-0 list-none flex-col gap-3 p-0';

export const WORKSPACE_DETAIL_ACTIVITY_ITEM =
  'relative flex min-w-0 flex-col gap-0.5 pl-5';

export const WORKSPACE_DETAIL_ACTIVITY_DOT =
  'absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[var(--admin-brand)]';

export const WORKSPACE_DETAIL_ACTIVITY_ACTION = `m-0 text-sm font-medium leading-5 ${ENC_TEXT}`;

export const WORKSPACE_DETAIL_ACTIVITY_TIME = `m-0 text-xs font-normal leading-4 ${ENC_TEXT_MUTED}`;

export const WORKSPACE_DETAIL_VIDEO_SECTION =
  'box-border flex w-full min-w-0 flex-col gap-4 overflow-hidden rounded-[14px] border border-solid border-[var(--admin-border)] bg-[var(--admin-text)] p-4 sm:gap-5 sm:p-5 md:p-6';

export const WORKSPACE_DETAIL_VIDEO_GRID =
  'grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4';

export const WORKSPACE_DETAIL_PARTICIPANT_CARD =
  'relative flex min-h-[180px] w-full min-w-0 flex-col items-center justify-center gap-3 overflow-hidden rounded-[12px] p-6 sm:min-h-[200px]';

export const WORKSPACE_DETAIL_PARTICIPANT_AVATAR =
  'flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-semibold text-white sm:h-20 sm:w-20 sm:text-2xl';

export const WORKSPACE_DETAIL_PARTICIPANT_NAME =
  'm-0 text-sm font-semibold leading-5 text-white sm:text-base';

export const WORKSPACE_DETAIL_SPEAKING_BADGE =
  'inline-flex items-center gap-1.5 rounded-full bg-[#059669] px-2.5 py-0.5 text-xs font-medium leading-4 text-white';

export const STICKY_NOTE_COLORS: Record<StickyNoteColor, string> = {
  yellow: 'bg-[color-mix(in_srgb,#eab308_22%,var(--admin-bg-elevated))] border-[color-mix(in_srgb,#eab308_55%,var(--admin-border))]',
  blue: 'bg-[var(--admin-brand-muted)] border-[color-mix(in_srgb,var(--admin-brand)_40%,var(--admin-border))]',
  green: 'bg-[color-mix(in_srgb,#059669_14%,var(--admin-bg-elevated))] border-[color-mix(in_srgb,#059669_40%,var(--admin-border))]',
  pink: 'bg-[color-mix(in_srgb,#db2777_12%,var(--admin-bg-elevated))] border-[color-mix(in_srgb,#db2777_35%,var(--admin-border))]',
  purple: 'bg-[var(--admin-brand-muted)] border-[var(--admin-brand)]',
};

export const PARTICIPANT_GRADIENT_STUDENT =
  'bg-gradient-to-br from-[var(--admin-brand)] via-[color-mix(in_srgb,var(--admin-brand)_70%,#6366f1)] to-[color-mix(in_srgb,var(--admin-brand)_60%,#6366f1)]';

export const PARTICIPANT_GRADIENT_ENCADRANT =
  'bg-gradient-to-br from-[#14b8a6] via-[#0d9488] to-[#065f46]';

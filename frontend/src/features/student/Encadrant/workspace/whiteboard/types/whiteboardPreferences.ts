import type { AppLanguage } from '../../../../../../i18n/types';
import type { AdminTheme } from '../../../../../admin/dashboard/context/AdminThemeContext';

export type WhiteboardBackgroundType =
  | 'solid'
  | 'dotted-grid'
  | 'square-grid'
  | 'graph-paper'
  | 'lined-paper'
  | 'blank';

export interface WhiteboardPreferences {
  theme: AdminTheme;
  backgroundColor: string;
  /** 0–100 — canvas fill opacity */
  backgroundOpacity: number;
  backgroundType: WhiteboardBackgroundType;
  language: AppLanguage;
}

export type WhiteboardBackgroundPresetId =
  | 'white'
  | 'lightGray'
  | 'darkGray'
  | 'navy'
  | 'black'
  | 'beige'
  | 'green'
  | 'blue'
  | 'purple';

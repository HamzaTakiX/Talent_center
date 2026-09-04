import { readStoredAppLanguage } from '../../../../../../i18n/appLanguage';
import type { AppLanguage } from '../../../../../../i18n/types';
import type { AdminTheme } from '../../../../../admin/dashboard/context/AdminThemeContext';
import {
  DEFAULT_WHITEBOARD_PREFERENCES,
  WHITEBOARD_PREFS_STORAGE_PREFIX,
} from '../constants/whiteboardBackground';
import {
  getThemeDefaultBackgroundColor,
  isThemeDefaultBackgroundColor,
} from '../utils/whiteboardCanvasBackground';
import type { WhiteboardBackgroundType, WhiteboardPreferences } from '../types/whiteboardPreferences';
import { clampOpacityPercent, normalizeHex, parseColorInput } from '../utils/whiteboardColorUtils';

const BACKGROUND_TYPES: WhiteboardBackgroundType[] = [
  'solid',
  'dotted-grid',
  'square-grid',
  'graph-paper',
  'lined-paper',
  'blank',
];

function storageKey(userId: number | string): string {
  return `${WHITEBOARD_PREFS_STORAGE_PREFIX}:${userId}`;
}

function parseTheme(value: unknown, fallback: AdminTheme): AdminTheme {
  return value === 'light' || value === 'dark' ? value : fallback;
}

function parseBackgroundType(value: unknown): WhiteboardBackgroundType {
  if (typeof value === 'string' && BACKGROUND_TYPES.includes(value as WhiteboardBackgroundType)) {
    return value as WhiteboardBackgroundType;
  }
  return DEFAULT_WHITEBOARD_PREFERENCES.backgroundType;
}

function parseLanguage(value: unknown): AppLanguage {
  if (value === 'fr' || value === 'en' || value === 'ar') return value;
  return readStoredAppLanguage();
}

export function loadWhiteboardPreferences(
  userId: number | string,
  globalTheme: AdminTheme,
): WhiteboardPreferences {
  const fallback: WhiteboardPreferences = {
    ...DEFAULT_WHITEBOARD_PREFERENCES,
    theme: globalTheme,
    backgroundColor: getThemeDefaultBackgroundColor(globalTheme),
    language: readStoredAppLanguage(),
  };

  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<WhiteboardPreferences>;
    let color =
      parseColorInput(String(parsed.backgroundColor ?? '')) ??
      normalizeHex(String(parsed.backgroundColor ?? '')) ??
      getThemeDefaultBackgroundColor(globalTheme);

    if (isThemeDefaultBackgroundColor(color)) {
      color = getThemeDefaultBackgroundColor(globalTheme);
    }

    const opacity =
      typeof parsed.backgroundOpacity === 'number'
        ? clampOpacityPercent(parsed.backgroundOpacity)
        : DEFAULT_WHITEBOARD_PREFERENCES.backgroundOpacity;

    return {
      theme: parseTheme(parsed.theme, globalTheme),
      backgroundColor: color,
      backgroundOpacity: opacity,
      backgroundType: parseBackgroundType(parsed.backgroundType),
      language: parseLanguage(parsed.language),
    };
  } catch {
    return fallback;
  }
}

export function saveWhiteboardPreferences(
  userId: number | string,
  prefs: WhiteboardPreferences,
): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(prefs));
  } catch {
    /* ignore quota */
  }
}

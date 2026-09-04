import { useCallback, useEffect, useRef, useState } from 'react';

import { persistAppLanguage, readStoredAppLanguage } from '../../../../../../i18n/appLanguage';
import type { AppLanguage } from '../../../../../../i18n/types';
import { useAdminTheme } from '../../../../../admin/dashboard/context/AdminThemeContext';
import type { AdminTheme } from '../../../../../admin/dashboard/context/AdminThemeContext';
import { useAuth } from '../../../../../auth/hooks/useAuth';
import { readCachedAuthUser } from '../../../../../auth/utils/authSessionCache';
import {
  loadWhiteboardPreferences,
  saveWhiteboardPreferences,
} from '../data/whiteboardPreferencesStorage';
import type { WhiteboardBackgroundType, WhiteboardPreferences } from '../types/whiteboardPreferences';
import {
  getThemeDefaultBackgroundColor,
  isThemeDefaultBackgroundColor,
} from '../utils/whiteboardCanvasBackground';
import { normalizeHex, parseColorInput } from '../utils/whiteboardColorUtils';

function resolveUserId(authUserId: number | undefined): number | string {
  if (authUserId != null) return authUserId;
  return readCachedAuthUser()?.id ?? 'guest';
}

export function useWhiteboardPreferences() {
  const { user } = useAuth();
  const { theme: globalTheme, setTheme } = useAdminTheme();
  const userId = resolveUserId(user?.id);
  const hydratedRef = useRef(false);

  const [prefs, setPrefs] = useState<WhiteboardPreferences>(() =>
    loadWhiteboardPreferences(userId, globalTheme),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const stored = loadWhiteboardPreferences(userId, globalTheme);
    setPrefs((prev) => ({
      ...stored,
      theme: globalTheme,
    }));
    const currentLang = readStoredAppLanguage();
    if (stored.language !== currentLang) {
      void persistAppLanguage(stored.language);
    }
  }, [userId, globalTheme]);

  useEffect(() => {
    setPrefs((prev) => {
      if (prev.theme === globalTheme) return prev;
      const backgroundColor = isThemeDefaultBackgroundColor(prev.backgroundColor)
        ? getThemeDefaultBackgroundColor(globalTheme)
        : prev.backgroundColor;
      return { ...prev, theme: globalTheme, backgroundColor };
    });
  }, [globalTheme]);

  const persist = useCallback(
    (updater: (prev: WhiteboardPreferences) => WhiteboardPreferences) => {
      setPrefs((prev) => {
        const next = updater(prev);
        saveWhiteboardPreferences(userId, next);
        return next;
      });
    },
    [userId],
  );

  const setThemePreference = useCallback(
    (nextTheme: AdminTheme) => {
      setTheme(nextTheme);
      persist((prev) => ({
        ...prev,
        theme: nextTheme,
        backgroundColor: isThemeDefaultBackgroundColor(prev.backgroundColor)
          ? getThemeDefaultBackgroundColor(nextTheme)
          : prev.backgroundColor,
      }));
    },
    [persist, setTheme],
  );

  const toggleTheme = useCallback(() => {
    setThemePreference(globalTheme === 'light' ? 'dark' : 'light');
  }, [globalTheme, setThemePreference]);

  const setBackgroundColor = useCallback(
    (input: string) => {
      const hex = parseColorInput(input) ?? normalizeHex(input);
      if (!hex) return;
      persist((prev) => ({ ...prev, backgroundColor: hex }));
    },
    [persist],
  );

  const setBackgroundAppearance = useCallback(
    (color: string, opacity: number) => {
      const hex = parseColorInput(color) ?? normalizeHex(color);
      if (!hex) return;
      persist((prev) => ({
        ...prev,
        backgroundColor: hex,
        backgroundOpacity: Math.max(0, Math.min(100, Math.round(opacity))),
      }));
    },
    [persist],
  );

  const setBackgroundType = useCallback(
    (backgroundType: WhiteboardBackgroundType) => {
      persist((prev) => ({ ...prev, backgroundType }));
    },
    [persist],
  );

  const setLanguage = useCallback(
    (language: AppLanguage) => {
      persist((prev) => {
        if (prev.language === language) return prev;
        void persistAppLanguage(language);
        return { ...prev, language };
      });
    },
    [persist],
  );

  return {
    theme: globalTheme,
    prefs,
    settingsOpen,
    setSettingsOpen,
    setThemePreference,
    toggleTheme,
    setBackgroundColor,
    setBackgroundAppearance,
    setBackgroundType,
    setLanguage,
  };
}

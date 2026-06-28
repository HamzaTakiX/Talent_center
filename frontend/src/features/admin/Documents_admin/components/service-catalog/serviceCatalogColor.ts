import type { CSSProperties } from 'react';
import { COLOR_THEME_OPTIONS } from './serviceCatalogStudioSteps';

const PRESET_THEME_COLORS: Record<string, string> = {
  brand: 'var(--admin-brand)',
  blue: '#6b9bd1',
  navy: '#5258a0',
  cyan: '#4ba3c7',
  violet: '#6b6fa8',
  slate: '#64789b',
  emerald: '#059669',
  amber: '#d97706',
};

export const DEFAULT_CUSTOM_COLOR = '#4a7bb8';

export function isCustomServiceColor(colorTheme: string | undefined): boolean {
  return Boolean(colorTheme && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(colorTheme));
}

export function isPresetServiceColor(colorTheme: string | undefined): colorTheme is (typeof COLOR_THEME_OPTIONS)[number] {
  return Boolean(colorTheme && (COLOR_THEME_OPTIONS as readonly string[]).includes(colorTheme));
}

export function resolveServiceAccentColor(colorTheme: string | undefined): string {
  if (!colorTheme) return PRESET_THEME_COLORS.brand;
  if (isCustomServiceColor(colorTheme)) return colorTheme;
  return PRESET_THEME_COLORS[colorTheme] ?? PRESET_THEME_COLORS.brand;
}

export function serviceAccentStyle(colorTheme: string | undefined): CSSProperties | undefined {
  const accent = resolveServiceAccentColor(colorTheme);
  if (!isCustomServiceColor(colorTheme)) return undefined;
  return {
    color: accent,
    background: `color-mix(in srgb, ${accent} 16%, transparent)`,
  };
}

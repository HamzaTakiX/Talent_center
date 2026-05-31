import { DEFAULT_WHITEBOARD_BACKGROUND } from '../constants/whiteboardBackground';

const HEX_SHORT = /^#?([0-9a-f]{3})$/i;
const HEX_FULL = /^#?([0-9a-f]{6})$/i;
const RGB_PATTERN =
  /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+\s*)?\)$/i;
const HSL_PATTERN =
  /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?(?:\s*,\s*[\d.]+\s*)?\)$/i;

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function expandShortHex(short: string): string {
  const c = short.toLowerCase();
  return `#${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`;
}

export function normalizeHex(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const full = trimmed.match(HEX_FULL);
  if (full) return `#${full[1].toLowerCase()}`;

  const short = trimmed.match(HEX_SHORT);
  if (short) return expandShortHex(short[1]);

  return null;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const raw = normalized.slice(1);
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => clampByte(n).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = Math.max(0, Math.min(100, s)) / 100;
  const ll = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (hh < 60) {
    r = c;
    g = x;
  } else if (hh < 120) {
    r = x;
    g = c;
  } else if (hh < 180) {
    g = c;
    b = x;
  } else if (hh < 240) {
    g = x;
    b = c;
  } else if (hh < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/** Accepts #hex, rgb(), or hsl() and returns normalized #rrggbb. */
export function parseColorInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const hex = normalizeHex(trimmed);
  if (hex) return hex;

  const rgbMatch = trimmed.match(RGB_PATTERN);
  if (rgbMatch) {
    return rgbToHex(
      Number(rgbMatch[1]),
      Number(rgbMatch[2]),
      Number(rgbMatch[3]),
    );
  }

  const hslMatch = trimmed.match(HSL_PATTERN);
  if (hslMatch) {
    return hslToHex(Number(hslMatch[1]), Number(hslMatch[2]), Number(hslMatch[3]));
  }

  return null;
}

export function formatRgbString(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'rgb(255, 255, 255)';
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function formatHslString(hex: string): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return 'hsl(0, 0%, 100%)';
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  const s = max === 0 ? 0 : d / max;
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(max * 100),
  };
}

export function hsvToHex(h: number, s: number, v: number): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = Math.max(0, Math.min(100, s)) / 100;
  const vv = Math.max(0, Math.min(100, v)) / 100;
  const c = vv * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = vv - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 60) {
    r = c;
    g = x;
  } else if (hh < 120) {
    r = x;
    g = c;
  } else if (hh < 180) {
    g = c;
    b = x;
  } else if (hh < 240) {
    g = x;
    b = c;
  } else if (hh < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

export function clampOpacityPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function formatRgbaString(hex: string, opacityPercent: number): string {
  const rgb = hexToRgb(hex);
  const alpha = clampOpacityPercent(opacityPercent) / 100;
  if (!rgb) return `rgba(255, 255, 255, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** CSS color for the canvas layer (hex when opaque, rgba otherwise). */
export function resolveCanvasBackgroundColor(hex: string, opacityPercent: number): string {
  const normalized = normalizeHex(hex) ?? DEFAULT_WHITEBOARD_BACKGROUND;
  if (clampOpacityPercent(opacityPercent) >= 100) return normalized;
  return formatRgbaString(normalized, opacityPercent);
}

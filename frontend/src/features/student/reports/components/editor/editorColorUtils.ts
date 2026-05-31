export function normalizeHex(color: string): string {
  const trimmed = color.trim();
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    const [, r, g, b] = trimmed.match(/^#(.)(.)(.)$/i)!;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed.toLowerCase();
  return trimmed;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function parseColorInput(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^#[0-9a-f]{3,8}$/i.test(v)) return normalizeHex(v.slice(0, 7));
  const rgbMatch = v.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (rgbMatch) {
    const [, rs, gs, bs] = rgbMatch;
    return rgbToHex(
      Math.min(255, Number(rs)),
      Math.min(255, Number(gs)),
      Math.min(255, Number(bs)),
    );
  }
  return null;
}

export function rgbToHexFromComputed(color: string): string | null {
  if (color.startsWith('#')) return normalizeHex(color);
  const match = color.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return null;
  return rgbToHex(Number(match[1]), Number(match[2]), Number(match[3]));
}

export function colorsMatch(a: string, b: string): boolean {
  const parsedA = parseColorInput(a) ?? rgbToHexFromComputed(a);
  const parsedB = parseColorInput(b) ?? rgbToHexFromComputed(b);
  if (!parsedA || !parsedB) return a === b;
  return parsedA === parsedB;
}

export { resolveFontFamilyValue } from './editorFontUtils';

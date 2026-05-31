import { FONT_FAMILY_PRESETS, type FontFamilyPreset } from './editorConstants';

export function resolveFontFamilyLabel(family: string): string {
  const resolved = resolveFontFamilyValue(family);
  return FONT_FAMILY_PRESETS.find((p) => p.value === resolved)?.label ?? resolved.split(',')[0]?.replace(/['"]/g, '').trim() ?? 'Inter';
}

export function resolveFontFamilyValue(family: string): string {
  if (!family) return FONT_FAMILY_PRESETS[0].value;

  const normalized = family.toLowerCase().replace(/['"]/g, '');

  const exact = FONT_FAMILY_PRESETS.find(
    (preset) => preset.value.toLowerCase() === family.toLowerCase(),
  );
  if (exact) return exact.value;

  const byLabel = FONT_FAMILY_PRESETS.find((preset) =>
    normalized.includes(preset.label.toLowerCase()),
  );
  if (byLabel) return byLabel.value;

  const firstToken = family.split(',')[0]?.trim().replace(/['"]/g, '').toLowerCase();
  const byFirst = FONT_FAMILY_PRESETS.find(
    (preset) => preset.label.toLowerCase() === firstToken,
  );
  if (byFirst) return byFirst.value;

  return family;
}

export function filterFontFamilyPresets(query: string): FontFamilyPreset[] {
  const q = query.trim().toLowerCase();
  if (!q) return FONT_FAMILY_PRESETS;
  return FONT_FAMILY_PRESETS.filter(
    (preset) =>
      preset.label.toLowerCase().includes(q) ||
      preset.value.toLowerCase().includes(q),
  );
}

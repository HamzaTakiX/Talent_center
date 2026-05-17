import type { AdminChartLegendItem } from './types';

/** Tones alignés sur les cartes KPI (accent + fond teinté). */
const COLOR_META: Record<string, { accent: string; accentBg: string }> = {
  '#2563eb': { accent: 'var(--admin-brand)', accentBg: 'var(--admin-brand-muted)' },
  '#60a5fa': { accent: '#3b82f6', accentBg: 'color-mix(in srgb, #3b82f6 14%, var(--admin-bg-elevated))' },
  '#16a34a': { accent: '#16a34a', accentBg: 'color-mix(in srgb, #16a34a 14%, var(--admin-bg-elevated))' },
  '#d97706': { accent: '#d97706', accentBg: 'color-mix(in srgb, #d97706 14%, var(--admin-bg-elevated))' },
  '#dc2626': { accent: '#dc2626', accentBg: 'color-mix(in srgb, #dc2626 14%, var(--admin-bg-elevated))' },
  '#7c3aed': { accent: '#7c3aed', accentBg: 'color-mix(in srgb, #7c3aed 14%, var(--admin-bg-elevated))' },
  '#64748b': { accent: '#64748b', accentBg: 'color-mix(in srgb, #64748b 12%, var(--admin-bg-elevated))' },
  '#0891b2': { accent: '#0891b2', accentBg: 'color-mix(in srgb, #0891b2 14%, var(--admin-bg-elevated))' },
  '#06b6d4': { accent: '#06b6d4', accentBg: 'color-mix(in srgb, #06b6d4 14%, var(--admin-bg-elevated))' },
  '#eab308': { accent: '#ca8a04', accentBg: 'color-mix(in srgb, #eab308 14%, var(--admin-bg-elevated))' },
  '#8b5cf6': { accent: '#7c3aed', accentBg: 'color-mix(in srgb, #8b5cf6 14%, var(--admin-bg-elevated))' },
  '#4f46e5': { accent: '#4f46e5', accentBg: 'rgba(79, 70, 229, 0.1)' },
  '#ea580c': { accent: '#ea580c', accentBg: 'rgba(234, 88, 12, 0.1)' },
  '#e11d48': { accent: '#e11d48', accentBg: 'rgba(225, 29, 72, 0.1)' },
  '#059669': { accent: '#059669', accentBg: 'rgba(5, 150, 105, 0.1)' },
};

function metaForColor(color: string) {
  return (
    COLOR_META[color] ?? {
      accent: color,
      accentBg: `color-mix(in srgb, ${color} 14%, var(--admin-bg-elevated))`,
    }
  );
}

export function legendFromSeries(
  series: { key: string; label: string; color: string }[]
): AdminChartLegendItem[] {
  return series.map((s) => {
    const tone = metaForColor(s.color);
    return { key: s.key, label: s.label, color: s.color, accent: tone.accent, accentBg: tone.accentBg };
  });
}

export function legendFromDonut(
  segments: { key: string; label: string; value: number; color: string }[]
): AdminChartLegendItem[] {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return segments.map((s) => {
    const tone = metaForColor(s.color);
    const percent = total > 0 ? Math.round((s.value / total) * 100) : 0;
    return {
      key: s.key,
      label: s.label,
      color: s.color,
      accent: tone.accent,
      accentBg: tone.accentBg,
      value: `${percent}%`,
    };
  });
}

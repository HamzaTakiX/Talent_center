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
  /* Documents analytics — enterprise blue palette */
  '#6b9bd1': { accent: '#5a8ac4', accentBg: 'color-mix(in srgb, #6b9bd1 12%, var(--admin-bg-elevated))' },
  '#6d8fc4': { accent: '#5d7fb5', accentBg: 'color-mix(in srgb, #6d8fc4 12%, var(--admin-bg-elevated))' },
  '#5b6fd6': { accent: '#4a5fc4', accentBg: 'color-mix(in srgb, #5b6fd6 12%, var(--admin-bg-elevated))' },
  '#7a8bb8': { accent: '#6a7ba8', accentBg: 'color-mix(in srgb, #7a8bb8 12%, var(--admin-bg-elevated))' },
  '#5f7ec8': { accent: '#4f6eb8', accentBg: 'color-mix(in srgb, #5f7ec8 12%, var(--admin-bg-elevated))' },
  '#4a72c4': { accent: '#3a62b4', accentBg: 'color-mix(in srgb, #4a72c4 12%, var(--admin-bg-elevated))' },
  '#4ba3c7': { accent: '#3a93b7', accentBg: 'color-mix(in srgb, #4ba3c7 12%, var(--admin-bg-elevated))' },
  '#5258a0': { accent: '#454a8a', accentBg: 'color-mix(in srgb, #5258a0 12%, var(--admin-bg-elevated))' },
  '#9a7080': { accent: '#8a6070', accentBg: 'color-mix(in srgb, #9a7080 11%, var(--admin-bg-elevated))' },
  '#8b95a8': { accent: '#7a8498', accentBg: 'color-mix(in srgb, #8b95a8 11%, var(--admin-bg-elevated))' },
  '#8a9bc4': { accent: '#7a8bb4', accentBg: 'color-mix(in srgb, #8a9bc4 12%, var(--admin-bg-elevated))' },
  '#6b6fa8': { accent: '#5b5f98', accentBg: 'color-mix(in srgb, #6b6fa8 12%, var(--admin-bg-elevated))' },
  '#64789b': { accent: '#556888', accentBg: 'color-mix(in srgb, #64789b 11%, var(--admin-bg-elevated))' },
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
  segments: { key: string; label: string; value: number; color: string }[],
  totalRef?: number,
): AdminChartLegendItem[] {
  const segmentSum = segments.reduce((sum, s) => sum + s.value, 0);
  const total = totalRef ?? segmentSum;
  return segments.map((s) => {
    const tone = metaForColor(s.color);
    const percent = total > 0 ? Math.round((s.value / total) * 100) : 0;
    const valueText =
      totalRef != null && totalRef !== segmentSum
        ? `${s.value} · ${percent}%`
        : `${s.value} (${percent}%)`;
    return {
      key: s.key,
      label: s.label,
      color: s.color,
      accent: tone.accent,
      accentBg: tone.accentBg,
      value: valueText,
    };
  });
}

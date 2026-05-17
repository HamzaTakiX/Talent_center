import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { STAT_PAGE_CHARTS, type StatChartConfig } from '../ui/charts/statPageChartData';
import type { StatPageChartId } from '../ui/charts/types';

function translateChartConfig(
  chartId: StatPageChartId,
  base: StatChartConfig,
  t: (key: string, opts?: { defaultValue?: string }) => string
): StatChartConfig {
  const prefix = `admin.charts.${chartId}`;
  return {
    ...base,
    title: t(`${prefix}.title`, { defaultValue: base.title }),
    subtitle: t(`${prefix}.subtitle`, { defaultValue: base.subtitle }),
    ariaLabel: t(`${prefix}.ariaLabel`, { defaultValue: base.ariaLabel }),
    labels: base.labels?.map((lbl, i) =>
      t(`${prefix}.labels.${i}`, { defaultValue: lbl })
    ),
    series: base.series?.map((s) => ({
      ...s,
      label: t(`${prefix}.series.${s.key}`, { defaultValue: s.label }),
    })),
    segments: base.segments?.map((s) => ({
      ...s,
      label: t(`${prefix}.segments.${s.key}`, { defaultValue: s.label }),
    })),
  };
}

export function useTranslatedStatChart(chartId: StatPageChartId): StatChartConfig | null {
  const { t, i18n } = useTranslation();
  const base = STAT_PAGE_CHARTS[chartId];

  return useMemo(() => {
    if (!base) return null;
    return translateChartConfig(chartId, base, t);
  }, [chartId, base, t, i18n.language]);
}

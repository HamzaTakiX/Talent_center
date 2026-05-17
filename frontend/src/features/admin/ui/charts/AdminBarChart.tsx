import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { easePremium } from '../../dashboard/ui/animations';
import AdminChartPanel from './AdminChartPanel';
import { legendFromSeries } from './chartPalette';
import { computeMax } from './chartMath';
import type { AdminBarChartProps } from './types';
import { CHART_PADDING, CHART_WIDTH, useAdminChartHeight } from './useAdminChartHeight';

const AdminBarChart: FunctionComponent<AdminBarChartProps> = ({
  labels,
  series,
  max: maxProp,
  stacked = false,
  ariaLabel,
}) => {
  const height = useAdminChartHeight();
  const max = maxProp ?? computeMax(series.map((s) => s.values));

  const legend = legendFromSeries(series);
  const groupCount = labels.length;
  const seriesCount = series.length;
  const innerW = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const innerH = height - CHART_PADDING.top - CHART_PADDING.bottom;
  const groupW = innerW / Math.max(groupCount, 1);
  const barGap = 3;
  const barMaxRatio = 0.34;
  const barW = Math.min(
    22,
    stacked
      ? groupW * barMaxRatio
      : (groupW * barMaxRatio - barGap * (seriesCount - 1)) / Math.max(seriesCount, 1)
  );

  const bars = useMemo(() => {
    const items: {
      key: string;
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      delay: number;
    }[] = [];

    labels.forEach((label, gi) => {
      const groupStart = CHART_PADDING.left + gi * groupW;
      const clusterW = stacked
        ? barW
        : seriesCount * barW + Math.max(0, seriesCount - 1) * barGap;
      const groupX = groupStart + (groupW - clusterW) / 2;
      let stackBase = CHART_PADDING.top + innerH;

      series.forEach((s, si) => {
        const value = s.values[gi] ?? 0;
        const h = (value / max) * innerH;
        const x = stacked ? groupX : groupX + si * (barW + barGap);
        const y = stacked ? stackBase - h : CHART_PADDING.top + innerH - h;
        if (stacked) stackBase -= h;

        items.push({
          key: `${label}-${s.key}`,
          x,
          y,
          w: barW,
          h,
          color: s.color,
          delay: gi * 0.05 + si * 0.08,
        });
      });
    });

    return items;
  }, [labels, series, max, innerH, groupW, barW, stacked]);

  const yTicks = [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0];

  return (
    <AdminChartPanel legend={legend} ariaLabel={ariaLabel}>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${height}`} className="h-auto w-full" preserveAspectRatio="xMidYMid meet">
        {yTicks.map((tick) => {
          const y = CHART_PADDING.top + innerH - (tick / max) * innerH;
          return (
            <g key={tick}>
              <line
                x1={CHART_PADDING.left}
                y1={y}
                x2={CHART_WIDTH - CHART_PADDING.right}
                y2={y}
                stroke="var(--admin-border)"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text x={CHART_PADDING.left - 8} y={y + 4} textAnchor="end" className="fill-[var(--admin-text-muted)] text-[10px]">
                {tick}
              </text>
            </g>
          );
        })}

        {bars.map((bar) => (
          <motion.rect
            key={bar.key}
            x={bar.x}
            width={bar.w}
            rx={3}
            fill={bar.color}
            opacity={0.92}
            initial={{ y: CHART_PADDING.top + innerH, height: 0 }}
            animate={{ y: bar.y, height: Math.max(bar.h, 0) }}
            transition={{ duration: 0.55, delay: bar.delay, ease: easePremium }}
          />
        ))}

        {labels.map((label, i) => (
          <text
            key={label}
            x={CHART_PADDING.left + i * groupW + groupW / 2}
            y={height - 8}
            textAnchor="middle"
            className="fill-[var(--admin-text-muted)] text-[10px] font-medium sm:text-[11px]"
          >
            {label}
          </text>
        ))}
      </svg>
    </AdminChartPanel>
  );
};

export default AdminBarChart;

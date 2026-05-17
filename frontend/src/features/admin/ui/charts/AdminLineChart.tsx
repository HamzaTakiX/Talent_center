import { FunctionComponent, useId, useMemo } from 'react';
import { motion } from 'framer-motion';
import { easePremium } from '../../dashboard/ui/animations';
import AdminChartPanel from './AdminChartPanel';
import { legendFromSeries } from './chartPalette';
import { areaPath, computeMax, linePath } from './chartMath';
import type { AdminLineChartProps } from './types';
import { CHART_PADDING, CHART_WIDTH, useAdminChartHeight } from './useAdminChartHeight';

const AdminLineChart: FunctionComponent<AdminLineChartProps> = ({
  labels,
  series,
  max: maxProp,
  showArea = true,
  ariaLabel,
}) => {
  const height = useAdminChartHeight();
  const gradientId = useId();
  const max = maxProp ?? computeMax(series.map((s) => s.values));
  const legend = legendFromSeries(series);

  const paths = useMemo(
    () =>
      series.map((s) => ({
        ...s,
        line: linePath(s.values, CHART_WIDTH, height, max),
        area: areaPath(s.values, CHART_WIDTH, height, max),
      })),
    [series, height, max]
  );

  const labelStep =
    (CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right) / Math.max(labels.length - 1, 1);
  const innerH = height - CHART_PADDING.top - CHART_PADDING.bottom;
  const yTicks = [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0];

  return (
    <AdminChartPanel legend={legend} ariaLabel={ariaLabel}>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${height}`} className="h-auto w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={series[0]?.color ?? '#2563eb'} stopOpacity="0.2" />
            <stop offset="100%" stopColor={series[0]?.color ?? '#2563eb'} stopOpacity="0" />
          </linearGradient>
        </defs>

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

        {showArea && paths[0] ? (
          <motion.path
            d={paths[0].area}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: easePremium }}
          />
        ) : null}

        {paths.map((s, index) => (
          <motion.g key={s.key}>
            <motion.path
              d={s.line}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.5 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.75, delay: index * 0.1, ease: easePremium }}
            />
          </motion.g>
        ))}

        {labels.map((label, index) => (
          <text
            key={label}
            x={CHART_PADDING.left + index * labelStep}
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

export default AdminLineChart;

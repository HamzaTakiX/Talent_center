import { FunctionComponent, useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ENGAGEMENT_CHART_MAX,
  engagementChartLabels,
  engagementChartSeries,
} from '../data/engagementMetricsChartMock';
import { easePremium } from '../../../../dashboard/ui/animations';
import AdminChartLegend from '../../../../ui/charts/AdminChartLegend';
import { legendFromSeries } from '../../../../ui/charts/chartPalette';

const CHART_HEIGHT_DESKTOP = 148;
const CHART_HEIGHT_MOBILE = 124;
const PADDING = { top: 12, right: 8, bottom: 28, left: 36 };

const useChartHeight = () => {
  const [height, setHeight] = useState(CHART_HEIGHT_DESKTOP);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setHeight(mq.matches ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return height;
};

function seriesPath(
  values: number[],
  width: number,
  height: number,
  max: number
): string {
  const innerW = width - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;
  const stepX = values.length > 1 ? innerW / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = PADDING.left + index * stepX;
      const y = PADDING.top + innerH - (Math.min(value, max) / max) * innerH;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function seriesAreaPath(
  values: number[],
  width: number,
  height: number,
  max: number
): string {
  const line = seriesPath(values, width, height, max);
  const innerW = width - PADDING.left - PADDING.right;
  const baseY = height - PADDING.bottom;
  const lastX = PADDING.left + (values.length - 1) * (values.length > 1 ? innerW / (values.length - 1) : 0);
  return `${line} L ${lastX.toFixed(1)} ${baseY} L ${PADDING.left} ${baseY} Z`;
}

const EngagementMetricsChart: FunctionComponent = () => {
  const chartHeight = useChartHeight();
  const gradientId = useId();
  const chartWidth = 520;
  const yTicks = [100, 75, 50, 25, 0];

  const primarySeries = engagementChartSeries[0];

  const paths = useMemo(
    () =>
      engagementChartSeries.map((series) => ({
        ...series,
        line: seriesPath(series.values, chartWidth, chartHeight, ENGAGEMENT_CHART_MAX),
        area: seriesAreaPath(series.values, chartWidth, chartHeight, ENGAGEMENT_CHART_MAX),
      })),
    [chartHeight]
  );

  const labelStep =
    (chartWidth - PADDING.left - PADDING.right) /
    Math.max(engagementChartLabels.length - 1, 1);

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easePremium }}
      >
        <AdminChartLegend items={legendFromSeries(engagementChartSeries)} />
      </motion.div>

      <motion.div
        className="admin-chart-inset overflow-x-auto overscroll-x-contain rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3 sm:p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: easePremium }}
      >
        <motion.div
          className="w-full min-w-[220px] sm:min-w-[360px]"
          role="img"
          aria-label="Engagement trends chart showing activity score, participation rate, and weekly active users over seven months"
        >
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-auto w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primarySeries.color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={primarySeries.color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => {
              const innerH = chartHeight - PADDING.top - PADDING.bottom;
              const y = PADDING.top + innerH - (tick / ENGAGEMENT_CHART_MAX) * innerH;
              return (
                <g key={tick}>
                  <line
                    x1={PADDING.left}
                    y1={y}
                    x2={chartWidth - PADDING.right}
                    y2={y}
                    stroke="var(--admin-border)"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                  <text
                    x={PADDING.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-[var(--admin-text-muted)] text-[10px]"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            <motion.path
              d={paths[0]?.area}
              fill={`url(#${gradientId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: easePremium }}
            />

            {paths.map((series, index) => (
              <motion.g key={series.key}>
                <motion.path
                  d={series.line}
                  fill="none"
                  stroke={series.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0.6 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 0.85,
                    delay: index * 0.12,
                    ease: easePremium,
                  }}
                />
                {series.values.map((value, pointIndex) => {
                  const x = PADDING.left + pointIndex * labelStep;
                  const innerH = chartHeight - PADDING.top - PADDING.bottom;
                  const y =
                    PADDING.top +
                    innerH -
                    (Math.min(value, ENGAGEMENT_CHART_MAX) / ENGAGEMENT_CHART_MAX) * innerH;
                  return (
                    <motion.circle
                      key={`${series.key}-${pointIndex}`}
                      cx={x}
                      cy={y}
                      r={3.5}
                      fill="var(--admin-bg-elevated)"
                      stroke={series.color}
                      strokeWidth={2}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.25,
                        delay: 0.5 + index * 0.12 + pointIndex * 0.04,
                        ease: easePremium,
                      }}
                    />
                  );
                })}
              </motion.g>
            ))}

            {engagementChartLabels.map((label, index) => {
              const x = PADDING.left + index * labelStep;
              return (
                <text
                  key={label}
                  x={x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className="fill-[var(--admin-text-muted)] text-[10px] font-medium sm:text-[11px]"
                >
                  {label}
                </text>
              );
            })}
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EngagementMetricsChart;

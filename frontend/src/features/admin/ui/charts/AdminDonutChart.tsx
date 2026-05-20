import { FunctionComponent, useId, useMemo } from 'react';
import { motion } from 'framer-motion';
import { easePremium } from '../../dashboard/ui/animations';
import AdminChartPanel from './AdminChartPanel';
import { legendFromDonut } from './chartPalette';
import type { AdminDonutChartProps } from './types';

const DEFAULT_SIZE = 160;
const REFINED_SIZE = 188;
const DEFAULT_STROKE = 12;
const REFINED_STROKE = 9;
const SEGMENT_GAP_DEG = 2.25;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  if (endAngle - startAngle <= 0.01) return '';
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

function lightenHex(hex: string, mixRatio = 0.22): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return hex;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  const mix = (c: number) => Math.min(255, Math.round(c + (255 - c) * mixRatio));
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

const AdminDonutChart: FunctionComponent<AdminDonutChartProps> = ({
  segments,
  ariaLabel,
  centerTotal,
  centerCaption = 'total',
  premiumGradients = false,
}) => {
  const chartUid = useId().replace(/:/g, '');
  const refined = premiumGradients;

  const size = refined ? REFINED_SIZE : DEFAULT_SIZE;
  const stroke = refined ? REFINED_STROKE : DEFAULT_STROKE;
  const cx = size / 2;
  const cy = size / 2;
  const radius = cx - stroke - 8;

  const segmentSum = useMemo(() => segments.reduce((sum, s) => sum + s.value, 0), [segments]);
  const total = centerTotal ?? segmentSum;
  const legend = useMemo(
    () => legendFromDonut(segments, centerTotal),
    [segments, centerTotal],
  );

  const arcs = useMemo(() => {
    const active = segments.filter((s) => s.value > 0);
    const gapTotal = active.length > 1 ? SEGMENT_GAP_DEG * active.length : 0;
    const sweepBudget = 360 - gapTotal;
    let cursor = 0;

    return segments.map((seg, index) => {
      if (seg.value <= 0 || segmentSum <= 0) {
        return { ...seg, path: '', sweep: 0, index };
      }

      const sweep = (seg.value / segmentSum) * sweepBudget;
      const gapBefore = active.length > 1 ? SEGMENT_GAP_DEG / 2 : 0;
      const start = cursor + gapBefore;
      const end = start + sweep;
      cursor = end + gapBefore;

      return {
        ...seg,
        path: arcPath(cx, cy, radius, start, end),
        sweep,
        index,
      };
    });
  }, [segments, segmentSum, cx, cy, radius]);

  const displayClass = refined
    ? 'admin-donut-chart admin-donut-chart--refined h-[156px] w-[156px] sm:h-[176px] sm:w-[176px]'
    : 'admin-donut-chart h-[132px] w-[132px] sm:h-[152px] sm:w-[152px]';

  return (
    <AdminChartPanel legend={legend} ariaLabel={ariaLabel} minWidth="min-w-0">
      <motion.div
        className="admin-donut-chart-wrap flex justify-center py-2"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: easePremium }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className={`${displayClass} shrink-0`}
          shapeRendering="geometricPrecision"
        >
          {refined ? (
            <defs>
              {arcs.map(
                (arc) =>
                  arc.sweep > 0 && (
                    <linearGradient
                      key={`grad-${arc.key}`}
                      id={`${chartUid}-grad-${arc.key}`}
                      gradientUnits="userSpaceOnUse"
                      x1={cx}
                      y1={cy - radius}
                      x2={cx}
                      y2={cy + radius}
                    >
                      <stop offset="0%" stopColor={lightenHex(arc.color, 0.2)} />
                      <stop offset="100%" stopColor={arc.color} />
                    </linearGradient>
                  ),
              )}
            </defs>
          ) : null}

          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            className="admin-donut-chart__track"
            strokeWidth={stroke}
          />

          {arcs.map((arc) =>
            arc.sweep > 0 && arc.path ? (
              <motion.path
                key={arc.key}
                d={arc.path}
                fill="none"
                stroke={refined ? `url(#${chartUid}-grad-${arc.key})` : arc.color}
                strokeWidth={stroke}
                strokeLinecap="butt"
                className="admin-donut-chart__segment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, delay: arc.index * 0.04, ease: easePremium }}
              />
            ) : null,
          )}

          <circle
            cx={cx}
            cy={cy}
            r={Math.max(radius - stroke - 1, 0)}
            className="admin-donut-chart__hub"
          />

          <text
            x={cx}
            y={cy - (refined ? 5 : 4)}
            textAnchor="middle"
            className={`admin-donut-chart__total ${refined ? 'admin-donut-chart__total--refined' : ''}`}
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + (refined ? 14 : 12)}
            textAnchor="middle"
            className="admin-donut-chart__caption"
          >
            {centerCaption}
          </text>
        </svg>
      </motion.div>
    </AdminChartPanel>
  );
};

export default AdminDonutChart;

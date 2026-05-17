import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { easePremium } from '../../dashboard/ui/animations';
import AdminChartPanel from './AdminChartPanel';
import { legendFromDonut } from './chartPalette';
import type { AdminDonutChartProps } from './types';

const SIZE = 152;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 54;
const STROKE = 18;

function arcPath(startAngle: number, endAngle: number): string {
  const start = polar(CX, CY, R, endAngle);
  const end = polar(CX, CY, R, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${large} 0 ${end.x} ${end.y}`;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

const AdminDonutChart: FunctionComponent<AdminDonutChartProps> = ({ segments, ariaLabel }) => {
  const total = useMemo(() => segments.reduce((sum, s) => sum + s.value, 0), [segments]);
  const legend = useMemo(() => legendFromDonut(segments), [segments]);

  const arcs = useMemo(() => {
    let cursor = 0;
    return segments.map((seg, index) => {
      const sweep = total > 0 ? (seg.value / total) * 360 : 0;
      const start = cursor;
      const end = cursor + sweep;
      cursor = end;
      return {
        ...seg,
        path: arcPath(start, end),
        sweep,
        index,
      };
    });
  }, [segments, total]);

  return (
    <AdminChartPanel legend={legend} ariaLabel={ariaLabel} minWidth="min-w-0">
      <motion.div
        className="flex justify-center py-1"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: easePremium }}
      >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-[124px] w-[124px] shrink-0 sm:h-[148px] sm:w-[148px]">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--admin-border)" strokeWidth={STROKE} opacity={0.35} />
          {arcs.map((arc) =>
            arc.sweep > 0 ? (
              <motion.path
                key={arc.key}
                d={arc.path}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.65, delay: arc.index * 0.08, ease: easePremium }}
              />
            ) : null
          )}
          <text x={CX} y={CY - 3} textAnchor="middle" className="fill-[var(--admin-text)] text-[18px] font-semibold">
            {total}
          </text>
          <text x={CX} y={CY + 13} textAnchor="middle" className="fill-[var(--admin-text-muted)] text-[10px]">
            total
          </text>
        </svg>
      </motion.div>
    </AdminChartPanel>
  );
};

export default AdminDonutChart;

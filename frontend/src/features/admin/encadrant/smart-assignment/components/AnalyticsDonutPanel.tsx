import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { easePremium } from '../../../dashboard/ui/animations';

const DONUT_SIZE = 140;
const DONUT_R = 52;
const DONUT_STROKE = 10;

export interface AnalyticsDonutLegendItem {
  key: string;
  label: string;
  color: string;
  percent: number;
}

export interface AnalyticsDonutSegment {
  key: string;
  path: string;
  color: string;
  sweep: number;
  index: number;
}

interface AnalyticsDonutPanelProps {
  title: string;
  ariaLabel: string;
  centerValue: ReactNode;
  centerLabel: string;
  segments: AnalyticsDonutSegment[];
  legend?: AnalyticsDonutLegendItem[];
  className?: string;
}

const AnalyticsDonutPanel: FunctionComponent<AnalyticsDonutPanelProps> = ({
  title,
  ariaLabel,
  centerValue,
  centerLabel,
  segments,
  legend = [],
  className = '',
}) => (
  <div className={`sa-type-analytics-visual sa-type-analytics-stat-card ${className}`.trim()}>
    <div className="sa-type-analytics-visual__inner">
      <p className="sa-type-analytics-stat-card__title">{title}</p>
      <motion.div
        className="sa-type-analytics-donut-wrap"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: easePremium }}
      >
        <svg
          viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
          className="sa-type-analytics-donut-svg"
          role="img"
          aria-label={ariaLabel}
        >
          <circle
            cx={DONUT_SIZE / 2}
            cy={DONUT_SIZE / 2}
            r={DONUT_R}
            fill="none"
            className="sa-type-analytics-donut-track"
            strokeWidth={DONUT_STROKE}
          />
          {segments.map((seg) =>
            seg.sweep > 0 ? (
              <motion.path
                key={seg.key}
                d={seg.path}
                fill="none"
                stroke={seg.color}
                strokeWidth={DONUT_STROKE}
                strokeLinecap="butt"
                className="sa-type-analytics-donut-segment"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.06 + seg.index * 0.07,
                  ease: easePremium,
                }}
              />
            ) : null,
          )}
        </svg>
        <div className="sa-type-analytics-donut-center">
          <div className="sa-type-analytics-donut-center__value">{centerValue}</div>
          <span className="sa-type-analytics-donut-center__label">{centerLabel}</span>
        </div>
      </motion.div>
      {legend.length > 0 ? (
        <ul className="sa-type-analytics-mini-legend sa-type-analytics-stat-card__legend">
          {legend.map((item) => (
            <li key={item.key} className="sa-type-analytics-mini-legend__item">
              <span
                className="sa-type-analytics-mini-legend__dot"
                style={{ background: item.color }}
                aria-hidden
              />
              <span className="sa-type-analytics-mini-legend__label" title={item.label}>
                {item.label}
              </span>
              <span className="sa-type-analytics-mini-legend__pct tabular-nums">{item.percent}%</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  </div>
);

export default AnalyticsDonutPanel;

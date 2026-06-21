import { FunctionComponent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getScoreColorVar, getScoreTone } from '../../utils/cvAnalysisScore';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: FunctionComponent<AnimatedCounterProps> = ({
  value,
  duration = 1200,
  suffix = '',
  className = '',
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * value);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value, duration]);

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
};

interface CircularScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularScoreRing: FunctionComponent<CircularScoreRingProps> = ({
  score,
  maxScore = 100,
  size = 136,
  strokeWidth = 10,
}) => {
  const tone = getScoreTone(score);
  const color = getScoreColorVar(tone);
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const pct = score / maxScore;

  return (
    <div className="sr-cva-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in srgb, var(--admin-border) 60%, transparent)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - pct * c }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="sr-cva-score-ring__value">
        <span className="sr-cva-score-ring__num" style={{ color }}>
          <AnimatedCounter value={score} />
        </span>
        <span className="sr-cva-score-ring__max">/ {maxScore}</span>
      </div>
    </div>
  );
};

interface ScoreProgressBarProps {
  score: number;
  delay?: number;
}

export const ScoreProgressBar: FunctionComponent<ScoreProgressBarProps> = ({ score, delay = 0 }) => {
  const tone = getScoreTone(score);
  const color = getScoreColorVar(tone);

  return (
    <div className="sr-cva-progress" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
      <motion.div
        className="sr-cva-progress__fill"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
};

interface SparklineProps {
  values: number[];
}

export const Sparkline: FunctionComponent<SparklineProps> = ({ values }) => {
  const max = Math.max(...values, 1);

  return (
    <div className="sr-cva-sparkline" aria-hidden>
      {values.map((v, i) => (
        <motion.div
          key={i}
          className="sr-cva-sparkline__bar"
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ duration: 0.5, delay: i * 0.06 }}
        />
      ))}
    </div>
  );
};

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
};

export const fadeUpVariant = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

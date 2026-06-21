import { FunctionComponent, useEffect, useId, useState } from 'react';
import { motion } from 'framer-motion';

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
};

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: FunctionComponent<AnimatedCounterProps> = ({
  value,
  suffix = '',
  className = '',
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
};

interface CircularScoreProps {
  score: number;
  max?: number;
  size?: number;
}

export const CircularScore: FunctionComponent<CircularScoreProps> = ({
  score,
  max = 100,
  size = 144,
}) => {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = score / max;

  return (
    <div className="sr-is-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in srgb, var(--admin-border) 60%, transparent)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--admin-brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - pct * c }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="sr-is-score-ring__center">
        <span className="sr-is-score-ring__num">
          <AnimatedCounter value={score} />
        </span>
        <span className="text-xs text-[var(--admin-text-muted)]">/ {max}</span>
      </div>
    </div>
  );
};

interface TypingTextProps {
  text: string;
  speed?: number;
}

export const TypingText: FunctionComponent<TypingTextProps> = ({ text, speed = 28 }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}>
          |
        </motion.span>
      )}
    </span>
  );
};

interface ScoreBarProps {
  score: number;
  delay?: number;
}

export const ScoreBar: FunctionComponent<ScoreBarProps> = ({ score, delay = 0 }) => (
  <div className="sr-is-progress" role="progressbar" aria-valuenow={score}>
    <motion.div
      className="sr-is-progress__fill"
      initial={{ width: 0 }}
      animate={{ width: `${score}%` }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  </div>
);

interface SparklineProps {
  values: number[];
}

export const Sparkline: FunctionComponent<SparklineProps> = ({ values }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="sr-is-sparkline" aria-hidden>
      {values.map((v, i) => (
        <motion.div
          key={i}
          className="sr-is-sparkline__bar"
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
        />
      ))}
    </div>
  );
};

interface TrendChartProps {
  values: number[];
  height?: number;
  className?: string;
}

export const TrendChart: FunctionComponent<TrendChartProps> = ({
  values,
  height = 128,
  className = '',
}) => {
  const gradId = useId().replace(/:/g, '');
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 100;
  const pad = 4;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width - pad},${height - pad} L ${pad},${height - pad} Z`;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--admin-brand)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--admin-brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath}
        fill={`url(#${gradId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke="var(--admin-brand)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
};

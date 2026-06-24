import { FunctionComponent } from 'react';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const breatheTransition = {
  duration: 3.6,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

const floatTransition = {
  duration: 4.2,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

const orbitTransition = {
  duration: 6,
  repeat: Infinity,
  ease: 'linear' as const,
};

const lineTransition = (delay: number) => ({
  duration: 2.4,
  repeat: Infinity,
  ease: 'easeInOut' as const,
  delay,
});

const RecommendedOffersEmptyIllustration: FunctionComponent = () => (
  <div className="student-recommended-empty__illustration" aria-hidden>
    <motion.div
      className="student-recommended-empty__glow"
      animate={{ scale: [1, 1.06, 1], opacity: [0.28, 0.42, 0.28] }}
      transition={breatheTransition}
    />

    <motion.div
      className="student-recommended-empty__orbit"
      animate={{ rotate: 360 }}
      transition={orbitTransition}
    >
      <motion.span
        className="student-recommended-empty__particle student-recommended-empty__particle--1"
        animate={{ opacity: [0.2, 0.55, 0.2], scale: [0.85, 1.05, 0.85] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="student-recommended-empty__particle student-recommended-empty__particle--2"
        animate={{ opacity: [0.15, 0.45, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />
    </motion.div>

    <motion.div
      className="student-recommended-empty__cards"
      animate={{ y: [0, -5, 0, 4, 0] }}
      transition={floatTransition}
    >
      <svg
        className="student-recommended-empty__cards-svg"
        viewBox="0 0 96 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="18"
          y="10"
          width="58"
          height="42"
          rx="10"
          transform="rotate(6 47 31)"
          fill="var(--admin-bg-elevated)"
          stroke="color-mix(in srgb, var(--admin-border) 88%, transparent)"
          strokeWidth="1.25"
          opacity="0.55"
        />
        <rect
          x="12"
          y="22"
          width="64"
          height="46"
          rx="11"
          fill="var(--admin-bg-elevated)"
          stroke="color-mix(in srgb, var(--admin-brand) 24%, var(--admin-border))"
          strokeWidth="1.5"
        />
        <motion.rect
          x="22"
          y="32"
          width="28"
          height="4"
          rx="2"
          fill="color-mix(in srgb, var(--admin-brand) 35%, var(--admin-border))"
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={lineTransition(0)}
        />
        <motion.rect
          x="22"
          y="42"
          width="44"
          height="3"
          rx="1.5"
          fill="color-mix(in srgb, var(--admin-text-muted) 40%, var(--admin-border))"
          animate={{ opacity: [0.25, 0.55, 0.25] }}
          transition={lineTransition(0.4)}
        />
        <motion.rect
          x="22"
          y="50"
          width="36"
          height="3"
          rx="1.5"
          fill="color-mix(in srgb, var(--admin-text-muted) 40%, var(--admin-border))"
          animate={{ opacity: [0.25, 0.55, 0.25] }}
          transition={lineTransition(0.8)}
        />
        <motion.line
          x1="22"
          y1="58"
          x2="66"
          y2="58"
          stroke="color-mix(in srgb, var(--admin-brand) 18%, var(--admin-border))"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      <motion.div
        className="student-recommended-empty__badge"
        animate={{ y: [0, -2, 0], rotate: [0, 4, 0, -4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      >
        <Sparkles className="student-recommended-empty__badge-icon" strokeWidth={2} aria-hidden />
      </motion.div>
    </motion.div>
  </div>
);

export default RecommendedOffersEmptyIllustration;

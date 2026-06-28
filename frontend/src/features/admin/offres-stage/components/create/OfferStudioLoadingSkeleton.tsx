import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';

const PREFIX = 'admin.forms.createOfferStudio.loading';
const EDITOR_MESSAGES = ['title', 'retrieving', 'preparing'] as const;
const CREATE_MESSAGES = ['setting_up', 'loading_options', 'almost_ready'] as const;

/* ── Shared shimmer block ── */
const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`admin-shimmer ${className}`} aria-hidden />
);

/* ── Method-select variant: 3-card skeleton ── */
const MethodSelectSkeleton = () => {
  const { t } = useTranslation();
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setMsgIdx((i) => (i + 1) % CREATE_MESSAGES.length),
      1400,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="offer-ms-skeleton" aria-busy="true" aria-live="polite">
      {/* ── Animated brand badge ── */}
      <div className="offer-ms-skeleton__brand">
        <span className="offer-ms-skeleton__brand-dot" aria-hidden />
        <span className="offer-ms-skeleton__brand-dot" aria-hidden />
        <span className="offer-ms-skeleton__brand-dot" aria-hidden />
      </div>

      {/* ── Hero text area ── */}
      <div className="offer-ms-skeleton__hero">
        <Shimmer className="offer-ms-skeleton__eyebrow" />
        <Shimmer className="offer-ms-skeleton__title" />
        <Shimmer className="offer-ms-skeleton__subtitle" />
      </div>

      {/* ── Rotating status message ── */}
      <div className="offer-ms-skeleton__status" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.span
            key={msgIdx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.28 }}
            className="offer-ms-skeleton__status-text"
          >
            {t(`${PREFIX}.${CREATE_MESSAGES[msgIdx]}`, {
              defaultValue: CREATE_MESSAGES[msgIdx].replace(/_/g, ' '),
            })}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ── 3-card grid skeleton ── */}
      <div className="offer-ms-skeleton__grid">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="offer-ms-skeleton__card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.15, duration: 0.4, ease: 'easeOut' }}
          >
            <div className="offer-ms-skeleton__card-head">
              <Shimmer className="offer-ms-skeleton__card-badge" />
              <div className="offer-ms-skeleton__card-header">
                <Shimmer className="offer-ms-skeleton__card-icon" />
                <div className="offer-ms-skeleton__card-headings">
                  <Shimmer className="offer-ms-skeleton__card-title" />
                  <Shimmer className="offer-ms-skeleton__card-desc" />
                </div>
              </div>
              <Shimmer className="offer-ms-skeleton__card-longdesc" />
            </div>
            <div className="offer-ms-skeleton__card-benefits">
              {[0, 1, 2, 3].map((j) => (
                <Shimmer key={j} className="offer-ms-skeleton__card-benefit" />
              ))}
            </div>
            <div className="offer-ms-skeleton__card-footer">
              <Shimmer className="offer-ms-skeleton__card-bestfor" />
              <Shimmer className="offer-ms-skeleton__card-cta" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ── Editor variant (edit mode — same as before, slightly upgraded) ── */
const EditorSkeleton = () => {
  const { t } = useTranslation();
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setMsgIdx((i) => (i + 1) % EDITOR_MESSAGES.length),
      1800,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="offer-studio-loading" aria-busy="true" aria-live="polite">
      <div className="offer-studio-loading__center">
        <div className="offer-studio-loading__pulse" aria-hidden />
        <AnimatePresence mode="wait">
          <motion.h2
            key={msgIdx}
            className="offer-studio-loading__title"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.28 }}
          >
            {t(`${PREFIX}.${EDITOR_MESSAGES[msgIdx]}`)}
          </motion.h2>
        </AnimatePresence>
        <p className="offer-studio-loading__subtitle">{t(`${PREFIX}.subtitle`)}</p>
      </div>

      <div className="offer-studio-loading__layout">
        <div className="offer-studio-loading__workspace">
          <Shimmer className="offer-studio-loading__back" />
          <Shimmer className="offer-studio-loading__hero" />
          <Shimmer className="offer-studio-loading__stepper" />
          <div className="offer-studio-loading__panel">
            <Shimmer className="offer-studio-loading__panel-head" />
            <div className="offer-studio-loading__fields">
              {Array.from({ length: 5 }).map((_, index) => (
                <Shimmer key={index} className="offer-studio-loading__field" />
              ))}
            </div>
          </div>
        </div>
        <div className="offer-studio-loading__preview">
          <Shimmer className="offer-studio-loading__preview-card" />
          <Shimmer className="offer-studio-loading__preview-card offer-studio-loading__preview-card--short" />
        </div>
      </div>
    </div>
  );
};

/* ── Public component ── */
interface OfferStudioLoadingSkeletonProps {
  variant?: 'editor' | 'method-select';
}

const OfferStudioLoadingSkeleton: FunctionComponent<OfferStudioLoadingSkeletonProps> = ({
  variant = 'editor',
}) => {
  if (variant === 'method-select') return <MethodSelectSkeleton />;
  return <EditorSkeleton />;
};

export default OfferStudioLoadingSkeleton;

import { FunctionComponent, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

function SkeletonBar({
  className = '',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={`sr-is-skeleton ${className}`} style={style} aria-hidden />;
}

export const InterviewSimulatorHubSkeleton: FunctionComponent = () => (
  <div className="sr-is__root sr-is flex flex-col gap-5" aria-busy="true" aria-live="polite">
    <section className="sr-is-panel sr-is-hero sr-is-hero--enhanced sr-is-loading-skeleton__hero">
      <div className="sr-is-loading-skeleton__hero-row">
        <SkeletonBar className="sr-is-loading-skeleton__avatar" />
        <div className="sr-is-loading-skeleton__hero-text">
          <SkeletonBar className="h-4 w-36 max-w-full" />
          <SkeletonBar className="mt-2 h-3 w-52 max-w-full" />
          <SkeletonBar className="mt-2 h-3 w-28 max-w-full" />
        </div>
      </div>
      <SkeletonBar className="mt-5 h-7 w-64 max-w-full" />
      <SkeletonBar className="mt-2 h-4 w-full max-w-md" />
      <div className="sr-is-loading-skeleton__actions">
        <SkeletonBar className="h-10 w-36 rounded-lg" />
        <SkeletonBar className="h-10 w-40 rounded-lg" />
        <SkeletonBar className="h-10 w-32 rounded-lg" />
      </div>
    </section>

    <section className="sr-is-panel sr-is-analytics sr-is-loading-skeleton__analytics">
      <div className="sr-is-loading-skeleton__section-head">
        <div>
          <SkeletonBar className="h-5 w-48 max-w-full" />
          <SkeletonBar className="mt-2 h-3.5 w-72 max-w-full" />
        </div>
        <div className="sr-is-loading-skeleton__summary-pair">
          <SkeletonBar className="h-10 w-20 rounded-lg" />
          <SkeletonBar className="h-10 w-20 rounded-lg" />
        </div>
      </div>
      <div className="sr-is-analytics__grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="sr-is-analytics__card sr-is-loading-skeleton__analytics-card">
            <SkeletonBar className="h-3.5 w-28" />
            <SkeletonBar className="mt-3 h-8 w-16" />
            <SkeletonBar className="mt-4 h-[7.5rem] w-full rounded-lg" />
          </div>
        ))}
      </div>
    </section>

    <section className="sr-is-panel sr-is-history sr-is-loading-skeleton__history">
      <div className="sr-is-loading-skeleton__section-head">
        <div>
          <SkeletonBar className="h-5 w-56 max-w-full" />
          <SkeletonBar className="mt-2 h-3.5 w-80 max-w-full" />
        </div>
        <SkeletonBar className="h-7 w-24 rounded-full" />
      </div>
      <div className="sr-is-loading-skeleton__table">
        <SkeletonBar className="h-9 w-full rounded-lg" />
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBar key={index} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </section>
  </div>
);

interface InterviewSimulatorBootstrapLoadingProps {
  message?: string;
}

export const InterviewSimulatorBootstrapLoading: FunctionComponent<InterviewSimulatorBootstrapLoadingProps> = ({
  message,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="sr-is__root sr-is"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="sr-is-loading-banner" role="status" aria-live="polite">
        <span className="sr-is-loading-banner__icon" aria-hidden>
          <Sparkles className="h-5 w-5 animate-pulse" />
        </span>
        <p className="sr-is-loading-banner__text">
          {message ?? t('student.internshipOffers.interviewSim.loading.hub')}
        </p>
      </div>
      <InterviewSimulatorHubSkeleton />
    </motion.div>
  );
};

export default InterviewSimulatorHubSkeleton;

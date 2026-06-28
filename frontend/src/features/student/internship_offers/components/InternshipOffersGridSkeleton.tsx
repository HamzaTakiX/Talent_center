import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import StudentSkeletonBlock from './loading/StudentSkeletonBlock';
import { STUDENT_SURFACE_CARD } from '../constants/internshipOffersStyles';
import { STUDENT_MATCH_SCORE } from '../../design-system/studentSemanticStyles';

type InternshipOffersGridSkeletonLayout = 'recommended' | 'all';

const SKELETON_COUNT: Record<InternshipOffersGridSkeletonLayout, number> = {
  recommended: 4,
  all: 6,
};

const gridLayoutClass: Record<InternshipOffersGridSkeletonLayout, string> = {
  recommended: 'grid-cols-2 md:grid-cols-2',
  all: 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3',
};

interface InternshipOfferCardSkeletonProps {
  index: number;
}

const InternshipOfferCardSkeleton: FunctionComponent<InternshipOfferCardSkeletonProps> = ({
  index,
}) => (
  <motion.article
    className={`${STUDENT_SURFACE_CARD} student-internship-offer-card student-internship-offer-skeleton box-border flex w-full min-w-0 max-w-full flex-col items-start gap-5 overflow-hidden px-4 pb-4 pt-5 max-[429px]:gap-4 sm:gap-6 sm:px-[21px] sm:pb-4 sm:pt-[21px]`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    aria-hidden
  >
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <StudentSkeletonBlock className="h-11 w-11 shrink-0 rounded-[var(--admin-radius-sm)] sm:h-[2.75rem] sm:w-[2.75rem]" />
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2.5">
        <StudentSkeletonBlock className="h-[22px] w-[88%] rounded-lg sm:h-[27px]" />
        <div className="flex min-w-0 w-full items-center gap-2">
          <StudentSkeletonBlock className="h-4 w-4 shrink-0 rounded" />
          <StudentSkeletonBlock className="h-4 w-[42%] max-w-[9rem]" />
          <StudentSkeletonBlock className="hidden h-4 w-16 sm:block" />
        </div>
        <div className="flex w-full min-w-0 flex-wrap gap-2">
          <StudentSkeletonBlock className="h-[26px] w-16 rounded-full" />
          <StudentSkeletonBlock className="h-[26px] w-[4.5rem] rounded-full" />
          <StudentSkeletonBlock className="h-[26px] w-14 rounded-full" />
        </div>
        </div>
      </div>

      <div className={`${STUDENT_MATCH_SCORE} shrink-0 self-end sm:self-auto`}>
        <StudentSkeletonBlock className="mx-auto h-8 w-14 rounded-lg sm:h-9" />
        <StudentSkeletonBlock className="mt-1.5 h-2.5 w-[4.5rem] rounded-full" />
      </div>
    </div>

    <StudentSkeletonBlock className="h-11 w-full rounded-lg" />
  </motion.article>
);

interface InternshipOffersGridSkeletonProps {
  layout?: InternshipOffersGridSkeletonLayout;
  loadingLabelKey?: 'loadingRecommendations' | 'loadingAllOffers';
  count?: number;
}

const InternshipOffersGridSkeleton: FunctionComponent<InternshipOffersGridSkeletonProps> = ({
  layout = 'recommended',
  loadingLabelKey = 'loadingRecommendations',
  count: countOverride,
}) => {
  const { t } = useTranslation();
  const loadingLabel = t(`student.internshipOffers.${loadingLabelKey}`);
  const count = countOverride ?? SKELETON_COUNT[layout];

  return (
    <motion.div
      className={`student-internship-offers-grid grid w-full min-w-0 max-w-full gap-3 max-[429px]:gap-2.5 sm:gap-4 ${gridLayoutClass[layout]}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={loadingLabel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <span className="sr-only">{loadingLabel}</span>
      {Array.from({ length: count }, (_, index) => (
        <InternshipOfferCardSkeleton key={index} index={index} />
      ))}
    </motion.div>
  );
};

export default InternshipOffersGridSkeleton;

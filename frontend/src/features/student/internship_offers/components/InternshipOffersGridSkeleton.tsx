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

/** Miroir structurel de `InternshipOfferCard` pour un loading sans jump de layout. */
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
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex w-full min-w-0 items-center gap-3">
          <StudentSkeletonBlock className="admin-offers-table__logo admin-offers-table__logo--card shrink-0 rounded-[var(--admin-radius-sm)]" />
          <StudentSkeletonBlock className="h-5 w-[78%] max-w-[14rem] rounded-lg sm:h-[27px]" />
        </div>

        <div className="student-internship-offer-card__meta flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 pl-[3.5rem]">
          <span className="student-internship-offer-card__meta-item">
            <StudentSkeletonBlock className="h-4 w-4 shrink-0 rounded" />
            <StudentSkeletonBlock className="h-3.5 w-[5.5rem] max-w-full sm:h-4" />
          </span>
          <span className="student-internship-offer-card__meta-item">
            <StudentSkeletonBlock className="h-3.5 w-2 shrink-0 rounded-full sm:h-4" />
            <StudentSkeletonBlock className="h-3.5 w-16 max-w-full sm:h-4" />
          </span>
          <span className="student-internship-offer-card__meta-item">
            <StudentSkeletonBlock className="h-3.5 w-3.5 shrink-0 rounded sm:h-4 sm:w-4" />
            <StudentSkeletonBlock className="h-3.5 w-14 max-w-full sm:h-4" />
          </span>
        </div>

        <div className="student-internship-offer-card__tags flex w-full min-w-0 flex-wrap gap-2 pl-[3.5rem]">
          <StudentSkeletonBlock className="h-[26px] w-16 rounded-full" />
          <StudentSkeletonBlock className="h-[26px] w-[4.5rem] rounded-full" />
          <StudentSkeletonBlock className="h-[26px] w-14 rounded-full" />
        </div>
      </div>

      <div
        className={`${STUDENT_MATCH_SCORE} shrink-0 self-end sm:self-auto`}
        data-score-tier="medium"
        aria-hidden
      >
        <div className="student-match-score__pie">
          <StudentSkeletonBlock className="student-match-score__pie-inner !h-full !w-full !rounded-full" />
        </div>
        <StudentSkeletonBlock className="mt-0.5 h-2.5 w-10 rounded-full" />
      </div>
    </div>

    <footer className="student-internship-offer-card__footer w-full">
      <StudentSkeletonBlock className="h-11 w-full rounded-lg" />
    </footer>
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
  const isRecommendedFeed = layout === 'recommended' && countOverride == null;

  if (isRecommendedFeed) {
    return (
      <motion.div
        className="student-recommended-feed flex w-full min-w-0 flex-col gap-3 sm:gap-4"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={loadingLabel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <span className="sr-only">{loadingLabel}</span>
        <motion.div
          className={`${STUDENT_SURFACE_CARD} student-recommended-featured student-recommended-featured--skeleton box-border flex w-full min-w-0 flex-col gap-4 overflow-hidden p-4 sm:gap-5 sm:p-5`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <div className="flex w-full items-center justify-between gap-2">
            <StudentSkeletonBlock className="h-7 w-40 rounded-full" />
            <StudentSkeletonBlock className="h-14 w-16 rounded-xl" />
          </div>
          <div className="flex gap-3 sm:gap-4">
            <StudentSkeletonBlock className="admin-offers-table__logo admin-offers-table__logo--card shrink-0 rounded-[var(--admin-radius-sm)]" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <StudentSkeletonBlock className="h-6 w-[85%] max-w-md rounded-lg" />
              <StudentSkeletonBlock className="h-4 w-48 max-w-full rounded-md" />
              <div className="mt-1 flex flex-wrap gap-1.5">
                <StudentSkeletonBlock className="h-[26px] w-20 rounded-full" />
                <StudentSkeletonBlock className="h-[26px] w-24 rounded-full" />
                <StudentSkeletonBlock className="h-[26px] w-16 rounded-full" />
              </div>
            </div>
          </div>
          <StudentSkeletonBlock className="h-11 w-full rounded-lg sm:ml-auto sm:w-40" />
        </motion.div>
        <div className="student-internship-offers-grid grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <InternshipOfferCardSkeleton index={1} />
          <InternshipOfferCardSkeleton index={2} />
        </div>
      </motion.div>
    );
  }

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

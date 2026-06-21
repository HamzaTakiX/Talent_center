import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../../components/StudentLayout';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../../constants/internshipOffersLayout';
import {
  DETAILS_SURFACE_CARD,
} from '../../constants/internshipOfferDetailsStyles';
import { STUDENT_MATCH_SCORE, STUDENT_CALLOUT_BRAND, STUDENT_CALLOUT_INFO } from '../../../design-system/studentSemanticStyles';
import StudentSkeletonBlock from './StudentSkeletonBlock';

export type InternshipOfferPageSkeletonVariant =
  | 'details'
  | 'apply'
  | 'application'
  | 'applications-list';

type LoadingLabelKey =
  | 'loadingOfferDetails'
  | 'loadingApply'
  | 'loadingApplication'
  | 'loadingApplications'
  | 'loadingCvAnalysis';

interface InternshipOfferPageSkeletonProps {
  variant?: InternshipOfferPageSkeletonVariant;
  loadingLabelKey?: LoadingLabelKey;
}

const stagger = (index: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: index * 0.06, duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
});

const BackNavSkeleton: FunctionComponent = () => (
  <StudentSkeletonBlock className="h-9 w-[11.5rem] max-w-full rounded-full sm:h-10 sm:w-[13rem]" />
);

const SectionCardSkeleton: FunctionComponent<{ lines?: number; index: number }> = ({
  lines = 3,
  index,
}) => (
  <motion.section
    {...stagger(index)}
    className={`${DETAILS_SURFACE_CARD} box-border w-full min-w-0 px-4 py-5 sm:px-6 sm:py-6`}
    aria-hidden
  >
    <StudentSkeletonBlock className="mb-4 h-5 w-36 rounded-lg" />
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: lines }, (_, lineIndex) => (
        <StudentSkeletonBlock
          key={lineIndex}
          className={`h-4 rounded-md ${lineIndex === lines - 1 ? 'w-[72%]' : 'w-full'}`}
        />
      ))}
    </div>
  </motion.section>
);

const DetailsHeaderSkeleton: FunctionComponent = () => (
  <motion.header
    {...stagger(1)}
    className={`${DETAILS_SURFACE_CARD} box-border w-full min-w-0 overflow-hidden px-4 py-5 sm:px-6 sm:py-6`}
    aria-hidden
  >
    <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
        <StudentSkeletonBlock className="h-16 w-16 shrink-0 rounded-[var(--admin-radius-md)] sm:h-[4.5rem] sm:w-[4.5rem]" />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <StudentSkeletonBlock className="h-8 w-[92%] max-w-xl rounded-lg sm:h-9" />
          <div className="flex min-w-0 items-center gap-2">
            <StudentSkeletonBlock className="h-4 w-4 shrink-0 rounded" />
            <StudentSkeletonBlock className="h-4 w-32 rounded-md" />
            <StudentSkeletonBlock className="hidden h-4 w-24 rounded-md sm:block" />
          </div>
          <div className="flex flex-wrap gap-2">
            <StudentSkeletonBlock className="h-[26px] w-16 rounded-full" />
            <StudentSkeletonBlock className="h-[26px] w-20 rounded-full" />
            <StudentSkeletonBlock className="h-[26px] w-14 rounded-full" />
          </div>
        </div>
      </div>
      <div className={`${STUDENT_MATCH_SCORE} shrink-0 self-start`}>
        <StudentSkeletonBlock className="mx-auto h-8 w-14 rounded-lg sm:h-9" />
        <StudentSkeletonBlock className="mt-1.5 h-2.5 w-[4.5rem] rounded-full" />
      </div>
    </div>
    <div className="mt-5 flex w-full flex-col gap-3 sm:mt-6 sm:flex-row sm:gap-4">
      <StudentSkeletonBlock className="h-11 w-full rounded-lg sm:min-w-[140px] sm:flex-1" />
      <StudentSkeletonBlock className="h-11 w-full rounded-lg sm:min-w-[140px] sm:flex-1" />
    </div>
  </motion.header>
);

const DetailsSidebarSkeleton: FunctionComponent = () => (
  <aside className="flex min-w-0 flex-col gap-4 sm:gap-5" aria-hidden>
    <motion.section {...stagger(6)} className={`${STUDENT_CALLOUT_BRAND} px-4 py-5 sm:px-6 sm:py-6`}>
      <div className="mb-3 flex items-center gap-2">
        <StudentSkeletonBlock className="h-[18px] w-[18px] rounded" />
        <StudentSkeletonBlock className="h-5 w-28 rounded-lg" />
      </div>
      <StudentSkeletonBlock className="h-4 w-full rounded-md" />
      <StudentSkeletonBlock className="mt-2 h-4 w-[88%] rounded-md" />
    </motion.section>

    <SectionCardSkeleton index={7} lines={4} />
    <SectionCardSkeleton index={8} lines={3} />

    <motion.section {...stagger(9)} className={`${STUDENT_CALLOUT_INFO} px-4 py-5 sm:px-6 sm:py-6`}>
      <StudentSkeletonBlock className="mb-4 h-5 w-40 rounded-lg" />
      <div className="flex flex-col gap-3">
        <StudentSkeletonBlock className="h-10 w-full rounded-lg" />
        <StudentSkeletonBlock className="h-10 w-full rounded-lg" />
      </div>
    </motion.section>
  </aside>
);

const ApplyHeaderSkeleton: FunctionComponent = () => (
  <motion.header
    {...stagger(1)}
    className={`${DETAILS_SURFACE_CARD} box-border w-full min-w-0 px-4 py-5 sm:px-6 sm:py-6`}
    aria-hidden
  >
    <StudentSkeletonBlock className="h-8 w-[70%] max-w-md rounded-lg sm:h-9" />
    <StudentSkeletonBlock className="mt-3 h-4 w-[85%] max-w-lg rounded-md" />
  </motion.header>
);

const ApplyChecklistSkeleton: FunctionComponent = () => (
  <motion.section
    {...stagger(2)}
    className="admin-module-panel flex w-full flex-col gap-4 p-4 sm:gap-5 sm:p-6"
    aria-hidden
  >
    <StudentSkeletonBlock className="h-5 w-48 rounded-lg" />
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="flex items-start gap-3 rounded-xl border border-[var(--admin-border)] p-4">
        <StudentSkeletonBlock className="h-5 w-5 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <StudentSkeletonBlock className="h-4 w-[55%] rounded-md" />
          <StudentSkeletonBlock className="h-3.5 w-full rounded-md" />
        </div>
      </div>
    ))}
    <StudentSkeletonBlock className="mt-1 h-11 w-full rounded-lg sm:w-48" />
  </motion.section>
);

const ApplicationHeaderSkeleton: FunctionComponent = () => (
  <motion.header {...stagger(1)} className="flex flex-col gap-2.5" aria-hidden>
    <StudentSkeletonBlock className="h-7 w-[78%] max-w-lg rounded-lg sm:h-8" />
    <StudentSkeletonBlock className="h-4 w-40 rounded-md" />
    <StudentSkeletonBlock className="h-7 w-28 rounded-md" />
  </motion.header>
);

const TimelinePanelSkeleton: FunctionComponent<{ index?: number }> = ({ index = 2 }) => (
  <motion.section
    {...stagger(index)}
    className="admin-module-panel p-4 sm:p-6"
    aria-hidden
  >
    <StudentSkeletonBlock className="mb-5 h-5 w-36 rounded-lg" />
    <div className="flex flex-col gap-4">
      {Array.from({ length: 5 }, (_, stepIndex) => (
        <div key={stepIndex} className="flex items-center gap-3">
          <StudentSkeletonBlock className="h-8 w-8 shrink-0 rounded-full" />
          <StudentSkeletonBlock className={`h-4 rounded-md ${stepIndex % 2 === 0 ? 'w-[62%]' : 'w-[48%]'}`} />
        </div>
      ))}
    </div>
  </motion.section>
);

const ApplicationCardSkeleton: FunctionComponent<{ index: number }> = ({ index }) => (
  <motion.article
    {...stagger(index)}
    className="admin-module-panel p-4 sm:p-5"
    aria-hidden
  >
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <StudentSkeletonBlock className="h-5 w-[72%] rounded-md" />
        <StudentSkeletonBlock className="mt-2 h-4 w-40 rounded-md" />
      </div>
      <StudentSkeletonBlock className="h-5 w-5 shrink-0 rounded" />
    </div>
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }, (_, stepIndex) => (
        <div key={stepIndex} className="flex items-center gap-3">
          <StudentSkeletonBlock className="h-6 w-6 shrink-0 rounded-full" />
          <StudentSkeletonBlock className="h-3.5 w-[58%] rounded-md" />
        </div>
      ))}
    </div>
  </motion.article>
);

const InternshipOfferPageSkeleton: FunctionComponent<InternshipOfferPageSkeletonProps> = ({
  variant = 'details',
  loadingLabelKey = 'loadingOfferDetails',
}) => {
  const { t } = useTranslation();
  const loadingLabel = t(`student.internshipOffers.${loadingLabelKey}`);

  return (
    <motion.div
      className="student-internship-page-skeleton flex w-full min-w-0 flex-col gap-4 sm:gap-5"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={loadingLabel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <span className="sr-only">{loadingLabel}</span>

      <motion.div {...stagger(0)}>
        <BackNavSkeleton />
      </motion.div>

      {variant === 'details' && (
        <>
          <DetailsHeaderSkeleton />
          <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:gap-6">
            <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
              <SectionCardSkeleton index={2} lines={4} />
              <SectionCardSkeleton index={3} lines={3} />
              <SectionCardSkeleton index={4} lines={3} />
              <SectionCardSkeleton index={5} lines={2} />
            </div>
            <DetailsSidebarSkeleton />
          </div>
        </>
      )}

      {variant === 'apply' && (
        <>
          <ApplyHeaderSkeleton />
          <ApplyChecklistSkeleton />
        </>
      )}

      {variant === 'application' && (
        <>
          <ApplicationHeaderSkeleton />
          <TimelinePanelSkeleton />
          <motion.section {...stagger(3)} className="admin-module-panel p-4 sm:p-6" aria-hidden>
            <StudentSkeletonBlock className="mb-3 h-5 w-32 rounded-lg" />
            <StudentSkeletonBlock className="h-16 w-full rounded-xl" />
          </motion.section>
        </>
      )}

      {variant === 'applications-list' && (
        <>
          <motion.header {...stagger(1)} className="flex flex-col gap-2" aria-hidden>
            <StudentSkeletonBlock className="h-7 w-56 rounded-lg sm:h-8" />
            <StudentSkeletonBlock className="h-4 w-72 max-w-full rounded-md" />
          </motion.header>
          <div className="flex flex-col gap-4">
            <ApplicationCardSkeleton index={2} />
            <ApplicationCardSkeleton index={3} />
          </div>
        </>
      )}
    </motion.div>
  );
};

interface InternshipOfferPageLoadingStateProps extends InternshipOfferPageSkeletonProps {}

export const InternshipOfferPageLoadingState: FunctionComponent<InternshipOfferPageLoadingStateProps> = (
  props,
) => (
  <StudentLayout>
    <div className={INTERNSHIP_OFFERS_PAGE_ROOT}>
      <InternshipOfferPageSkeleton {...props} />
    </div>
  </StudentLayout>
);

export default InternshipOfferPageSkeleton;

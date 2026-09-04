import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import StudentSkeletonBlock from '../internship_offers/components/loading/StudentSkeletonBlock';
import StudentMatchStatCardSkeleton from './StudentMatchStatCardSkeleton';

interface StudentMatchStatCardsSkeletonProps {
  loadingLabelKey?: string;
  showInsights?: boolean;
}

const StudentMatchStatCardsSkeleton: FunctionComponent<StudentMatchStatCardsSkeletonProps> = ({
  loadingLabelKey = 'student.internshipOffers.details.aiCvMatch.loading',
  showInsights = true,
}) => {
  const { t } = useTranslation();
  const loadingLabel = t(loadingLabelKey, { defaultValue: 'Analyse en cours…' });

  return (
    <motion.div
      className="student-match-analysis-skeleton"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={loadingLabel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22 }}
    >
      <span className="sr-only">{loadingLabel}</span>

      <div className="admin-students-stats-grid student-match-stats mb-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StudentMatchStatCardSkeleton key={index} index={index} />
        ))}
      </div>

      {showInsights ? (
        <motion.div
          className="student-match-analysis-skeleton__insights"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18, duration: 0.3 }}
          aria-hidden
        >
          <StudentSkeletonBlock className="mb-2 h-3.5 w-full max-w-[92%] rounded-md" />
          <StudentSkeletonBlock className="mb-2 h-3.5 w-full max-w-[78%] rounded-md" />
          <StudentSkeletonBlock className="mb-5 h-3.5 w-full max-w-[64%] rounded-md" />

          <div className="student-match-analysis-skeleton__callout mb-4">
            <StudentSkeletonBlock className="mb-3 h-3.5 w-36 rounded-md" />
            <StudentSkeletonBlock className="mb-2 h-3 w-full rounded-md" />
            <StudentSkeletonBlock className="mb-2 h-3 w-[94%] rounded-md" />
            <StudentSkeletonBlock className="h-3 w-[86%] rounded-md" />
          </div>

          <div className="student-match-analysis-skeleton__callout">
            <StudentSkeletonBlock className="mb-3 h-3.5 w-40 rounded-md" />
            <div className="flex flex-wrap gap-2">
              <StudentSkeletonBlock className="h-7 w-20 rounded-full" />
              <StudentSkeletonBlock className="h-7 w-24 rounded-full" />
              <StudentSkeletonBlock className="h-7 w-[4.5rem] rounded-full" />
            </div>
          </div>
        </motion.div>
      ) : null}

      <p className="student-match-analysis-skeleton__status m-0 mt-5 flex items-center justify-center gap-2 text-sm text-[var(--admin-text-secondary)]">
        <span className="student-match-analysis-skeleton__pulse" aria-hidden />
        {loadingLabel}
      </p>
    </motion.div>
  );
};

export default StudentMatchStatCardsSkeleton;

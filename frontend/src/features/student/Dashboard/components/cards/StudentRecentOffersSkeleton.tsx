import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer rounded-md ${className}`} aria-hidden />
);

const OfferCardSkeleton: FunctionComponent<{ delayIndex: number }> = ({ delayIndex }) => (
  <article
    className="student-offer-card student-offer-card--skeleton overflow-hidden"
    style={{ animationDelay: `${delayIndex * 80}ms` }}
    aria-hidden
  >
    <div className="flex w-full min-w-0 items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Shimmer className="h-12 w-12 shrink-0 rounded-xl" />
          <Shimmer className="h-5 min-w-0 flex-1 max-w-[280px]" />
        </div>
        <div className="flex items-center gap-2 pl-12">
          <Shimmer className="h-3.5 w-28" />
          <Shimmer className="h-3.5 w-20" />
        </div>
        <div className="flex flex-wrap gap-1.5 pl-12">
          <Shimmer className="h-6 w-16 rounded-full" />
          <Shimmer className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Shimmer className="h-12 w-14 rounded-xl" />
      </div>
    </div>

    <Shimmer className="h-10 w-full rounded-lg" />
  </article>
);

interface StudentRecentOffersSkeletonProps {
  count?: number;
}

const StudentRecentOffersSkeleton: FunctionComponent<StudentRecentOffersSkeletonProps> = ({
  count = 3,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="student-recommended-grid student-recommended-grid--single-col student-recent-offers-skeleton"
      role="status"
      aria-busy="true"
      aria-label={t('student.common.loading')}
    >
      {Array.from({ length: count }).map((_, index) => (
        <OfferCardSkeleton key={index} delayIndex={index} />
      ))}
    </div>
  );
};

export default StudentRecentOffersSkeleton;

import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentRecommendations } from '../hooks/useStudentStageOffers';
import InternshipOffersGrid from './InternshipOffersGrid';
import InternshipOffersSectionHeader from './InternshipOffersSectionHeader';
import RecommendedInternshipOffersSkeleton from './RecommendedInternshipOffersSkeleton';

const RecommendedInternshipOffersSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const { offers, loading, error } = useStudentRecommendations();

  return (
    <section
      id="student-recommended-internships"
      aria-label={t('student.internshipOffers.recommendedAria')}
      className="student-recommended-section-panel admin-module-panel flex w-full min-w-0 max-w-full flex-col items-stretch gap-4 overflow-x-clip p-4 text-left font-inter text-[var(--admin-text)] max-[429px]:gap-3 max-[429px]:p-3.5 sm:gap-5 sm:p-5"
    >
      <InternshipOffersSectionHeader />

      {error && (
        <p className="px-1 text-sm text-[var(--admin-danger)]">{error}</p>
      )}

      <div className="student-recommended-section-body min-w-0">
        {loading ? (
          <RecommendedInternshipOffersSkeleton />
        ) : (
          <InternshipOffersGrid
            layout="recommended"
            emptyVariant="recommended"
            offers={offers}
          />
        )}
      </div>
    </section>
  );
};

export default RecommendedInternshipOffersSection;

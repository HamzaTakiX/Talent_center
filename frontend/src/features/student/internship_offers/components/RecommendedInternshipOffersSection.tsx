import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentRecommendations } from '../hooks/useStudentStageOffers';
import FeaturedRecommendedOfferCard from '../cards/FeaturedRecommendedOfferCard';
import InternshipOfferCard from '../cards/InternshipOfferCard';
import InternshipOffersSectionHeader from './InternshipOffersSectionHeader';
import RecommendedInternshipOffersSkeleton from './RecommendedInternshipOffersSkeleton';
import RecommendedOffersEmptyState from './RecommendedOffersEmptyState';

const RecommendedInternshipOffersSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const { offers, loading, error } = useStudentRecommendations();

  const [featured, ...rest] = offers;

  return (
    <section
      id="student-recommended-internships"
      aria-label={t('student.internshipOffers.recommendedAria')}
      className="student-recommended-section-panel admin-module-panel flex w-full min-w-0 max-w-full flex-col items-stretch gap-4 overflow-x-clip p-4 text-left font-inter text-[var(--admin-text)] max-[429px]:gap-3 max-[429px]:p-3.5 sm:gap-5 sm:p-5"
    >
      <InternshipOffersSectionHeader offerCount={loading ? undefined : offers.length} />

      {error && (
        <p className="px-1 text-sm text-[var(--admin-danger)]">{error}</p>
      )}

      <div className="student-recommended-section-body min-w-0">
        {loading ? (
          <RecommendedInternshipOffersSkeleton />
        ) : offers.length === 0 ? (
          <RecommendedOffersEmptyState />
        ) : (
          <div className="student-recommended-feed flex w-full min-w-0 flex-col gap-3 sm:gap-4">
            {featured ? <FeaturedRecommendedOfferCard offer={featured} /> : null}

            {rest.length > 0 ? (
              <div className="student-recommended-feed__more">
                <p className="student-recommended-feed__more-label">
                  {t('student.internshipOffers.moreRecommended')}
                </p>
                <div className="student-internship-offers-grid student-recommended-feed__grid grid w-full min-w-0 max-w-full grid-cols-1 gap-3 max-[429px]:gap-2.5 sm:grid-cols-2 sm:gap-4">
                  {rest.map((offer) => (
                    <InternshipOfferCard key={offer.id} offer={offer} variant="recommended" />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedInternshipOffersSection;

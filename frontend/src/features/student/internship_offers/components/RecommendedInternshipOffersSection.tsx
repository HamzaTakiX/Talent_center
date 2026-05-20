import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendedInternshipOffers } from '../data/internshipOffersMock';
import { STUDENT_ALL_INTERNSHIP_OFFERS_PATH } from '../constants/routes';
import InternshipOffersGrid from './InternshipOffersGrid';
import InternshipOffersSectionHeader from './InternshipOffersSectionHeader';

const RecommendedInternshipOffersSection: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <section
      id="student-recommended-internships"
      aria-label="Recommended internship offers"
      className="flex w-full min-w-0 max-w-full flex-col items-stretch gap-3 overflow-x-clip text-left font-inter text-[var(--admin-text)] max-[429px]:gap-2.5 sm:gap-4"
    >
      <InternshipOffersSectionHeader
        onViewAll={() => navigate(STUDENT_ALL_INTERNSHIP_OFFERS_PATH)}
      />

      <InternshipOffersGrid
        layout="recommended"
        offers={recommendedInternshipOffers}
        emptyMessage="No recommendations yet. Complete your profile to unlock personalized offers."
      />
    </section>
  );
};

export default RecommendedInternshipOffersSection;

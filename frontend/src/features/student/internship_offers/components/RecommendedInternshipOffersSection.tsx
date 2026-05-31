import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { recommendedInternshipOffers } from '../data/internshipOffersMock';
import { STUDENT_ALL_INTERNSHIP_OFFERS_PATH } from '../constants/routes';
import InternshipOffersGrid from './InternshipOffersGrid';
import InternshipOffersSectionHeader from './InternshipOffersSectionHeader';

const RecommendedInternshipOffersSection: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section
      id="student-recommended-internships"
      aria-label={t('student.internshipOffers.recommendedAria')}
      className="flex w-full min-w-0 max-w-full flex-col items-stretch gap-3 overflow-x-clip text-left font-inter text-[var(--admin-text)] max-[429px]:gap-2.5 sm:gap-4"
    >
      <InternshipOffersSectionHeader
        onViewAll={() => navigate(STUDENT_ALL_INTERNSHIP_OFFERS_PATH)}
      />

      <InternshipOffersGrid
        layout="recommended"
        emptyVariant="text"
        offers={recommendedInternshipOffers}
        emptyMessage={t('student.internshipOffers.noRecommendations')}
      />
    </section>
  );
};

export default RecommendedInternshipOffersSection;

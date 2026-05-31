import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../components/StudentLayout';
import InternshipOffersStatsGrid from '../components/InternshipOffersStatsGrid';
import RecommendedInternshipOffersSection from '../components/RecommendedInternshipOffersSection';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../constants/internshipOffersLayout';

const StudentInternshipOffersPage: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <StudentLayout>
      <div
        id="student-internship-offers-root"
        className={INTERNSHIP_OFFERS_PAGE_ROOT}
      >
        <section aria-label={t('student.internshipOffers.statsAria')} className="min-w-0">
          <InternshipOffersStatsGrid />
        </section>

        <RecommendedInternshipOffersSection />
      </div>
    </StudentLayout>
  );
};

export default StudentInternshipOffersPage;

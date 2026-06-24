import { FunctionComponent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../components/StudentLayout';
import InternshipOffersStatsGrid from '../components/InternshipOffersStatsGrid';
import RecommendedInternshipOffersSection from '../components/RecommendedInternshipOffersSection';
import AllInternshipOffersSection from '../components/AllInternshipOffersSection';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../constants/internshipOffersLayout';
import { STUDENT_ALL_OFFERS_SECTION_ID } from '../constants/routes';
import '../../../admin/announcements-stage/styles/admin-announcements.css';

const StudentInternshipOffersPage: FunctionComponent = () => {
  const { t } = useTranslation();

  useEffect(() => {
    if (window.location.hash !== `#${STUDENT_ALL_OFFERS_SECTION_ID}`) {
      return;
    }

    requestAnimationFrame(() => {
      document
        .getElementById(STUDENT_ALL_OFFERS_SECTION_ID)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

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

        <AllInternshipOffersSection />
      </div>
    </StudentLayout>
  );
};

export default StudentInternshipOffersPage;

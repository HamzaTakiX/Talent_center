import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import DashboardPanel from '../../../../admin/dashboard/ui/DashboardPanel';
import AdminSectionEmptyState from '../../../../admin/ui/AdminSectionEmptyState';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../../../internship_offers/constants/routes';
import InternshipOfferCard from '../../../internship_offers/cards/InternshipOfferCard';
import { useStudentRecentOffers } from '../../../internship_offers/hooks/useStudentStageOffers';
import StudentSectionHeader from '../StudentSectionHeader';
import StudentRecentOffersSkeleton from './StudentRecentOffersSkeleton';

const StudentRecommendedOffersCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { offers, loading, error } = useStudentRecentOffers(3);

  return (
    <DashboardPanel id="student-recent-offers" className="admin-section-panel w-full">
      <StudentSectionHeader
        icon={<Clock strokeWidth={1.75} aria-hidden />}
        title={t('student.dashboard.sections.recentOffers')}
        subtitle={t('student.dashboard.sections.recentOffersSubtitle')}
        action={{ label: t('student.common.viewAll'), onClick: () => navigate(STUDENT_INTERNSHIP_OFFERS_PATH) }}
      />

      {error ? (
        <p className="px-4 pt-2 text-sm text-[var(--admin-danger)]">{error}</p>
      ) : null}

      {loading ? (
        <StudentRecentOffersSkeleton count={3} />
      ) : offers.length === 0 ? (
        <div className="p-4 sm:p-5">
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="inbox"
            title={t('student.dashboard.empty.noRecentOffers')}
            description={t('student.dashboard.empty.noRecentOffersDesc')}
          />
        </div>
      ) : (
        <div className="student-recommended-grid student-recommended-grid--single-col">
          {offers.map((offer) => (
            <InternshipOfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </DashboardPanel>
  );
};

export default StudentRecommendedOffersCard;

import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import DashboardPanel from '../../../../admin/dashboard/ui/DashboardPanel';
import AdminSectionEmptyState from '../../../../admin/ui/AdminSectionEmptyState';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../../../internship_offers/constants/routes';
import InternshipOffersGrid from '../../../internship_offers/components/InternshipOffersGrid';
import InternshipOffersGridSkeleton from '../../../internship_offers/components/InternshipOffersGridSkeleton';
import { useStudentRecentOffers } from '../../../internship_offers/hooks/useStudentStageOffers';
import StudentSectionHeader from '../StudentSectionHeader';

const StudentRecommendedOffersCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { offers, loading, error } = useStudentRecentOffers(2);

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

      <div className="student-dashboard-offers-grid-body">
        {loading ? (
          <InternshipOffersGridSkeleton layout="recommended" count={2} />
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
          <InternshipOffersGrid offers={offers} layout="recommended" />
        )}
      </div>
    </DashboardPanel>
  );
};

export default StudentRecommendedOffersCard;

import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Star, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardPanel from '../../../../admin/dashboard/ui/DashboardPanel';
import AdminSectionEmptyState from '../../../../admin/ui/AdminSectionEmptyState';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../../../internship_offers/constants/routes';
import { studentRecommendedOffers } from '../../data/studentDashboardMock';
import type { StudentRecommendedOffer } from '../../data/studentDashboardMock';
import StudentSectionHeader from '../StudentSectionHeader';
import { STUDENT_PRIMARY_BUTTON } from '../../constants/studentDashboardStyles';

const OfferCard: FunctionComponent<{ offer: StudentRecommendedOffer }> = ({ offer }) => {
  const { t } = useTranslation();

  return (
    <article className="student-offer-card">
      <div className="flex w-full min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h3 className="text-base font-semibold tracking-tight text-[var(--admin-text)] sm:text-[17px]">
            {offer.title}
          </h3>

          <div className="flex min-w-0 flex-wrap items-center gap-2 text-[13px] text-[var(--admin-text-secondary)]">
            <Building2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>{offer.company}</span>
            <span className="text-[var(--admin-text-muted)]">•</span>
            <span>{offer.location}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {offer.tags.map((tag) => (
              <span key={tag} className="student-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="student-offer-match">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 shrink-0 fill-[#eab308] text-[#eab308]" aria-hidden />
            <span className="text-xl font-bold tabular-nums text-[var(--admin-text)]">
              {offer.matchPercent}%
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
            {t('student.dashboard.actions.match')}
          </span>
        </div>
      </div>

      <button
        type="button"
        className={`${STUDENT_PRIMARY_BUTTON} w-full sm:w-auto`}
        onClick={() => console.log('View offer', offer.id)}
      >
        {t('student.dashboard.actions.viewDetails')}
      </button>
    </article>
  );
};

const StudentRecommendedOffersCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <DashboardPanel id="student-recommended" className="admin-section-panel w-full">
      <StudentSectionHeader
        icon={<Target strokeWidth={1.75} aria-hidden />}
        title={t('student.dashboard.sections.recommendedOffers')}
        subtitle={t('student.dashboard.sections.recommendedOffersSubtitle')}
        action={{ label: t('common.viewAll'), onClick: () => navigate(STUDENT_INTERNSHIP_OFFERS_PATH) }}
      />

      {studentRecommendedOffers.length === 0 ? (
        <div className="p-4 sm:p-5">
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="inbox"
            title={t('student.dashboard.empty.noOffers')}
            description={t('student.dashboard.empty.noOffersDesc')}
          />
        </div>
      ) : (
        <div className="student-recommended-grid student-recommended-grid--single-col">
          {studentRecommendedOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </DashboardPanel>
  );
};

export default StudentRecommendedOffersCard;

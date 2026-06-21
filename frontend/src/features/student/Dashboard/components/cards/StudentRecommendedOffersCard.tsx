import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Building2, Star, Target } from 'lucide-react';
import DashboardPanel from '../../../../admin/dashboard/ui/DashboardPanel';
import AdminSectionEmptyState from '../../../../admin/ui/AdminSectionEmptyState';
import {
  getInternshipOfferDetailsPath,
  STUDENT_INTERNSHIP_OFFERS_PATH,
} from '../../../internship_offers/constants/routes';
import { useStudentRecommendations } from '../../../internship_offers/hooks/useStudentStageOffers';
import type { InternshipOffer } from '../../../internship_offers/types';
import StudentSectionHeader from '../StudentSectionHeader';
import { STUDENT_PRIMARY_BUTTON } from '../../constants/studentDashboardStyles';
import { SafeBadge, SafeText } from '../../../../../design-system/safeContent';

const OfferCard: FunctionComponent<{ offer: InternshipOffer }> = ({ offer }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <article className="student-offer-card overflow-hidden">
      <div className="flex w-full min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h3 className="safe-card-title text-base font-semibold tracking-tight text-[var(--admin-text)] sm:text-[17px]">
            <SafeText as="span">{offer.title}</SafeText>
          </h3>

          <div className="flex min-w-0 flex-wrap items-center gap-2 text-[13px] text-[var(--admin-text-secondary)]">
            <Building2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <SafeText className="text-[inherit]">{offer.company}</SafeText>
            <span className="text-[var(--admin-text-muted)]">•</span>
            <SafeText className="text-[inherit]">{offer.location}</SafeText>
          </div>

          <div className="flex min-w-0 flex-wrap gap-1.5">
            {offer.tags.map((tag) => (
              <SafeBadge key={tag} className="student-tag">
                {tag}
              </SafeBadge>
            ))}
          </div>
        </div>

        <div className="student-offer-match shrink-0">
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
        onClick={() => navigate(getInternshipOfferDetailsPath(offer.id))}
      >
        {t('student.dashboard.actions.viewDetails')}
      </button>
    </article>
  );
};

const StudentRecommendedOffersCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { offers, loading, error } = useStudentRecommendations();

  return (
    <DashboardPanel id="student-recommended" className="admin-section-panel w-full">
      <StudentSectionHeader
        icon={<Target strokeWidth={1.75} aria-hidden />}
        title={t('student.dashboard.sections.recommendedOffers')}
        subtitle={t('student.dashboard.sections.recommendedOffersSubtitle')}
        action={{ label: t('student.common.viewAll'), onClick: () => navigate(STUDENT_INTERNSHIP_OFFERS_PATH) }}
      />

      {error && (
        <p className="px-4 pt-2 text-sm text-[var(--admin-danger)]">{error}</p>
      )}

      {loading ? (
        <p className="px-4 py-6 text-sm text-[var(--admin-text-muted)]">Chargement…</p>
      ) : offers.length === 0 ? (
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
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </DashboardPanel>
  );
};

export default StudentRecommendedOffersCard;

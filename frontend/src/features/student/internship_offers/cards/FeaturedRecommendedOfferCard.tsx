import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Building2, MapPin, Sparkles } from 'lucide-react';
import OfferCompanyLogo from '../../../admin/offres-stage/components/OfferCompanyLogo';
import StudentMatchScoreBadge from '../../components/StudentMatchScoreBadge';
import { getInternshipOfferDetailsPath } from '../constants/routes';
import type { InternshipOffer } from '../types';
import {
  STUDENT_SURFACE_CARD_INTERACTIVE,
  STUDENT_TEXT_MUTED,
  STUDENT_TEXT_PRIMARY,
  STUDENT_TEXT_SECONDARY,
} from '../constants/internshipOffersStyles';
import { STUDENT_CARD_CTA_BTN } from '../../../../design-system/platformTokens';
import { SafeBadge, SafeText } from '../../../../design-system/safeContent';

interface FeaturedRecommendedOfferCardProps {
  offer: InternshipOffer;
}

const FeaturedRecommendedOfferCard: FunctionComponent<FeaturedRecommendedOfferCardProps> = ({
  offer,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const distanceLabel = offer.isRemote
    ? t('student.internshipOffers.remote')
    : offer.distanceKm != null
      ? t('student.internshipOffers.distanceAway', { km: offer.distanceKm })
      : null;

  const whyLabels =
    offer.matchReasons && offer.matchReasons.length > 0
      ? offer.matchReasons.slice(0, 3)
      : offer.tags.slice(0, 3);

  return (
    <article className={`student-recommended-featured ${STUDENT_SURFACE_CARD_INTERACTIVE} box-border flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden p-4 sm:gap-5 sm:p-5`}>
      <span className="student-recommended-featured__badge w-fit">
        <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
        <span>{t('student.internshipOffers.bestMatchBadge')}</span>
      </span>

      <div className="student-recommended-featured__main flex w-full min-w-0 items-start gap-3 sm:gap-4">
        <OfferCompanyLogo
          url={offer.companyLogoUrl}
          companyName={offer.company}
          size="card"
        />

        <div className="min-w-0 flex-1">
          <h3 className={`safe-card-title m-0 text-base font-semibold leading-snug tracking-tight sm:text-xl ${STUDENT_TEXT_PRIMARY}`}>
            <SafeText as="span">{offer.title}</SafeText>
          </h3>

          <div className={`mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm ${STUDENT_TEXT_SECONDARY}`}>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Building2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              <SafeText className="text-[inherit]">{offer.company}</SafeText>
            </span>
            <span className={STUDENT_TEXT_MUTED} aria-hidden>•</span>
            <SafeText className="text-[inherit]">{offer.location}</SafeText>
            {distanceLabel ? (
              <>
                <span className={STUDENT_TEXT_MUTED} aria-hidden>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--admin-brand)]" aria-hidden />
                  <SafeText className="text-[inherit]">{distanceLabel}</SafeText>
                </span>
              </>
            ) : null}
          </div>

          {whyLabels.length > 0 ? (
            <div className="student-recommended-featured__why mt-3">
              <p className="student-recommended-featured__why-label">
                {t('student.internshipOffers.whyRecommended')}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {whyLabels.map((label) => (
                  <SafeBadge key={label} className="admin-badge admin-badge--info">
                    {label}
                  </SafeBadge>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <StudentMatchScoreBadge
          percent={offer.matchPercent}
          label={t('student.internshipOffers.match')}
          size="detail"
          className="student-recommended-featured__match shrink-0"
        />
      </div>

      <footer className="student-recommended-featured__footer flex w-full min-w-0 flex-col gap-2 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className={`m-0 text-xs leading-relaxed sm:max-w-[28rem] ${STUDENT_TEXT_MUTED}`}>
          {t('student.internshipOffers.bestMatchHint', { percent: offer.matchPercent })}
        </p>
        <button
          type="button"
          className={`${STUDENT_CARD_CTA_BTN} student-recommended-featured__cta inline-flex items-center justify-center gap-1.5`}
          onClick={() => navigate(getInternshipOfferDetailsPath(offer.id))}
        >
          <span className="safe-button-label">{t('student.internshipOffers.viewDetails')}</span>
          <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        </button>
      </footer>
    </article>
  );
};

export default FeaturedRecommendedOfferCard;

import { FunctionComponent, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, ExternalLink, MapPin, Pencil } from 'lucide-react';
import OfferCompanyLogo from '../../../../admin/offres-stage/components/OfferCompanyLogo';
import { STUDENT_CHAT_PATH } from '../../chat/constants/routes';
import OfferApplyButton from '../OfferApplyButton';
import StudentMatchScoreBadge from '../../../components/StudentMatchScoreBadge';
import type { InternshipOfferDetails } from '../../types';
import {
  DETAILS_OUTLINE_BUTTON,
  DETAILS_PRIMARY_BUTTON,
  DETAILS_SURFACE_CARD,
  DETAILS_TAG_PRIMARY,
} from '../../constants/internshipOfferDetailsStyles';
import { SafeBadge, SafeText } from '../../../../../design-system/safeContent';
import { filterHeaderTags } from '../../utils/filterHeaderTags';
import { adminBadgeClass } from '../../../../admin/ui/adminStatusBadges';
import { useBackNavigation } from '../../../../../shared/navigation/useBackNavigation';

interface InternshipOfferDetailsHeaderProps {
  offer: InternshipOfferDetails;
  mode?: 'student' | 'admin';
  adminPublicationStatus?: string;
  adminStatusBadgeVariant?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  adminUiStatusLabel?: string;
  adminUiStatusBadgeVariant?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  onEdit?: () => void;
  backTo?: string;
  backLabel?: string;
}

const InternshipOfferDetailsHeader: FunctionComponent<InternshipOfferDetailsHeaderProps> = ({
  offer,
  mode = 'student',
  adminPublicationStatus,
  adminStatusBadgeVariant = 'neutral',
  adminUiStatusLabel,
  adminUiStatusBadgeVariant = 'info',
  onEdit,
  backTo,
  backLabel,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { BackIcon, controlClassName } = useBackNavigation();

  const headerTags = useMemo(() => filterHeaderTags(offer), [offer]);

  const handleAskQuestion = useCallback(() => {
    navigate(`${STUDENT_CHAT_PATH}?offer=${offer.id}`);
  }, [navigate, offer.id]);

  const isAdmin = mode === 'admin';

  const hasAdminBadges = Boolean(adminPublicationStatus || adminUiStatusLabel);

  const metaChipClass = isAdmin
    ? 'offer-detail-page__meta-chip inline-flex min-w-0 items-center gap-1.5'
    : 'inline-flex min-w-0 items-center gap-1.5';

  const metaIconClass = isAdmin ? 'h-3.5 w-3.5' : 'h-4 w-4';

  const studentActions = !isAdmin ? (
    <div className="mt-3 flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2.5">
      <OfferApplyButton
        offerId={offer.id}
        externalUrl={offer.externalUrl}
        applicationMethod={offer.applicationMethod}
        offerTitle={offer.title}
        className={DETAILS_PRIMARY_BUTTON}
      >
        <span className="safe-button-label">{t('student.internshipOffers.details.applyNow')}</span>
      </OfferApplyButton>

      <button type="button" className={DETAILS_OUTLINE_BUTTON} onClick={handleAskQuestion}>
        <span className="safe-button-label">{t('student.internshipOffers.details.askQuestion')}</span>
      </button>
    </div>
  ) : null;

  const adminActions = isAdmin ? (
    <div className="mt-4 flex w-full min-w-0 flex-col gap-2.5 border-t border-[var(--admin-border)] pt-4 sm:flex-row sm:flex-wrap sm:gap-3">
      {offer.externalUrl ? (
        <a
          href={offer.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="offer-detail-page__external-btn"
        >
          <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.85} aria-hidden />
          <span className="safe-button-label">{t('admin.modules.offers.detailPage.openExternal')}</span>
        </a>
      ) : null}
      {onEdit ? (
        <button
          type="button"
          className={`${DETAILS_PRIMARY_BUTTON} inline-flex items-center justify-center gap-2`}
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="safe-button-label">{t('admin.common.actions.edit')}</span>
        </button>
      ) : null}
    </div>
  ) : null;

  return (
    <header
      className={`${DETAILS_SURFACE_CARD} box-border w-full min-w-0 max-w-full overflow-hidden px-4 py-5 sm:px-6 sm:py-6${
        isAdmin ? ' offer-detail-page__header offer-detail-page__header--admin' : ''
      }`}
    >
      {backTo && backLabel ? (
        <div className="offer-detail-page__header-back">
          <Link to={backTo} className={`offer-detail-page__back-btn ${controlClassName} group`}>
            <span className="offer-detail-page__back-btn-icon" aria-hidden>
              <BackIcon
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
                strokeWidth={2.25}
              />
            </span>
            <span className="min-w-0 break-words">{backLabel}</span>
          </Link>
        </div>
      ) : null}

      <div
        className={
          isAdmin
            ? 'flex w-full min-w-0 items-start gap-3.5 sm:gap-4'
            : 'flex w-full min-w-0 items-start justify-between gap-3 sm:gap-6'
        }
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
            <OfferCompanyLogo
              url={offer.companyLogoUrl}
              companyName={offer.company}
              size="detail"
            />

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className={isAdmin ? 'offer-detail-page__title-row' : undefined}>
                <h1
                  className={`${isAdmin ? 'offer-detail-page__title ' : ''}safe-card-title m-0 min-w-0 text-2xl font-semibold leading-tight tracking-tight text-[var(--admin-text)] sm:text-[1.75rem]`}
                >
                  <SafeText as="span">{offer.title}</SafeText>
                </h1>

                {isAdmin && hasAdminBadges ? (
                  <div className="offer-detail-page__status-badges">
                    {adminPublicationStatus ? (
                      <span className={adminBadgeClass(adminStatusBadgeVariant)}>
                        {adminPublicationStatus}
                      </span>
                    ) : null}
                    {adminUiStatusLabel ? (
                      <span className={adminBadgeClass(adminUiStatusBadgeVariant)}>{adminUiStatusLabel}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div
                className={`${isAdmin ? 'offer-detail-page__meta ' : ''}flex min-w-0 flex-wrap items-center ${isAdmin ? 'gap-x-2' : 'gap-x-3'} gap-y-1.5 text-sm text-[var(--admin-text-secondary)]`}
              >
                <span className={metaChipClass}>
                  <Building2 className={`${metaIconClass} shrink-0 opacity-70`} strokeWidth={1.75} aria-hidden />
                  <SafeText className="text-[inherit]">{offer.company}</SafeText>
                </span>
                <span
                  className="hidden h-1 w-1 shrink-0 rounded-full bg-[var(--admin-text-muted)] sm:inline-block"
                  aria-hidden
                />
                <span className={metaChipClass}>
                  <MapPin className={`${metaIconClass} shrink-0 opacity-70`} strokeWidth={1.75} aria-hidden />
                  <SafeText className="text-[inherit]">{offer.location}</SafeText>
                </span>
              </div>

              {headerTags.length ? (
                <div className="flex w-full min-w-0 flex-wrap gap-1.5 pt-0.5">
                  {headerTags.map((tag) => (
                    <SafeBadge key={tag} className={DETAILS_TAG_PRIMARY}>
                      {tag}
                    </SafeBadge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {studentActions}
        </div>

        {!isAdmin ? (
          <StudentMatchScoreBadge
            percent={offer.matchPercent}
            label={t('student.internshipOffers.details.matchScore')}
            size="detail"
            className="shrink-0"
          />
        ) : null}
      </div>

      {adminActions}
    </header>
  );
};

export default InternshipOfferDetailsHeader;

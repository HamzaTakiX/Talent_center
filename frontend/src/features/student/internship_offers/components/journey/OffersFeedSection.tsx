import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, MapPin, Star } from 'lucide-react';
import OfferCompanyLogo from '../../../../admin/offres-stage/components/OfferCompanyLogo';
import type { JourneyOfferBrief } from '../../types/journeyTypes';
import { getInternshipOfferDetailsPath } from '../../constants/routes';
import { applicationStatusLabelKey } from '../../utils/applicationStatus';
import { formatJourneyDate } from '../../utils/applicationStatus';

interface OffersFeedSectionProps {
  title: string;
  offers: JourneyOfferBrief[];
  emptyMessage?: string;
}

const OffersFeedSection: FunctionComponent<OffersFeedSectionProps> = ({
  title,
  offers,
  emptyMessage,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (offers.length === 0 && !emptyMessage) return null;

  return (
    <section className="flex w-full min-w-0 flex-col gap-3">
      <h2 className="m-0 text-base font-semibold text-[var(--admin-text)] sm:text-lg">{title}</h2>

      {offers.length === 0 ? (
        <p className="m-0 text-sm text-[var(--admin-text-muted)]">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {offers.map((offer) => (
            <article
              key={offer.uuid}
              className="admin-module-panel admin-panel-interactive flex min-w-0 cursor-pointer flex-col gap-3 p-4 transition-shadow hover:shadow-md"
              onClick={() => navigate(getInternshipOfferDetailsPath(offer.uuid))}
              onKeyDown={(e) => e.key === 'Enter' && navigate(getInternshipOfferDetailsPath(offer.uuid))}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <OfferCompanyLogo
                    url={offer.company_logo_url}
                    companyName={offer.company_name}
                    size="card"
                  />
                  <div className="min-w-0 flex-1">
                  <h3 className="m-0 truncate text-base font-semibold text-[var(--admin-text)]">
                    {offer.title}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--admin-text-secondary)]">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                      {offer.company_name}
                    </span>
                    {offer.location_city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                        {offer.location_city}
                      </span>
                    )}
                  </div>
                </div>
                </div>
                {offer.match_score != null && offer.match_score > 0 && (
                  <div className="shrink-0 text-center">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                      <span className="text-lg font-bold tabular-nums text-[var(--admin-text)]">
                        {Math.round(offer.match_score)}%
                      </span>
                    </div>
                    <span className="text-[10px] font-medium uppercase text-[var(--admin-text-muted)]">
                      {t('student.internshipOffers.match')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--admin-text-muted)]">
                <span className="rounded-md bg-[var(--admin-surface-inset)] px-2 py-0.5 font-medium uppercase">
                  {offer.offer_type}
                </span>
                {offer.application_deadline && (
                  <span>
                    {t('student.internshipOffers.journey.deadline')}: {formatJourneyDate(offer.application_deadline)}
                  </span>
                )}
                {offer.application_status && (
                  <span className="font-semibold text-[var(--admin-brand)]">
                    {t(applicationStatusLabelKey(offer.application_status))}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OffersFeedSection;

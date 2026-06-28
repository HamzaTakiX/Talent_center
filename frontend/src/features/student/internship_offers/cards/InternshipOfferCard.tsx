import { FunctionComponent } from 'react';

import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { Building2, MapPin } from 'lucide-react';

import OfferCompanyLogo from '../../../admin/offres-stage/components/OfferCompanyLogo';
import StudentMatchScoreBadge from '../../components/StudentMatchScoreBadge';
import { getInternshipOfferDetailsPath } from '../constants/routes';

import type { InternshipOffer } from '../types';

import {

  STUDENT_SURFACE_CARD_INTERACTIVE,

  STUDENT_TEXT_PRIMARY,

  STUDENT_TEXT_SECONDARY,

  STUDENT_TEXT_MUTED,

} from '../constants/internshipOffersStyles';

import { STUDENT_CARD_CTA_BTN } from '../../../../design-system/platformTokens';

import { SafeBadge, SafeText } from '../../../../design-system/safeContent';



interface InternshipOfferCardProps {

  offer: InternshipOffer;

}



const InternshipOfferCard: FunctionComponent<InternshipOfferCardProps> = ({ offer }) => {

  const navigate = useNavigate();

  const { t } = useTranslation();

  const distanceLabel = offer.isRemote
    ? t('student.internshipOffers.remote')
    : offer.distanceKm != null
      ? t('student.internshipOffers.distanceAway', { km: offer.distanceKm })
      : null;

  return (
    <article
      className={`student-internship-offer-card ${STUDENT_SURFACE_CARD_INTERACTIVE} box-border flex w-full min-w-0 max-w-full flex-col items-start gap-5 overflow-hidden px-4 pb-4 pt-5 max-[429px]:gap-4 sm:gap-6 sm:px-[21px] sm:pb-4 sm:pt-[21px]`}
    >

      <div className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">

        <div className="flex min-w-0 flex-1 flex-col gap-2">

          <div className="flex w-full min-w-0 items-center gap-3">
            <OfferCompanyLogo
              url={offer.companyLogoUrl}
              companyName={offer.company}
              size="card"
            />

            <h3 className={`safe-card-title m-0 min-w-0 flex-1 text-base leading-[27px] sm:text-[18px] ${STUDENT_TEXT_PRIMARY}`}>
              <SafeText as="span">{offer.title}</SafeText>
            </h3>
          </div>

          <div className={`student-internship-offer-card__meta flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 pl-[3.5rem] text-[14px] leading-5 ${STUDENT_TEXT_SECONDARY}`}>

            <Building2 className={`h-4 w-4 shrink-0 ${STUDENT_TEXT_SECONDARY}`} strokeWidth={1.75} aria-hidden />

            <SafeText className="text-[inherit]">{offer.company}</SafeText>

            <span className={`shrink-0 ${STUDENT_TEXT_MUTED}`}>•</span>

            <SafeText className="text-[inherit]">{offer.location}</SafeText>

            {distanceLabel ? (
              <>
                <span className={`shrink-0 ${STUDENT_TEXT_MUTED}`}>•</span>
                <span className="inline-flex items-center gap-1 text-[inherit]">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--admin-brand)]" aria-hidden />
                  <SafeText className="text-[inherit]">{distanceLabel}</SafeText>
                </span>
              </>
            ) : null}

          </div>

          <div className="student-internship-offer-card__tags flex w-full min-w-0 flex-wrap gap-2 pl-[3.5rem]">

            {offer.tags.map((tag) => (

              <SafeBadge key={tag} className="admin-badge admin-badge--info">

                {tag}

              </SafeBadge>

            ))}

          </div>

        </div>



        <StudentMatchScoreBadge
          percent={offer.matchPercent}
          label={t('student.internshipOffers.match')}
          className="shrink-0 self-end sm:self-auto"
        />

      </div>



      <footer className="student-internship-offer-card__footer w-full">
        <button
          type="button"
          className={STUDENT_CARD_CTA_BTN}
          onClick={() => navigate(getInternshipOfferDetailsPath(offer.id))}
        >
          <span className="safe-button-label">{t('student.internshipOffers.viewDetails')}</span>
        </button>
      </footer>

    </article>

  );

};



export default InternshipOfferCard;


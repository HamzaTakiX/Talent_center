import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Star } from 'lucide-react';
import { getInternshipOfferApplyPath } from '../../constants/routes';
import type { InternshipOfferDetails } from '../../types';
import {
  DETAILS_OUTLINE_BUTTON,
  DETAILS_PRIMARY_BUTTON,
  DETAILS_SURFACE_CARD,
} from '../../constants/internshipOfferDetailsStyles';
import { DETAILS_TAG_PRIMARY } from '../../constants/internshipOfferDetailsStyles';
import { STUDENT_MATCH_SCORE } from '../../../design-system/studentSemanticStyles';

interface InternshipOfferDetailsHeaderProps {
  offer: InternshipOfferDetails;
}

const InternshipOfferDetailsHeader: FunctionComponent<InternshipOfferDetailsHeaderProps> = ({
  offer,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header
      className={`${DETAILS_SURFACE_CARD} box-border w-full min-w-0 max-w-full px-4 py-5 sm:px-6 sm:py-6`}
    >
      <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h1 className="m-0 min-w-0 break-words text-2xl font-semibold leading-8 tracking-tight text-[var(--admin-text)] sm:text-[28px] sm:leading-9">
            {offer.title}
          </h1>

          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[14px] leading-5 text-[var(--admin-text-secondary)]">
            <Building2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 break-words">{offer.company}</span>
            <span className="shrink-0 text-[var(--admin-text-muted)]">•</span>
            <span className="min-w-0 break-words">{offer.location}</span>
          </div>

          <div className="flex w-full flex-wrap gap-2">
            {offer.tags.map((tag) => (
              <span key={tag} className={DETAILS_TAG_PRIMARY}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className={`${STUDENT_MATCH_SCORE} self-start`}>
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" aria-hidden />
            <span className="text-2xl font-bold tabular-nums leading-8 text-[var(--admin-text)]">
              {offer.matchPercent}%
            </span>
          </div>
          <span className="student-match-score__label">{t('student.internshipOffers.details.matchScore')}</span>
        </div>
      </div>

      <div className="mt-5 flex w-full min-w-0 flex-col gap-3 sm:mt-6 sm:flex-row sm:gap-4">
        <button
          type="button"
          className={DETAILS_PRIMARY_BUTTON}
          onClick={() => navigate(getInternshipOfferApplyPath(offer.id))}
        >
          {t('student.internshipOffers.details.applyNow')}
        </button>
        <button type="button" className={DETAILS_OUTLINE_BUTTON}>
          {t('student.internshipOffers.details.askQuestion')}
        </button>
      </div>
    </header>
  );
};

export default InternshipOfferDetailsHeader;

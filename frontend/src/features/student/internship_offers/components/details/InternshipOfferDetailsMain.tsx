import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, User } from 'lucide-react';
import type { InternshipOfferDetails } from '../../types';
import {
  DETAILS_SECTION_TITLE,
  DETAILS_TAG_NEUTRAL,
  DETAILS_TAG_PRIMARY,
} from '../../constants/internshipOfferDetailsStyles';
import DetailsSectionCard from './DetailsSectionCard';

interface InternshipOfferDetailsMainProps {
  offer: InternshipOfferDetails;
}

const InternshipOfferDetailsMain: FunctionComponent<InternshipOfferDetailsMainProps> = ({
  offer,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <DetailsSectionCard>
        <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-3`}>{t('student.internshipOffers.details.about')}</h2>
        <p className="m-0 text-sm leading-6 text-[var(--admin-text-secondary)]">{offer.description}</p>
      </DetailsSectionCard>

      <DetailsSectionCard>
        <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-3`}>{t('student.internshipOffers.details.responsibilities')}</h2>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {offer.responsibilities.map((item) => (
            <li key={item} className="flex min-w-0 items-start gap-2.5 text-sm leading-6 text-[var(--admin-text-secondary)]">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-[#22c55e]"
                strokeWidth={2}
                aria-hidden
              />
              <span className="min-w-0 break-words">{item}</span>
            </li>
          ))}
        </ul>
      </DetailsSectionCard>

      <DetailsSectionCard>
        <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-3`}>{t('student.internshipOffers.details.profile')}</h2>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {offer.requiredProfile.map((item) => (
            <li key={item} className="flex min-w-0 items-start gap-2.5 text-sm leading-6 text-[var(--admin-text-secondary)]">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-[#155dfc]" strokeWidth={2} aria-hidden />
              <span className="min-w-0 break-words">{item}</span>
            </li>
          ))}
        </ul>
      </DetailsSectionCard>

      <DetailsSectionCard>
        <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-3`}>{t('student.internshipOffers.details.skills')}</h2>
        <div className="flex w-full flex-wrap gap-2">
          {offer.requiredSkills.map((skill) => (
            <span
              key={skill.label}
              className={skill.variant === 'primary' ? DETAILS_TAG_PRIMARY : DETAILS_TAG_NEUTRAL}
            >
              {skill.label}
            </span>
          ))}
        </div>
      </DetailsSectionCard>
    </div>
  );
};

export default InternshipOfferDetailsMain;

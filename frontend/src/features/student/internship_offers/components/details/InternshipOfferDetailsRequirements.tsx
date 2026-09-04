import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ListChecks, User } from 'lucide-react';
import type { InternshipOfferDetails } from '../../types';
import {
  DETAILS_SUBSECTION_LABEL,
  DETAILS_TAG_NEUTRAL,
  DETAILS_TAG_PRIMARY,
} from '../../constants/internshipOfferDetailsStyles';
import DetailsSectionCard from './DetailsSectionCard';
import DetailsSectionHeading from './DetailsSectionHeading';
import { SafeBadge, SafeClampText } from '../../../../../design-system/safeContent';

interface InternshipOfferDetailsRequirementsProps {
  offer: InternshipOfferDetails;
  className?: string;
}

const InternshipOfferDetailsRequirements: FunctionComponent<
  InternshipOfferDetailsRequirementsProps
> = ({ offer, className = '' }) => {
  const { t } = useTranslation();

  const hasSkills = offer.requiredSkills.length > 0 || offer.preferredSkills.length > 0;

  if (!offer.requirements && !hasSkills) {
    return null;
  }

  return (
    <DetailsSectionCard className={className}>
      <DetailsSectionHeading icon={ListChecks}>
        {t('student.internshipOffers.details.requirements')}
      </DetailsSectionHeading>

      <div className="flex min-h-0 flex-1 flex-col">
        {offer.requirements ? (
          <div className={hasSkills ? 'mb-4' : ''}>
            {offer.requiredProfile.length > 1 ? (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {offer.requiredProfile.map((item) => (
                  <li
                    key={item}
                    className="flex min-w-0 items-start gap-2.5 text-sm leading-relaxed text-[var(--admin-text-secondary)]"
                  >
                    <User
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-brand)]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <SafeClampText
                lines={5}
                className="text-sm leading-relaxed text-[var(--admin-text-secondary)]"
                expandLabel={t('student.internshipOffers.readMore', { defaultValue: 'Lire la suite' })}
                collapseLabel={t('student.internshipOffers.readLess', { defaultValue: 'Réduire' })}
              >
                {offer.requirements}
              </SafeClampText>
            )}
          </div>
        ) : null}

        {hasSkills ? (
          <div className="flex flex-col gap-4">
            {offer.requiredSkills.length ? (
              <div>
                <p className={DETAILS_SUBSECTION_LABEL}>
                  {t('student.internshipOffers.details.skills')}
                </p>
                <div className="flex w-full min-w-0 flex-wrap gap-1.5">
                  {offer.requiredSkills.map((skill) => (
                    <SafeBadge
                      key={skill.label}
                      className={
                        skill.variant === 'primary' ? DETAILS_TAG_PRIMARY : DETAILS_TAG_NEUTRAL
                      }
                    >
                      {skill.label}
                    </SafeBadge>
                  ))}
                </div>
              </div>
            ) : null}

            {offer.preferredSkills.length ? (
              <div>
                <p className={DETAILS_SUBSECTION_LABEL}>
                  {t('student.internshipOffers.details.preferredSkills')}
                </p>
                <div className="flex w-full min-w-0 flex-wrap gap-1.5">
                  {offer.preferredSkills.map((skill) => (
                    <SafeBadge key={skill} className={DETAILS_TAG_NEUTRAL}>
                      {skill}
                    </SafeBadge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Remplit le bas pour égaliser la hauteur avec Key Information */}
        <div className="min-h-[1rem] flex-1" aria-hidden />
      </div>
    </DetailsSectionCard>
  );
};

export default InternshipOfferDetailsRequirements;

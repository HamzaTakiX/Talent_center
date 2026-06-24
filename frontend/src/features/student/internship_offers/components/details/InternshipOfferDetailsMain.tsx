import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, User } from 'lucide-react';
import type { InternshipOfferDetails } from '../../types';
import {
  DETAILS_PAGE_SECTION_GAP,
  DETAILS_SECTION_TITLE,
  DETAILS_SUBSECTION_LABEL,
  DETAILS_TAG_NEUTRAL,
  DETAILS_TAG_PRIMARY,
} from '../../constants/internshipOfferDetailsStyles';
import DetailsSectionCard from './DetailsSectionCard';
import { SafeBadge, SafeClampText } from '../../../../../design-system/safeContent';

interface InternshipOfferDetailsMainProps {
  offer: InternshipOfferDetails;
}

const InternshipOfferDetailsMain: FunctionComponent<InternshipOfferDetailsMainProps> = ({
  offer,
}) => {
  const { t } = useTranslation();

  const hasSkills = offer.requiredSkills.length > 0 || offer.preferredSkills.length > 0;
  const hasPerks = Boolean(offer.benefits || offer.learningOpportunities);

  return (
    <div className={DETAILS_PAGE_SECTION_GAP}>
      {offer.description ? (
        <DetailsSectionCard>
          <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-3`}>
            {t('student.internshipOffers.details.about')}
          </h2>
          <SafeClampText
            lines={5}
            className="text-sm leading-relaxed text-[var(--admin-text-secondary)]"
            expandLabel={t('student.internshipOffers.readMore', { defaultValue: 'Lire la suite' })}
            collapseLabel={t('student.internshipOffers.readLess', { defaultValue: 'Réduire' })}
          >
            {offer.description}
          </SafeClampText>
        </DetailsSectionCard>
      ) : null}

      {offer.responsibilities.length ? (
        <DetailsSectionCard>
          <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-3`}>
            {t('student.internshipOffers.details.responsibilities')}
          </h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {offer.responsibilities.map((item) => (
              <li
                key={item}
                className="flex min-w-0 items-start gap-2.5 text-sm leading-relaxed text-[var(--admin-text-secondary)]"
              >
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="min-w-0 break-words">{item}</span>
              </li>
            ))}
          </ul>
        </DetailsSectionCard>
      ) : null}

      {offer.requirements || hasSkills ? (
        <DetailsSectionCard>
          <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-4`}>
            {t('student.internshipOffers.details.requirements')}
          </h2>

          {offer.requirements ? (
            <div className={hasSkills ? 'mb-5' : ''}>
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
        </DetailsSectionCard>
      ) : null}

      {hasPerks ? (
        <DetailsSectionCard>
          {offer.benefits ? (
            <div className={offer.learningOpportunities ? 'mb-5' : ''}>
              <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-3`}>
                {t('student.internshipOffers.details.benefits')}
              </h2>
              <SafeClampText
                lines={4}
                className="text-sm leading-relaxed text-[var(--admin-text-secondary)]"
                expandLabel={t('student.internshipOffers.readMore', { defaultValue: 'Lire la suite' })}
                collapseLabel={t('student.internshipOffers.readLess', { defaultValue: 'Réduire' })}
              >
                {offer.benefits}
              </SafeClampText>
            </div>
          ) : null}

          {offer.learningOpportunities ? (
            <div>
              <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-3`}>
                {t('student.internshipOffers.details.learningOpportunities')}
              </h2>
              <SafeClampText
                lines={4}
                className="text-sm leading-relaxed text-[var(--admin-text-secondary)]"
                expandLabel={t('student.internshipOffers.readMore', { defaultValue: 'Lire la suite' })}
                collapseLabel={t('student.internshipOffers.readLess', { defaultValue: 'Réduire' })}
              >
                {offer.learningOpportunities}
              </SafeClampText>
            </div>
          ) : null}
        </DetailsSectionCard>
      ) : null}
    </div>
  );
};

export default InternshipOfferDetailsMain;

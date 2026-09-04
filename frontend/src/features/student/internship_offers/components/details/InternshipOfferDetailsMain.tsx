import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Gift, Lightbulb, ListTodo } from 'lucide-react';
import type { InternshipOfferDetails } from '../../types';
import { DETAILS_PAGE_SECTION_GAP } from '../../constants/internshipOfferDetailsStyles';
import DetailsSectionCard from './DetailsSectionCard';
import DetailsSectionHeading from './DetailsSectionHeading';
import InternshipOfferDetailsAbout from './InternshipOfferDetailsAbout';
import InternshipOfferDetailsRequirements from './InternshipOfferDetailsRequirements';
import { SafeClampText } from '../../../../../design-system/safeContent';

interface InternshipOfferDetailsMainProps {
  offer: InternshipOfferDetails;
  /** Affiche About dans le flux principal (admin). Student le place sur la 1re ligne. */
  showAbout?: boolean;
  /** Affiche Requirements dans le flux principal (admin). Student le place à côté de Key Info. */
  showRequirements?: boolean;
}

const InternshipOfferDetailsMain: FunctionComponent<InternshipOfferDetailsMainProps> = ({
  offer,
  showAbout = true,
  showRequirements = true,
}) => {
  const { t } = useTranslation();

  const hasPerks = Boolean(offer.benefits || offer.learningOpportunities);
  const hasResponsibilities = offer.responsibilities.length > 0;
  const showAboutBlock = showAbout && Boolean(offer.description);
  const hasRequirementsContent =
    Boolean(offer.requirements) ||
    offer.requiredSkills.length > 0 ||
    offer.preferredSkills.length > 0;
  const showRequirementsBlock = showRequirements && hasRequirementsContent;

  if (!showAboutBlock && !hasResponsibilities && !showRequirementsBlock && !hasPerks) {
    return null;
  }

  return (
    <div className={DETAILS_PAGE_SECTION_GAP}>
      {showAboutBlock ? <InternshipOfferDetailsAbout offer={offer} /> : null}

      {hasResponsibilities ? (
        <DetailsSectionCard>
          <DetailsSectionHeading icon={ListTodo} className="mb-3">
            {t('student.internshipOffers.details.responsibilities')}
          </DetailsSectionHeading>
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

      {showRequirementsBlock ? <InternshipOfferDetailsRequirements offer={offer} /> : null}

      {hasPerks ? (
        <DetailsSectionCard>
          {offer.benefits ? (
            <div className={offer.learningOpportunities ? 'mb-5' : ''}>
              <DetailsSectionHeading icon={Gift} className="mb-3">
                {t('student.internshipOffers.details.benefits')}
              </DetailsSectionHeading>
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
              <DetailsSectionHeading icon={Lightbulb} className="mb-3">
                {t('student.internshipOffers.details.learningOpportunities')}
              </DetailsSectionHeading>
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

import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Globe, GraduationCap, MapPin, Wallet } from 'lucide-react';
import type { InternshipOfferDetails } from '../../types';
import { DETAILS_SECTION_TITLE } from '../../constants/internshipOfferDetailsStyles';
import DetailsSectionCard from './DetailsSectionCard';

interface InternshipOfferDetailsKeyFactsProps {
  offer: InternshipOfferDetails;
}

const InternshipOfferDetailsKeyFacts: FunctionComponent<InternshipOfferDetailsKeyFactsProps> = ({
  offer,
}) => {
  const { t } = useTranslation();

  const facts = useMemo(() => {
    const items: { icon: typeof Calendar; label: string; value: string }[] = [];

    if (offer.applicationDeadline) {
      items.push({
        icon: Calendar,
        label: t('student.internshipOffers.details.deadline'),
        value: offer.applicationDeadline,
      });
    }
    if (offer.startDate) {
      items.push({
        icon: Calendar,
        label: t('student.internshipOffers.details.startDate'),
        value: offer.startDate,
      });
    }
    if (offer.endDate) {
      items.push({
        icon: Calendar,
        label: t('student.internshipOffers.details.endDate'),
        value: offer.endDate,
      });
    }
    if (offer.durationMonths) {
      items.push({
        icon: Clock,
        label: t('student.internshipOffers.details.duration'),
        value: t('student.internshipOffers.details.durationMonths', { count: offer.durationMonths }),
      });
    }
    if (offer.workMode) {
      items.push({
        icon: MapPin,
        label: t('student.internshipOffers.details.workMode'),
        value: t(`student.internshipOffers.details.workModeValues.${offer.workMode}`),
      });
    }
    if (offer.internshipType) {
      items.push({
        icon: GraduationCap,
        label: t('student.internshipOffers.details.internshipType'),
        value: offer.internshipType,
      });
    }
    if (offer.compensation) {
      items.push({
        icon: Wallet,
        label: t('student.internshipOffers.details.compensation'),
        value: offer.compensation,
      });
    }
    if (offer.languages.length) {
      items.push({
        icon: Globe,
        label: t('student.internshipOffers.details.languages'),
        value: offer.languages.join(', '),
      });
    }
    if (offer.minEducationLevel) {
      items.push({
        icon: GraduationCap,
        label: t('student.internshipOffers.details.minEducation'),
        value: offer.minEducationLevel,
      });
    }

    return items;
  }, [offer, t]);

  if (!facts.length) return null;

  return (
    <DetailsSectionCard>
      <h2 className={`${DETAILS_SECTION_TITLE} m-0 mb-4`}>
        {t('student.internshipOffers.details.keyInfo')}
      </h2>
      <dl className="m-0 grid grid-cols-1 gap-3 p-0 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3.5 lg:grid-cols-1">
        {facts.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex min-w-0 items-start gap-2.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input-bg)]/50 px-3 py-2.5"
          >
            <Icon
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-brand)]"
              strokeWidth={1.75}
              aria-hidden
            />
            <div className="min-w-0">
              <dt className="m-0 text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                {label}
              </dt>
              <dd className="m-0 mt-0.5 text-sm font-medium leading-snug text-[var(--admin-text)]">
                {value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </DetailsSectionCard>
  );
};

export default InternshipOfferDetailsKeyFacts;

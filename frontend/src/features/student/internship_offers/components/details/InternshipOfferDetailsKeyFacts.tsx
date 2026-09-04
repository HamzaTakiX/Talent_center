import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Globe, GraduationCap, Info, MapPin, Wallet } from 'lucide-react';
import type { InternshipOfferDetails } from '../../types';
import DetailsSectionCard from './DetailsSectionCard';
import DetailsSectionHeading from './DetailsSectionHeading';

interface InternshipOfferDetailsKeyFactsProps {
  offer: InternshipOfferDetails;
  className?: string;
}

const InternshipOfferDetailsKeyFacts: FunctionComponent<InternshipOfferDetailsKeyFactsProps> = ({
  offer,
  className = '',
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
    <DetailsSectionCard className={className}>
      <DetailsSectionHeading icon={Info}>
        {t('student.internshipOffers.details.keyInfo')}
      </DetailsSectionHeading>
      <dl className="m-0 grid min-h-0 flex-1 grid-cols-1 content-start gap-3 p-0">
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

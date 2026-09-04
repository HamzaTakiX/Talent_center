import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import type { InternshipOfferDetails } from '../../types';
import DetailsSectionCard from './DetailsSectionCard';
import DetailsSectionHeading from './DetailsSectionHeading';
import { SafeClampText } from '../../../../../design-system/safeContent';

interface InternshipOfferDetailsAboutProps {
  offer: InternshipOfferDetails;
  className?: string;
}

const InternshipOfferDetailsAbout: FunctionComponent<InternshipOfferDetailsAboutProps> = ({
  offer,
  className = '',
}) => {
  const { t } = useTranslation();

  if (!offer.description) {
    return null;
  }

  return (
    <DetailsSectionCard className={className}>
      <DetailsSectionHeading icon={FileText} className="mb-3">
        {t('student.internshipOffers.details.about')}
      </DetailsSectionHeading>
      <div className="flex min-h-0 flex-1 flex-col">
        <SafeClampText
          lines={5}
          className="text-sm leading-relaxed text-[var(--admin-text-secondary)]"
          expandLabel={t('student.internshipOffers.readMore', { defaultValue: 'Lire la suite' })}
          collapseLabel={t('student.internshipOffers.readLess', { defaultValue: 'Réduire' })}
        >
          {offer.description}
        </SafeClampText>
      </div>
    </DetailsSectionCard>
  );
};

export default InternshipOfferDetailsAbout;

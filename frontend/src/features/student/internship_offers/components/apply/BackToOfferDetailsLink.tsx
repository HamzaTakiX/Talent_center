import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { INTERNSHIP_OFFERS_BACK_LINK } from '../../constants/internshipOffersStyles';
import { getInternshipOfferDetailsPath } from '../../constants/routes';

interface BackToOfferDetailsLinkProps {
  offerId: string;
}

const BackToOfferDetailsLink: FunctionComponent<BackToOfferDetailsLinkProps> = ({ offerId }) => {
  const { t } = useTranslation();

  return (
    <Link to={getInternshipOfferDetailsPath(offerId)} className={INTERNSHIP_OFFERS_BACK_LINK}>
      <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      <span className="min-w-0 break-words">{t('student.internshipOffers.backToOfferDetails')}</span>
    </Link>
  );
};

export default BackToOfferDetailsLink;

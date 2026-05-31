import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { INTERNSHIP_OFFERS_BACK_LINK } from '../../constants/internshipOffersStyles';
import { getInternshipOfferApplyPath } from '../../constants/routes';

interface BackToApplicationLinkProps {
  offerId: string;
}

const BackToApplicationLink: FunctionComponent<BackToApplicationLinkProps> = ({ offerId }) => {
  const { t } = useTranslation();

  return (
    <Link to={getInternshipOfferApplyPath(offerId)} className={INTERNSHIP_OFFERS_BACK_LINK}>
      <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      <span className="min-w-0 break-words">{t('student.internshipOffers.backToApplication')}</span>
    </Link>
  );
};

export default BackToApplicationLink;

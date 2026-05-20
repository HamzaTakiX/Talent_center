import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { INTERNSHIP_OFFERS_BACK_LINK } from '../../constants/internshipOffersStyles';
import { getInternshipOfferDetailsPath } from '../../constants/routes';

interface BackToOfferDetailsLinkProps {
  offerId: string;
}

const BackToOfferDetailsLink: FunctionComponent<BackToOfferDetailsLinkProps> = ({ offerId }) => {
  return (
    <Link to={getInternshipOfferDetailsPath(offerId)} className={INTERNSHIP_OFFERS_BACK_LINK}>
      <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      <span className="min-w-0 break-words">Back to Offer Details</span>
    </Link>
  );
};

export default BackToOfferDetailsLink;

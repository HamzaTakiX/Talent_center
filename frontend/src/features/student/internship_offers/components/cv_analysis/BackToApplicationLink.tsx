import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { INTERNSHIP_OFFERS_BACK_LINK } from '../../constants/internshipOffersStyles';
import { getInternshipOfferApplyPath } from '../../constants/routes';

interface BackToApplicationLinkProps {
  offerId: string;
}

const BackToApplicationLink: FunctionComponent<BackToApplicationLinkProps> = ({ offerId }) => {
  return (
    <Link to={getInternshipOfferApplyPath(offerId)} className={INTERNSHIP_OFFERS_BACK_LINK}>
      <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      <span className="min-w-0 break-words">Back to Application</span>
    </Link>
  );
};

export default BackToApplicationLink;

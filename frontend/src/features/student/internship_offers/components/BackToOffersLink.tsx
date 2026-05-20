import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { INTERNSHIP_OFFERS_BACK_LINK } from '../constants/internshipOffersStyles';
import { STUDENT_ALL_INTERNSHIP_OFFERS_PATH } from '../constants/routes';

const BackToOffersLink: FunctionComponent = () => {
  return (
    <Link to={STUDENT_ALL_INTERNSHIP_OFFERS_PATH} className={INTERNSHIP_OFFERS_BACK_LINK}>
      <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      <span className="min-w-0 break-words">Back to All Offers</span>
    </Link>
  );
};

export default BackToOffersLink;

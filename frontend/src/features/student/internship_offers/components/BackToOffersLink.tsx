import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentBackNavLink from './StudentBackNavLink';
import { STUDENT_ALL_INTERNSHIP_OFFERS_PATH } from '../constants/routes';

interface BackToOffersLinkProps {
  label?: string;
  to?: string;
}

const BackToOffersLink: FunctionComponent<BackToOffersLinkProps> = ({
  label,
  to = STUDENT_ALL_INTERNSHIP_OFFERS_PATH,
}) => {
  const { t } = useTranslation();

  return (
    <StudentBackNavLink
      to={to}
      label={label ?? t('student.internshipOffers.backToOffers')}
    />
  );
};

export default BackToOffersLink;

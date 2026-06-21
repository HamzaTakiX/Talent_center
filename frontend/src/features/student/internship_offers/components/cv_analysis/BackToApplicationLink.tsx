import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentBackNavLink from '../StudentBackNavLink';
import { getInternshipOfferApplyPath } from '../../constants/routes';

interface BackToApplicationLinkProps {
  offerId: string;
}

const BackToApplicationLink: FunctionComponent<BackToApplicationLinkProps> = ({ offerId }) => {
  const { t } = useTranslation();

  return (
    <StudentBackNavLink
      to={getInternshipOfferApplyPath(offerId)}
      label={t('student.internshipOffers.backToApplication')}
    />
  );
};

export default BackToApplicationLink;

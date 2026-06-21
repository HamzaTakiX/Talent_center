import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentBackNavLink from '../StudentBackNavLink';
import { getInternshipOfferDetailsPath } from '../../constants/routes';

interface BackToOfferDetailsLinkProps {
  offerId: string;
}

const BackToOfferDetailsLink: FunctionComponent<BackToOfferDetailsLinkProps> = ({ offerId }) => {
  const { t } = useTranslation();

  return (
    <StudentBackNavLink
      to={getInternshipOfferDetailsPath(offerId)}
      label={t('student.internshipOffers.backToOfferDetails')}
    />
  );
};

export default BackToOfferDetailsLink;

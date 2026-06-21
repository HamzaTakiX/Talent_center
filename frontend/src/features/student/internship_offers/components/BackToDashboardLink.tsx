import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentBackNavLink from './StudentBackNavLink';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../constants/routes';

const BackToDashboardLink: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <StudentBackNavLink
      to={STUDENT_INTERNSHIP_OFFERS_PATH}
      label={t('student.internshipOffers.backToDashboard')}
    />
  );
};

export default BackToDashboardLink;

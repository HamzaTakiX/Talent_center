import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../../components/StudentLayout';
import { INTERNSHIP_OFFERS_PAGE_ROOT } from '../../constants/internshipOffersLayout';

/** Simulateur d'entretien — en attente d'API backend dédiée. */
const InterviewSimulatorMain: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <StudentLayout>
      <article className={`${INTERNSHIP_OFFERS_PAGE_ROOT} px-4 py-12 text-center`}>
        <h1 className="text-xl font-semibold text-[var(--admin-text)]">
          {t('student.internshipOffers.interviewSimulator.title', 'Simulateur d\'entretien')}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--admin-text-secondary)]">
          Cette fonctionnalité nécessite une connexion au service backend d&apos;entretiens simulés.
          Les sessions seront chargées depuis la base de données lorsque l&apos;endpoint sera disponible.
        </p>
      </article>
    </StudentLayout>
  );
};

export default InterviewSimulatorMain;

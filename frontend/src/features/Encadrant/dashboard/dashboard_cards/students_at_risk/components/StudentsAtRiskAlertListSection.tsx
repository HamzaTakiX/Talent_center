import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  STUDENTS_AT_RISK_ALERT_LIST,
  STUDENTS_AT_RISK_SECTION_CARD,
} from '../constants/studentsAtRiskLayout';
import { studentsAtRiskAlertsMock } from '../data';
import StudentsAtRiskAlertCard from './StudentsAtRiskAlertCard';

const StudentsAtRiskAlertListSection: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <section
      className={STUDENTS_AT_RISK_SECTION_CARD}
      aria-label={t('encadrant.dashboard.atRisk.alertList')}
    >
      <header className="flex min-w-0 flex-col gap-1">
        <h2 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
          {t('encadrant.dashboard.atRisk.alertList')}
        </h2>
        <p className="m-0 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
          {t('encadrant.dashboard.studentsAtRisk')}
        </p>
      </header>

      <div className={STUDENTS_AT_RISK_ALERT_LIST}>
        {studentsAtRiskAlertsMock.map((alert) => (
          <StudentsAtRiskAlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </section>
  );
};

export default StudentsAtRiskAlertListSection;

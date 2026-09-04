import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { StudentsAtRiskAlertListSection, StudentsAtRiskSummaryGrid } from '../components';
import { STUDENTS_AT_RISK_PAGE_ROOT } from '../constants/studentsAtRiskLayout';

const StudentsAtRiskPage: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <EncadrantLayout>
      <div id="encadrant-students-at-risk-root" className={STUDENTS_AT_RISK_PAGE_ROOT}>
        <header className="flex min-w-0 flex-col gap-1">
          <h1 className="m-0 text-xl font-semibold leading-7 tracking-tight text-[var(--admin-text)] sm:text-2xl">
            {t('encadrant.header.titles.studentsAtRisk')}
          </h1>
          <p className="m-0 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
            {t('encadrant.dashboard.studentsAtRisk')}
          </p>
        </header>

        <StudentsAtRiskSummaryGrid />
        <StudentsAtRiskAlertListSection />
      </div>
    </EncadrantLayout>
  );
};

export default StudentsAtRiskPage;

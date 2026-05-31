import { FunctionComponent } from 'react';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { StudentsAtRiskAlertListSection, StudentsAtRiskSummaryGrid } from '../components';
import { STUDENTS_AT_RISK_PAGE_ROOT } from '../constants/studentsAtRiskLayout';

const StudentsAtRiskPage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Students at Risk" headerSubtitle="Encadrant Portal">
    <div id="encadrant-students-at-risk-root" className={STUDENTS_AT_RISK_PAGE_ROOT}>
      <header className="flex min-w-0 flex-col gap-1">
        <h1 className="m-0 text-xl font-semibold leading-7 tracking-tight text-[#171717] sm:text-2xl">
          Students at Risk
        </h1>
        <p className="m-0 text-sm font-normal leading-5 text-[#717182]">
          Students requiring immediate attention
        </p>
      </header>

      <StudentsAtRiskSummaryGrid />
      <StudentsAtRiskAlertListSection />
    </div>
  </EncadrantLayout>
);

export default StudentsAtRiskPage;

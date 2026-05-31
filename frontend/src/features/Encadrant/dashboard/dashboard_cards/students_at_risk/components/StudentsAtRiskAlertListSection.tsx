import { FunctionComponent } from 'react';
import { STUDENTS_AT_RISK_ALERT_LIST, STUDENTS_AT_RISK_SECTION_CARD } from '../constants/studentsAtRiskLayout';
import { studentsAtRiskAlertsMock } from '../data';
import StudentsAtRiskAlertCard from './StudentsAtRiskAlertCard';

const StudentsAtRiskAlertListSection: FunctionComponent = () => (
  <section className={STUDENTS_AT_RISK_SECTION_CARD} aria-label="Alert list">
    <header className="flex min-w-0 flex-col gap-1">
      <h2 className="m-0 text-base font-semibold leading-6 text-[#171717] sm:text-lg">Alert List</h2>
      <p className="m-0 text-sm font-normal leading-5 text-[#717182]">
        Students requiring attention with detailed risk factors
      </p>
    </header>

    <div className={STUDENTS_AT_RISK_ALERT_LIST}>
      {studentsAtRiskAlertsMock.map((alert) => (
        <StudentsAtRiskAlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  </section>
);

export default StudentsAtRiskAlertListSection;

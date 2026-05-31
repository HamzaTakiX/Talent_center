import { FunctionComponent } from 'react';
import { REPORTS_PENDING_SECTION_CARD } from '../constants/reportsPendingLayout';
import ReportsPendingMobileList from './ReportsPendingMobileList';
import ReportsPendingTable from './ReportsPendingTable';

const ReportsPendingListSection: FunctionComponent = () => (
  <section className={REPORTS_PENDING_SECTION_CARD} aria-label="Pending reports list">
    <header className="flex min-w-0 flex-col gap-1">
      <h2 className="m-0 text-base font-semibold leading-6 text-[#171717] sm:text-lg">
        Pending Reports List
      </h2>
      <p className="m-0 text-sm font-normal leading-5 text-[#717182]">
        Monitor and manage student report submissions
      </p>
    </header>

    <ReportsPendingTable />
    <ReportsPendingMobileList />
  </section>
);

export default ReportsPendingListSection;

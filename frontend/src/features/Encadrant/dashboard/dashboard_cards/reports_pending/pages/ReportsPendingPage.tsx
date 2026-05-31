import { FunctionComponent } from 'react';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { ReportsPendingListSection, ReportsPendingSummaryGrid } from '../components';
import { REPORTS_PENDING_PAGE_ROOT } from '../constants/reportsPendingLayout';

const ReportsPendingPage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Reports Pending" headerSubtitle="Encadrant Portal">
    <div id="encadrant-reports-pending-root" className={REPORTS_PENDING_PAGE_ROOT}>
      <header className="flex min-w-0 flex-col gap-1">
        <h1 className="m-0 text-xl font-semibold leading-7 tracking-tight text-[#171717] sm:text-2xl">
          Reports Pending
        </h1>
        <p className="m-0 text-sm font-normal leading-5 text-[#717182]">
          Reports requiring review and validation
        </p>
      </header>

      <ReportsPendingSummaryGrid />
      <ReportsPendingListSection />
    </div>
  </EncadrantLayout>
);

export default ReportsPendingPage;

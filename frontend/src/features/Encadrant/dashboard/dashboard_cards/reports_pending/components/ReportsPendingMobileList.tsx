import { FunctionComponent } from 'react';
import {
  REPORTS_PENDING_MOBILE_CARD,
  REPORTS_PENDING_MOBILE_LABEL,
  REPORTS_PENDING_MOBILE_LIST,
  REPORTS_PENDING_MOBILE_ROW,
} from '../constants/reportsPendingLayout';
import { reportsPendingRowsMock } from '../data';
import ReportsPendingDeadlineCell from './ReportsPendingDeadlineCell';
import ReportsPendingRowActions from './ReportsPendingRowActions';
import ReportsPendingStatusBadge from './ReportsPendingStatusBadge';

const ReportsPendingMobileList: FunctionComponent = () => (
  <div className={REPORTS_PENDING_MOBILE_LIST}>
    {reportsPendingRowsMock.map((row) => (
      <article key={row.id} className={REPORTS_PENDING_MOBILE_CARD}>
        <div className={REPORTS_PENDING_MOBILE_ROW}>
          <div className="min-w-0 flex-1">
            <p className={REPORTS_PENDING_MOBILE_LABEL}>Student</p>
            <p className="m-0 text-sm font-semibold leading-5 text-[#171717]">{row.student}</p>
          </div>
          <ReportsPendingStatusBadge status={row.status} />
        </div>

        <div>
          <p className={REPORTS_PENDING_MOBILE_LABEL}>Report</p>
          <p className="m-0 text-sm font-normal leading-5 text-[#171717]">{row.report}</p>
        </div>

        <div>
          <p className={REPORTS_PENDING_MOBILE_LABEL}>Deadline</p>
          <ReportsPendingDeadlineCell deadline={row.deadline} lateNote={row.lateNote} />
        </div>

        <div>
          <p className={`${REPORTS_PENDING_MOBILE_LABEL} mb-2`}>Actions</p>
          <ReportsPendingRowActions />
        </div>
      </article>
    ))}
  </div>
);

export default ReportsPendingMobileList;

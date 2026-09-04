import { FunctionComponent } from 'react';
import type { PendingReportRow } from '../types';

interface ReportsPendingDeadlineCellProps {
  deadline: PendingReportRow['deadline'];
  lateNote?: PendingReportRow['lateNote'];
}

const ReportsPendingDeadlineCell: FunctionComponent<ReportsPendingDeadlineCellProps> = ({
  deadline,
  lateNote,
}) => (
  <div className="flex min-w-0 flex-col gap-0.5">
    <span className="text-sm font-normal leading-5 text-[var(--admin-text)] tabular-nums">{deadline}</span>
    {lateNote && (
      <span className="text-xs font-normal leading-4 text-[var(--admin-danger)]">{lateNote}</span>
    )}
  </div>
);

export default ReportsPendingDeadlineCell;

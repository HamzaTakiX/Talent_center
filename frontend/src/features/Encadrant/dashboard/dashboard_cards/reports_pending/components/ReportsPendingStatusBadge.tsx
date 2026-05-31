import { FunctionComponent } from 'react';
import { REPORTS_PENDING_STATUS_STYLES } from '../constants/reportsPendingStyles';
import type { PendingReportStatus } from '../types';

interface ReportsPendingStatusBadgeProps {
  status: PendingReportStatus;
}

const ReportsPendingStatusBadge: FunctionComponent<ReportsPendingStatusBadgeProps> = ({ status }) => {
  const styles = REPORTS_PENDING_STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-4 ${styles.badge}`}
    >
      {styles.label}
    </span>
  );
};

export default ReportsPendingStatusBadge;

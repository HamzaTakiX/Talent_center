import { FunctionComponent } from 'react';
import {
  REPORT_DETAIL_HEADER,
  REPORT_DETAIL_HEADER_MAIN,
  REPORT_DETAIL_STATUS_BADGE,
  REPORT_DETAIL_SUBTITLE,
  REPORT_DETAIL_TITLE,
} from '../constants/reportDetailLayout';
import { REPORTS_STATUS_STYLES } from '../constants/reportsStyles';
import type { StudentReportDetail } from '../types';

interface ReportsDetailHeaderProps {
  detail: StudentReportDetail;
}

const ReportsDetailHeader: FunctionComponent<ReportsDetailHeaderProps> = ({ detail }) => {
  const statusStyle = REPORTS_STATUS_STYLES[detail.status];

  return (
    <header className={REPORT_DETAIL_HEADER}>
      <div className={REPORT_DETAIL_HEADER_MAIN}>
        <h1 className={REPORT_DETAIL_TITLE}>Reports for {detail.name}</h1>
        <p className={REPORT_DETAIL_SUBTITLE}>
          {detail.level} • {detail.totalReports} reports total
        </p>
      </div>
      <span
        className={`${REPORT_DETAIL_STATUS_BADGE} ${statusStyle.badgeBg} ${statusStyle.badgeText}`}
      >
        {statusStyle.label}
      </span>
    </header>
  );
};

export default ReportsDetailHeader;

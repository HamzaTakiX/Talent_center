import { FunctionComponent } from 'react';
import { STUDENT_DETAIL_REPORT_ROW } from '../constants/studentDetailLayout';
import { STUDENT_REPORT_STATUS_STYLES } from '../constants/studentDetailStyles';
import type { StudentRecentReport } from '../types';

interface StudentDetailRecentReportRowProps {
  report: StudentRecentReport;
}

const StudentDetailRecentReportRow: FunctionComponent<StudentDetailRecentReportRowProps> = ({
  report,
}) => {
  const statusStyle = STUDENT_REPORT_STATUS_STYLES[report.status];

  return (
    <article className={STUDENT_DETAIL_REPORT_ROW}>
      <div className="min-w-0">
        <h4 className="m-0 break-words text-sm font-semibold leading-5 text-[#171717] sm:text-[15px]">
          {report.title}
        </h4>
        <p className="m-0 mt-1 text-sm font-normal leading-5 text-[#717182]">{report.date}</p>
      </div>
      <span
        className={`inline-flex w-fit shrink-0 items-center justify-self-start rounded-full px-2.5 py-1 text-xs font-medium leading-4 sm:justify-self-end ${statusStyle.badgeBg} ${statusStyle.badgeText}`}
      >
        {report.statusLabel}
      </span>
    </article>
  );
};

export default StudentDetailRecentReportRow;

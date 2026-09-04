import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { STUDENT_DETAIL_REPORT_ROW } from '../constants/studentDetailLayout';
import { STUDENT_REPORT_STATUS_STYLES } from '../constants/studentDetailStyles';
import type { StudentRecentReport } from '../types';

interface StudentDetailRecentReportRowProps {
  report: StudentRecentReport;
}

const StudentDetailRecentReportRow: FunctionComponent<StudentDetailRecentReportRowProps> = ({
  report,
}) => {
  const { t } = useTranslation();
  const statusStyle = STUDENT_REPORT_STATUS_STYLES[report.status];

  return (
    <article className={STUDENT_DETAIL_REPORT_ROW}>
      <div className="min-w-0">
        <h4 className="m-0 break-words text-sm font-semibold leading-5 text-[var(--admin-text)] sm:text-[15px]">
          {report.title}
        </h4>
        <p className="m-0 mt-1 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">{report.date}</p>
      </div>
      <span
        className={`${statusStyle.badge} shrink-0 justify-self-start sm:justify-self-end`}
      >
        {t(statusStyle.labelKey)}
      </span>
    </article>
  );
};

export default StudentDetailRecentReportRow;

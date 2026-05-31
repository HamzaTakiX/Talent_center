import { FunctionComponent } from 'react';
import { Calendar, CheckCircle2, Clock, FileText } from 'lucide-react';
import { DASHBOARD_RISK_STYLES } from '../constants/dashboardStyles';
import {
  STUDENT_DETAIL_ACTIONS_ROW,
  STUDENT_DETAIL_CONTENT,
  STUDENT_DETAIL_DATES_GRID,
  STUDENT_DETAIL_REPORTS_LIST,
  STUDENT_DETAIL_SECTION,
  STUDENT_DETAIL_PRIMARY_BUTTON,
  STUDENT_DETAIL_SECONDARY_BUTTON,
} from '../constants/studentDetailLayout';
import { STUDENT_DETAIL_PROGRESS_FILL } from '../constants/studentDetailStyles';
import type { StudentDetail } from '../types';
import StudentDetailRecentReportRow from './StudentDetailRecentReportRow';

interface StudentDetailPanelProps {
  student: StudentDetail;
}

const StudentDetailPanel: FunctionComponent<StudentDetailPanelProps> = ({ student }) => {
  const risk = DASHBOARD_RISK_STYLES[student.riskLevel];

  return (
    <article className={STUDENT_DETAIL_CONTENT}>
      <header className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-2xl font-semibold leading-8 tracking-tight text-[#171717] sm:text-[28px] sm:leading-9">
            {student.name}
          </h2>
          <p className="m-0 mt-1 text-sm font-normal leading-5 text-[#717182] sm:text-base">
            {student.level} • {student.company}
          </p>
        </div>
        <span
          className={`inline-flex w-fit max-w-full shrink-0 items-center self-start rounded-full px-3 py-1 text-xs font-medium leading-4 sm:text-sm ${risk.badgeBg} ${risk.badgeText}`}
        >
          {student.riskLabel}
        </span>
      </header>

      <section className={STUDENT_DETAIL_SECTION}>
        <h3 className="m-0 text-base font-semibold leading-6 text-[#171717]">PFE Subject</h3>
        <p className="m-0 text-sm font-normal leading-6 text-[#525252] sm:text-[15px]">
          {student.projectTitle}
        </p>
      </section>

      <section className={STUDENT_DETAIL_SECTION}>
        <h3 className="m-0 text-base font-semibold leading-6 text-[#171717]">Progress</h3>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-medium text-[#171717]">Overall Completion</span>
          <span className="font-semibold tabular-nums text-[#171717]">{student.progress}%</span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]"
          role="progressbar"
          aria-valuenow={student.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall completion for ${student.name}`}
        >
          <div
            className={`h-full rounded-full ${STUDENT_DETAIL_PROGRESS_FILL}`}
            style={{ width: `${student.progress}%` }}
          />
        </div>
      </section>

      <div className={STUDENT_DETAIL_DATES_GRID}>
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
            <CheckCircle2 className="h-5 w-5 text-[#16a34a]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-sm font-normal text-[#717182]">Last Report</p>
            <p className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-[#171717]">
              {student.lastReport}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffedd5]">
            <Clock className="h-5 w-5 text-[#ea580c]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-sm font-normal text-[#717182]">Next Report Due</p>
            <p className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-[#171717]">
              {student.nextReport}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dbeafe]">
            <Calendar className="h-5 w-5 text-[#2563eb]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-sm font-normal text-[#717182]">Next Meeting</p>
            <p className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-[#171717]">
              {student.nextMeeting}
            </p>
          </div>
        </div>
      </div>

      <section className={STUDENT_DETAIL_SECTION}>
        <h3 className="m-0 text-base font-semibold leading-6 text-[#171717]">Recent Reports</h3>
        <div className={STUDENT_DETAIL_REPORTS_LIST}>
          {student.recentReports.map((report) => (
            <StudentDetailRecentReportRow key={report.id} report={report} />
          ))}
        </div>
      </section>

      <div className={STUDENT_DETAIL_ACTIONS_ROW}>
        <button type="button" className={STUDENT_DETAIL_PRIMARY_BUTTON}>
          <Calendar className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Schedule Meeting
        </button>
        <button type="button" className={STUDENT_DETAIL_SECONDARY_BUTTON}>
          <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          View All Reports
        </button>
      </div>
    </article>
  );
};

export default StudentDetailPanel;

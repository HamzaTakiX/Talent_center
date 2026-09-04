import { FunctionComponent } from 'react';
import { Calendar, CheckCircle2, Clock, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { MeetingActionButton } from '../../../shared/meeting-room';
import { useEncadrantStudentProfileId } from '../../../shared/meeting-room/hooks/useEncadrantStudentProfileId';
import type { StudentDetail, StudentRiskLevel } from '../types';
import StudentDetailRecentReportRow from './StudentDetailRecentReportRow';

interface StudentDetailPanelProps {
  student: StudentDetail;
}

const RISK_LABEL_KEY: Record<StudentRiskLevel, string> = {
  low: 'encadrant.common.risk.low',
  medium: 'encadrant.common.risk.medium',
  high: 'encadrant.common.risk.high',
};

const StudentDetailPanel: FunctionComponent<StudentDetailPanelProps> = ({ student }) => {
  const { t } = useTranslation();
  const studentProfileId = useEncadrantStudentProfileId(student.name);
  const risk = DASHBOARD_RISK_STYLES[student.riskLevel];

  return (
    <article className={STUDENT_DETAIL_CONTENT}>
      <header className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-2xl font-semibold leading-8 tracking-tight text-[var(--admin-text)] sm:text-[28px] sm:leading-9">
            {student.name}
          </h2>
          <p className="m-0 mt-1 text-sm font-normal leading-5 text-[var(--admin-text-secondary)] sm:text-base">
            {student.level} • {student.company}
          </p>
        </div>
        <span className={`${risk.badge} shrink-0 self-start`}>
          {t(RISK_LABEL_KEY[student.riskLevel])}
        </span>
      </header>

      <section className={STUDENT_DETAIL_SECTION}>
        <h3 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)]">
          {t('encadrant.dashboard.detail.pfeSubject')}
        </h3>
        <p className="m-0 text-sm font-normal leading-6 text-[var(--admin-text-secondary)] sm:text-[15px]">
          {student.projectTitle}
        </p>
      </section>

      <section className={STUDENT_DETAIL_SECTION}>
        <h3 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)]">
          {t('encadrant.common.progress')}
        </h3>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-medium text-[var(--admin-text)]">
            {t('encadrant.dashboard.detail.overallCompletion')}
          </span>
          <span className="font-semibold tabular-nums text-[var(--admin-text)]">{student.progress}%</span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--admin-bg)]"
          role="progressbar"
          aria-valuenow={student.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('encadrant.dashboard.detail.overallCompletion')}
        >
          <div
            className={`h-full rounded-full ${STUDENT_DETAIL_PROGRESS_FILL}`}
            style={{ width: `${student.progress}%` }}
          />
        </div>
      </section>

      <div className={STUDENT_DETAIL_DATES_GRID}>
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full admin-badge--success">
            <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-sm font-normal text-[var(--admin-text-secondary)]">
              {t('encadrant.common.lastReport')}
            </p>
            <p className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-[var(--admin-text)]">
              {student.lastReport}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full admin-badge--warning">
            <Clock className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-sm font-normal text-[var(--admin-text-secondary)]">
              {t('encadrant.dashboard.detail.nextReportDue')}
            </p>
            <p className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-[var(--admin-text)]">
              {student.nextReport}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full admin-badge--info">
            <Calendar className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-sm font-normal text-[var(--admin-text-secondary)]">
              {t('encadrant.common.nextMeeting')}
            </p>
            <p className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-[var(--admin-text)]">
              {student.nextMeeting}
            </p>
          </div>
        </div>
      </div>

      <section className={STUDENT_DETAIL_SECTION}>
        <h3 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)]">
          {t('encadrant.dashboard.detail.recentReports')}
        </h3>
        <div className={STUDENT_DETAIL_REPORTS_LIST}>
          {student.recentReports.map((report) => (
            <StudentDetailRecentReportRow key={report.id} report={report} />
          ))}
        </div>
      </section>

      <div className={STUDENT_DETAIL_ACTIONS_ROW}>
        <MeetingActionButton
          portal="encadrant"
          mode="video"
          studentProfileId={studentProfileId}
          title={t('encadrant.agenda.meetingWith', { name: student.name })}
          className={STUDENT_DETAIL_PRIMARY_BUTTON}
        >
          <Calendar className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('encadrant.dashboard.meetings.startVideoCall')}
        </MeetingActionButton>
        <button type="button" className={STUDENT_DETAIL_SECONDARY_BUTTON}>
          <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('encadrant.header.titles.reports')}
        </button>
      </div>
    </article>
  );
};

export default StudentDetailPanel;

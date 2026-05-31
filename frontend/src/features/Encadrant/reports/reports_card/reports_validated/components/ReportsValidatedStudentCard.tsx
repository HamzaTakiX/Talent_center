import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { getEncadrantReportsStudentDetailPath } from '../../../constants/routes';
import {
  REPORTS_VALIDATED_FIELD_LABEL,
  REPORTS_VALIDATED_FIELD_SUB,
  REPORTS_VALIDATED_FIELD_SUB_OVERDUE,
  REPORTS_VALIDATED_FIELD_VALUE,
  REPORTS_VALIDATED_PROGRESS_TRACK,
  REPORTS_VALIDATED_REPORTS_COUNT,
  REPORTS_VALIDATED_STATUS_BADGE,
  REPORTS_VALIDATED_STUDENT_CARD,
  REPORTS_VALIDATED_STUDENT_LEVEL,
  REPORTS_VALIDATED_STUDENT_NAME,
} from '../constants/reportsValidatedLayout';
import {
  REPORTS_VALIDATED_PROGRESS_FILL,
  REPORTS_VALIDATED_STATUS_STYLES,
} from '../constants/reportsValidatedStyles';
import type { ReportsValidatedStudent } from '../types';

interface ReportsValidatedStudentCardProps {
  student: ReportsValidatedStudent;
  cardClassName?: string;
}

const ReportsValidatedStudentCard: FunctionComponent<ReportsValidatedStudentCardProps> = ({
  student,
  cardClassName = REPORTS_VALIDATED_STUDENT_CARD,
}) => {
  const navigate = useNavigate();
  const statusStyle = REPORTS_VALIDATED_STATUS_STYLES[student.status];

  return (
    <article
      className={`${cardClassName} cursor-pointer transition-colors hover:border-[rgba(0,0,0,0.12)] hover:shadow-[0_2px_8px_rgba(16,24,40,0.06)]`}
      role="button"
      tabIndex={0}
      onClick={() => navigate(getEncadrantReportsStudentDetailPath(student.id))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(getEncadrantReportsStudentDetailPath(student.id));
        }
      }}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={REPORTS_VALIDATED_STUDENT_NAME}>{student.name}</h3>
          <p className={REPORTS_VALIDATED_STUDENT_LEVEL}>{student.level}</p>
        </div>
        <div className={REPORTS_VALIDATED_REPORTS_COUNT}>
          <User className="h-4 w-4 shrink-0 text-[#9ca3af]" strokeWidth={1.75} aria-hidden />
          <span className="whitespace-nowrap tabular-nums">{student.totalReports} reports</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <p className={REPORTS_VALIDATED_FIELD_LABEL}>Last Report:</p>
          <p className={REPORTS_VALIDATED_FIELD_VALUE}>{student.lastReportTitle}</p>
          <p className={REPORTS_VALIDATED_FIELD_SUB}>{student.lastReportDate}</p>
        </div>
        <div>
          <p className={REPORTS_VALIDATED_FIELD_LABEL}>Next Report:</p>
          <p className={REPORTS_VALIDATED_FIELD_VALUE}>{student.nextReportTitle}</p>
          {student.isOverdue ? (
            <p className={REPORTS_VALIDATED_FIELD_SUB_OVERDUE}>
              Overdue: {student.nextReportDue}
            </p>
          ) : (
            <p className={REPORTS_VALIDATED_FIELD_SUB}>Due: {student.nextReportDue}</p>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium leading-5 text-[#171717]">Progress</span>
          <span className="text-sm font-semibold tabular-nums leading-5 text-[#171717]">
            {student.progressPercent}%
          </span>
        </div>
        <div
          className={REPORTS_VALIDATED_PROGRESS_TRACK}
          role="progressbar"
          aria-valuenow={student.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-all ${REPORTS_VALIDATED_PROGRESS_FILL}`}
            style={{ width: `${student.progressPercent}%` }}
          />
        </div>
      </div>

      <span
        className={`${REPORTS_VALIDATED_STATUS_BADGE} ${statusStyle.badgeBg} ${statusStyle.badgeText}`}
      >
        {statusStyle.label}
      </span>
    </article>
  );
};

export default ReportsValidatedStudentCard;

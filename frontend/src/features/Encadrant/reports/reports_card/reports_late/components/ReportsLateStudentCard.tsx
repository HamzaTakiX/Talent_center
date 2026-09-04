import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getEncadrantReportsStudentDetailPath } from '../../../constants/routes';
import {
  REPORTS_LATE_FIELD_LABEL,
  REPORTS_LATE_FIELD_SUB,
  REPORTS_LATE_FIELD_SUB_OVERDUE,
  REPORTS_LATE_FIELD_VALUE,
  REPORTS_LATE_PROGRESS_TRACK,
  REPORTS_LATE_REPORTS_COUNT,
  REPORTS_LATE_STUDENT_CARD,
  REPORTS_LATE_STUDENT_LEVEL,
  REPORTS_LATE_STUDENT_NAME,
} from '../constants/reportsLateLayout';
import {
  REPORTS_LATE_PROGRESS_FILL,
  REPORTS_LATE_STATUS_STYLES,
} from '../constants/reportsLateStyles';
import type { ReportsLateStudent } from '../types';

interface ReportsLateStudentCardProps {
  student: ReportsLateStudent;
  cardClassName?: string;
}

const ReportsLateStudentCard: FunctionComponent<ReportsLateStudentCardProps> = ({
  student,
  cardClassName = REPORTS_LATE_STUDENT_CARD,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const statusStyle = REPORTS_LATE_STATUS_STYLES[student.status];

  return (
    <article
      className={`${cardClassName} cursor-pointer transition-colors hover:border-[var(--admin-border)] hover:shadow-[0_2px_8px_rgba(16,24,40,0.06)]`}
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
          <h3 className={REPORTS_LATE_STUDENT_NAME}>{student.name}</h3>
          <p className={REPORTS_LATE_STUDENT_LEVEL}>{student.level}</p>
        </div>
        <div className={REPORTS_LATE_REPORTS_COUNT}>
          <User className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)]" strokeWidth={1.75} aria-hidden />
          <span className="whitespace-nowrap tabular-nums">
            {t('encadrant.reports.detail.subtitle', { count: student.totalReports })}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <p className={REPORTS_LATE_FIELD_LABEL}>{t('encadrant.common.lastReport')}:</p>
          <p className={REPORTS_LATE_FIELD_VALUE}>{student.lastReportTitle}</p>
          <p className={REPORTS_LATE_FIELD_SUB}>{student.lastReportDate}</p>
        </div>
        <div>
          <p className={REPORTS_LATE_FIELD_LABEL}>{t('encadrant.common.nextReport')}:</p>
          <p className={REPORTS_LATE_FIELD_VALUE}>{student.nextReportTitle}</p>
          {student.isOverdue ? (
            <p className={REPORTS_LATE_FIELD_SUB_OVERDUE}>
              {t('encadrant.common.overdue')}: {student.nextReportDue}
            </p>
          ) : (
            <p className={REPORTS_LATE_FIELD_SUB}>
              {t('encadrant.task.due')}: {student.nextReportDue}
            </p>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium leading-5 text-[var(--admin-text)]">
            {t('encadrant.common.progress')}
          </span>
          <span className="text-sm font-semibold tabular-nums leading-5 text-[var(--admin-text)]">
            {student.progressPercent}%
          </span>
        </div>
        <div
          className={REPORTS_LATE_PROGRESS_TRACK}
          role="progressbar"
          aria-valuenow={student.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-all ${REPORTS_LATE_PROGRESS_FILL}`}
            style={{ width: `${student.progressPercent}%` }}
          />
        </div>
      </div>

      <span className={statusStyle.badge}>{t(statusStyle.labelKey)}</span>
    </article>
  );
};

export default ReportsLateStudentCard;

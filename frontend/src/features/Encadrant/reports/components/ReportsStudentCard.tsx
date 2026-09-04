import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getEncadrantReportsStudentDetailPath } from '../constants/routes';
import {
  REPORTS_INFO_BLOCK,
  REPORTS_INFO_LABEL,
  REPORTS_INFO_ROW,
  REPORTS_INFO_SUB,
  REPORTS_INFO_VALUE,
  REPORTS_PROGRESS_FILL,
  REPORTS_PROGRESS_HEADER,
  REPORTS_PROGRESS_LABEL,
  REPORTS_PROGRESS_TRACK,
  REPORTS_PROGRESS_VALUE,
  REPORTS_PROGRESS_WRAP,
  REPORTS_STUDENT_CARD,
  REPORTS_STUDENT_HEADER,
  REPORTS_STUDENT_LEVEL,
  REPORTS_STUDENT_NAME,
} from '../constants/reportsLayout';
import { REPORTS_STATUS_STYLES } from '../constants/reportsStyles';
import type { ReportStudent } from '../types';

interface ReportsStudentCardProps {
  student: ReportStudent;
}

const ReportsStudentCard: FunctionComponent<ReportsStudentCardProps> = ({ student }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const statusStyle = REPORTS_STATUS_STYLES[student.status];

  return (
    <article
      className={`${REPORTS_STUDENT_CARD} cursor-pointer transition-colors hover:border-[var(--admin-border)] hover:shadow-[0_2px_8px_rgba(16,24,40,0.06)]`}
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
      <div className={REPORTS_STUDENT_HEADER}>
        <div className="min-w-0 flex-1">
          <h3 className={REPORTS_STUDENT_NAME}>{student.name}</h3>
          <p className={REPORTS_STUDENT_LEVEL}>{student.level}</p>
        </div>
        <span className={statusStyle.badge}>{t(statusStyle.labelKey)}</span>
      </div>

      <div className={REPORTS_INFO_BLOCK}>
        <div className={REPORTS_INFO_ROW}>
          <span className={REPORTS_INFO_LABEL}>{t('encadrant.reports.totalReports')}</span>
          <p className={REPORTS_INFO_VALUE}>{student.totalReports}</p>
        </div>

        <div className={REPORTS_INFO_ROW}>
          <span className={REPORTS_INFO_LABEL}>{t('encadrant.common.lastReport')}</span>
          <p className={REPORTS_INFO_VALUE}>{student.lastReportTitle}</p>
          <p className={REPORTS_INFO_SUB}>{student.lastReportDate}</p>
        </div>

        <div className={REPORTS_INFO_ROW}>
          <span className={REPORTS_INFO_LABEL}>{t('encadrant.common.nextReport')}</span>
          <p className={REPORTS_INFO_VALUE}>{student.nextReportTitle}</p>
          <p className={REPORTS_INFO_SUB}>
            {t('encadrant.task.due')}: {student.nextReportDue}
          </p>
        </div>
      </div>

      <div className={REPORTS_PROGRESS_WRAP}>
        <div className={REPORTS_PROGRESS_HEADER}>
          <span className={REPORTS_PROGRESS_LABEL}>{t('encadrant.common.progress')}</span>
          <span className={REPORTS_PROGRESS_VALUE}>{student.progressPercent}%</span>
        </div>
        <div
          className={REPORTS_PROGRESS_TRACK}
          role="progressbar"
          aria-valuenow={student.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`${REPORTS_PROGRESS_FILL} ${statusStyle.progress}`}
            style={{ width: `${student.progressPercent}%` }}
          />
        </div>
      </div>
    </article>
  );
};

export default ReportsStudentCard;

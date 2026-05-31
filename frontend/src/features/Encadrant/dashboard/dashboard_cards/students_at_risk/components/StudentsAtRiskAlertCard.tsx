import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Calendar, Eye, Send, X } from 'lucide-react';
import { getEncadrantStudentDetailPath } from '../../../constants/routes';
import {
  STUDENTS_AT_RISK_ALERT_ACTIONS,
  STUDENTS_AT_RISK_FACTORS_ROW,
  STUDENTS_AT_RISK_METRICS_GRID,
  STUDENTS_AT_RISK_PRIMARY_ACTION,
  STUDENTS_AT_RISK_SECONDARY_ACTION,
} from '../constants/studentsAtRiskLayout';
import { STUDENTS_AT_RISK_ALERT_STYLES } from '../constants/studentsAtRiskStyles';
import type { StudentAtRiskAlert } from '../types';

interface StudentsAtRiskAlertCardProps {
  alert: StudentAtRiskAlert;
}

const StudentsAtRiskAlertCard: FunctionComponent<StudentsAtRiskAlertCardProps> = ({ alert }) => {
  const navigate = useNavigate();
  const styles = STUDENTS_AT_RISK_ALERT_STYLES[alert.riskLevel];

  return (
    <article
      className={`box-border flex w-full min-w-0 flex-col gap-4 overflow-hidden rounded-[14px] border border-solid border-[rgba(0,0,0,0.06)] p-4 sm:gap-5 sm:p-5 ${styles.card} ${styles.border}`}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.iconCircle}`}
          >
            <AlertTriangle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="m-0 text-base font-semibold leading-6 text-[#171717] sm:text-lg">
              {alert.name}
            </h3>
            <p className="m-0 mt-0.5 text-sm font-normal leading-5 text-[#717182]">
              {alert.level} • {alert.company}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex w-fit max-w-full shrink-0 items-center self-start rounded-full px-3 py-1 text-xs font-medium leading-4 sm:text-sm ${styles.badgeBg} ${styles.badgeText}`}
        >
          {alert.riskLabel}
        </span>
      </div>

      {alert.riskFactors.length > 0 && (
        <div className="flex min-w-0 flex-col gap-2">
          <p className="m-0 text-sm font-semibold leading-5 text-[#171717]">Risk Factors:</p>
          <div className={STUDENTS_AT_RISK_FACTORS_ROW}>
            {alert.riskFactors.map((factor) => (
              <span
                key={factor.id}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-4 ${styles.factorBadge}`}
              >
                <X className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                {factor.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <dl className={`m-0 ${STUDENTS_AT_RISK_METRICS_GRID}`}>
        <div className="min-w-0">
          <dt className="m-0 text-sm font-normal text-[#717182]">Progress</dt>
          <dd className="m-0 mt-1 text-lg font-semibold tabular-nums text-[#171717]">
            {alert.progress}%
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="m-0 text-sm font-normal text-[#717182]">Last Report</dt>
          <dd className="m-0 mt-1 text-lg font-semibold tabular-nums text-[#171717]">
            {alert.lastReport}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="m-0 text-sm font-normal text-[#717182]">Next Due</dt>
          <dd className="m-0 mt-1 text-lg font-semibold tabular-nums text-[#171717]">
            {alert.nextDue}
          </dd>
        </div>
      </dl>

      <div className={STUDENTS_AT_RISK_ALERT_ACTIONS}>
        <button type="button" className={STUDENTS_AT_RISK_PRIMARY_ACTION}>
          <Send className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Send Reminder
        </button>
        <button type="button" className={STUDENTS_AT_RISK_SECONDARY_ACTION}>
          <Calendar className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Schedule Meeting
        </button>
        <button
          type="button"
          className={STUDENTS_AT_RISK_SECONDARY_ACTION}
          onClick={() => navigate(getEncadrantStudentDetailPath(alert.id))}
        >
          <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          View Details
        </button>
      </div>
    </article>
  );
};

export default StudentsAtRiskAlertCard;

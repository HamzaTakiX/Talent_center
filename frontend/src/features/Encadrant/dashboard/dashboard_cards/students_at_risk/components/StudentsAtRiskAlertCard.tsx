import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Eye, Send, X } from 'lucide-react';
import { getEncadrantStudentDetailPath } from '../../../constants/routes';
import {
  STUDENTS_AT_RISK_ALERT_ACTIONS,
  STUDENTS_AT_RISK_FACTORS_ROW,
  STUDENTS_AT_RISK_METRICS_GRID,
  STUDENTS_AT_RISK_PRIMARY_ACTION,
  STUDENTS_AT_RISK_SECONDARY_ACTION,
} from '../constants/studentsAtRiskLayout';
import { STUDENTS_AT_RISK_ALERT_STYLES } from '../constants/studentsAtRiskStyles';
import type { StudentAtRiskAlert, StudentsAtRiskLevel } from '../types';

interface StudentsAtRiskAlertCardProps {
  alert: StudentAtRiskAlert;
}

const RISK_LABEL_KEY: Record<StudentsAtRiskLevel, string> = {
  low: 'encadrant.common.risk.low',
  medium: 'encadrant.common.risk.medium',
  high: 'encadrant.common.risk.high',
};

const FACTOR_LABEL_KEY: Record<string, string> = {
  f1: 'encadrant.dashboard.atRisk.factors.lowProgress',
  f2: 'encadrant.dashboard.atRisk.factors.lateReports',
  f3: 'encadrant.dashboard.atRisk.factors.missingMeetings',
  'Low Progress': 'encadrant.dashboard.atRisk.factors.lowProgress',
  'Late Reports': 'encadrant.dashboard.atRisk.factors.lateReports',
  'Missing Meetings': 'encadrant.dashboard.atRisk.factors.missingMeetings',
};

const StudentsAtRiskAlertCard: FunctionComponent<StudentsAtRiskAlertCardProps> = ({ alert }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const styles = STUDENTS_AT_RISK_ALERT_STYLES[alert.riskLevel];

  return (
    <article
      className={`box-border flex w-full min-w-0 flex-col gap-4 overflow-hidden rounded-[14px] border border-solid border-[var(--admin-border)] p-4 sm:gap-5 sm:p-5 ${styles.card} ${styles.border}`}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.iconCircle}`}
          >
            <AlertTriangle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
              {alert.name}
            </h3>
            <p className="m-0 mt-0.5 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
              {alert.level} • {alert.company}
            </p>
          </div>
        </div>
        <span className={`${styles.badge} shrink-0 self-start`}>
          {t(RISK_LABEL_KEY[alert.riskLevel])}
        </span>
      </div>

      {alert.riskFactors.length > 0 && (
        <div className="flex min-w-0 flex-col gap-2">
          <p className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)]">
            {t('encadrant.dashboard.atRisk.riskFactors')}:
          </p>
          <div className={STUDENTS_AT_RISK_FACTORS_ROW}>
            {alert.riskFactors.map((factor) => (
              <span
                key={factor.id}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-4 ${styles.factorBadge}`}
              >
                <X className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                {FACTOR_LABEL_KEY[factor.id] || FACTOR_LABEL_KEY[factor.label]
                  ? t(FACTOR_LABEL_KEY[factor.id] ?? FACTOR_LABEL_KEY[factor.label])
                  : factor.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <dl className={`m-0 ${STUDENTS_AT_RISK_METRICS_GRID}`}>
        <div className="min-w-0">
          <dt className="m-0 text-sm font-normal text-[var(--admin-text-secondary)]">
            {t('encadrant.common.progress')}
          </dt>
          <dd className="m-0 mt-1 text-lg font-semibold tabular-nums text-[var(--admin-text)]">
            {alert.progress}%
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="m-0 text-sm font-normal text-[var(--admin-text-secondary)]">
            {t('encadrant.common.lastReport')}
          </dt>
          <dd className="m-0 mt-1 text-lg font-semibold tabular-nums text-[var(--admin-text)]">
            {alert.lastReport}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="m-0 text-sm font-normal text-[var(--admin-text-secondary)]">
            {t('encadrant.common.nextDue')}
          </dt>
          <dd className="m-0 mt-1 text-lg font-semibold tabular-nums text-[var(--admin-text)]">
            {alert.nextDue}
          </dd>
        </div>
      </dl>

      <div className={STUDENTS_AT_RISK_ALERT_ACTIONS}>
        <button type="button" className={STUDENTS_AT_RISK_PRIMARY_ACTION}>
          <Send className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('encadrant.dashboard.pendingReports.remind')}
        </button>
        <button
          type="button"
          className={STUDENTS_AT_RISK_SECONDARY_ACTION}
          onClick={() => navigate(getEncadrantStudentDetailPath(alert.id))}
        >
          <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('encadrant.common.view')}
        </button>
      </div>
    </article>
  );
};

export default StudentsAtRiskAlertCard;

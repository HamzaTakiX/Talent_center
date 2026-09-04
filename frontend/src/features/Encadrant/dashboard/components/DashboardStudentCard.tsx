import { FunctionComponent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_STUDENT_CARD } from '../constants/dashboardLayout';
import { DASHBOARD_RISK_STYLES } from '../constants/dashboardStyles';
import { getEncadrantStudentDetailPath } from '../constants/routes';
import type { AssignedStudent, StudentRiskLevel } from '../types';

interface DashboardStudentCardProps {
  student: AssignedStudent;
}

const RISK_LABEL_KEY: Record<StudentRiskLevel, string> = {
  low: 'encadrant.common.risk.low',
  medium: 'encadrant.common.risk.medium',
  high: 'encadrant.common.risk.high',
};

const clickableCardClass = `${DASHBOARD_STUDENT_CARD} min-w-0 cursor-pointer overflow-x-clip text-start transition-shadow hover:border-[var(--admin-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-brand)]`;

const DashboardStudentCard: FunctionComponent<DashboardStudentCardProps> = ({ student }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const risk = DASHBOARD_RISK_STYLES[student.riskLevel];

  const openStudentDetail = () => {
    navigate(getEncadrantStudentDetailPath(student.id));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openStudentDetail();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openStudentDetail}
      onKeyDown={handleKeyDown}
      className={clickableCardClass}
      aria-label={t('encadrant.common.viewDetailsFor', { name: student.name })}
    >
      <span
        className={`absolute end-4 top-4 h-2.5 w-2.5 shrink-0 rounded-full ${risk.dot}`}
        aria-hidden
      />

      <div className="flex min-w-0 flex-col gap-0.5 pe-6">
        <h3 className="m-0 truncate text-base font-semibold leading-6 text-[var(--admin-text)]">{student.name}</h3>
        <p className="m-0 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">{student.level}</p>
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <p className="m-0 line-clamp-2 text-sm font-semibold leading-5 text-[var(--admin-text)]">
          {student.projectTitle}
        </p>
        <p className="m-0 truncate text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">{student.company}</p>
      </div>

      <dl className="m-0 flex min-w-0 flex-col gap-1.5 text-sm">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <dt className="min-w-0 truncate font-normal text-[var(--admin-text-secondary)]">
            {t('encadrant.common.lastReport')}
          </dt>
          <dd className="m-0 shrink-0 font-medium tabular-nums text-[var(--admin-text)]">{student.lastReport}</dd>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <dt className="min-w-0 truncate font-normal text-[var(--admin-text-secondary)]">
            {t('encadrant.common.nextReport')}
          </dt>
          <dd className="m-0 shrink-0 font-medium tabular-nums text-[var(--admin-text)]">{student.nextReport}</dd>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <dt className="min-w-0 truncate font-normal text-[var(--admin-text-secondary)]">
            {t('encadrant.common.nextMeeting')}
          </dt>
          <dd className="m-0 shrink-0 font-medium tabular-nums text-[var(--admin-text)]">{student.nextMeeting}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-medium text-[var(--admin-text)]">{t('encadrant.common.progress')}</span>
          <span className="font-semibold tabular-nums text-[var(--admin-text)]">{student.progress}%</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-[var(--admin-bg)]"
          role="presentation"
        >
          <div
            className={`h-full rounded-full ${risk.progress}`}
            style={{ width: `${student.progress}%` }}
          />
        </div>
      </div>

      <span className={risk.badge}>{t(RISK_LABEL_KEY[student.riskLevel])}</span>
    </article>
  );
};

export default DashboardStudentCard;

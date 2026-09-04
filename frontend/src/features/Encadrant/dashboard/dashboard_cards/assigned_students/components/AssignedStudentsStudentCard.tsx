import { FunctionComponent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getEncadrantStudentDetailPath } from '../../../constants/routes';
import { ASSIGNED_STUDENTS_CARD } from '../constants/assignedStudentsLayout';
import {
  ASSIGNED_STUDENTS_PROGRESS_FILL,
  ASSIGNED_STUDENTS_RISK_STYLES,
} from '../constants/assignedStudentsStyles';
import type { AssignedStudentListItem, AssignedStudentRiskLevel } from '../types';

interface AssignedStudentsStudentCardProps {
  student: AssignedStudentListItem;
}

const RISK_LABEL_KEY: Record<AssignedStudentRiskLevel, string> = {
  low: 'encadrant.common.risk.low',
  medium: 'encadrant.common.risk.medium',
  high: 'encadrant.common.risk.high',
};

const clickableCardClass = `${ASSIGNED_STUDENTS_CARD} cursor-pointer text-start transition-shadow hover:border-[var(--admin-border)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-brand)]`;

const AssignedStudentsStudentCard: FunctionComponent<AssignedStudentsStudentCardProps> = ({
  student,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const risk = ASSIGNED_STUDENTS_RISK_STYLES[student.riskLevel];

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
      <div className="flex min-w-0 flex-col gap-0.5">
        <h3 className="m-0 truncate text-base font-semibold leading-6 text-[var(--admin-text)]">{student.name}</h3>
        <p className="m-0 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">{student.level}</p>
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <p className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)]">
          {t('encadrant.dashboard.detail.pfeSubject')}:
        </p>
        <p className="m-0 line-clamp-2 text-sm font-normal leading-5 text-[var(--admin-text)]">
          {student.projectTitle}
        </p>
        <p className="m-0 truncate text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">{student.company}</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-medium text-[var(--admin-text-secondary)]">{t('encadrant.common.progress')}</span>
          <span className="font-semibold tabular-nums text-[var(--admin-text)]">{student.progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--admin-bg)]" role="presentation">
          <div
            className={`h-full rounded-full ${ASSIGNED_STUDENTS_PROGRESS_FILL}`}
            style={{ width: `${student.progress}%` }}
          />
        </div>
      </div>

      <dl className="m-0 flex flex-col gap-1.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="font-normal text-[var(--admin-text-secondary)]">{t('encadrant.common.lastReport')}</dt>
          <dd className="m-0 shrink-0 font-medium tabular-nums text-[var(--admin-text)]">{student.lastReport}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="font-normal text-[var(--admin-text-secondary)]">{t('encadrant.common.nextMeeting')}</dt>
          <dd className="m-0 shrink-0 font-medium tabular-nums text-[var(--admin-text)]">{student.nextMeeting}</dd>
        </div>
      </dl>

      <span className={risk.badge}>{t(RISK_LABEL_KEY[student.riskLevel])}</span>
    </article>
  );
};

export default AssignedStudentsStudentCard;

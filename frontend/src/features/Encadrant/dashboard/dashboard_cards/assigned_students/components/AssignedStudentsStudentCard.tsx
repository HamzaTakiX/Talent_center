import { FunctionComponent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEncadrantStudentDetailPath } from '../../../constants/routes';
import { ASSIGNED_STUDENTS_CARD } from '../constants/assignedStudentsLayout';
import {
  ASSIGNED_STUDENTS_PROGRESS_FILL,
  ASSIGNED_STUDENTS_RISK_STYLES,
} from '../constants/assignedStudentsStyles';
import type { AssignedStudentListItem } from '../types';

interface AssignedStudentsStudentCardProps {
  student: AssignedStudentListItem;
}

const clickableCardClass = `${ASSIGNED_STUDENTS_CARD} cursor-pointer text-left transition-shadow hover:border-[rgba(0,0,0,0.12)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]`;

const AssignedStudentsStudentCard: FunctionComponent<AssignedStudentsStudentCardProps> = ({
  student,
}) => {
  const navigate = useNavigate();
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
      aria-label={`View details for ${student.name}`}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <h3 className="m-0 truncate text-base font-semibold leading-6 text-[#171717]">{student.name}</h3>
        <p className="m-0 text-sm font-normal leading-5 text-[#717182]">{student.level}</p>
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <p className="m-0 text-sm font-semibold leading-5 text-[#171717]">PFE Subject:</p>
        <p className="m-0 line-clamp-2 text-sm font-normal leading-5 text-[#171717]">
          {student.projectTitle}
        </p>
        <p className="m-0 truncate text-sm font-normal leading-5 text-[#717182]">{student.company}</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-medium text-[#717182]">Progress</span>
          <span className="font-semibold tabular-nums text-[#171717]">{student.progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]" role="presentation">
          <div
            className={`h-full rounded-full ${ASSIGNED_STUDENTS_PROGRESS_FILL}`}
            style={{ width: `${student.progress}%` }}
          />
        </div>
      </div>

      <dl className="m-0 flex flex-col gap-1.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="font-normal text-[#717182]">Last Report</dt>
          <dd className="m-0 shrink-0 font-medium tabular-nums text-[#171717]">{student.lastReport}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="font-normal text-[#717182]">Next Meeting</dt>
          <dd className="m-0 shrink-0 font-medium tabular-nums text-[#171717]">{student.nextMeeting}</dd>
        </div>
      </dl>

      <span
        className={`inline-flex w-fit max-w-full items-center rounded-full px-2.5 py-1 text-xs font-medium leading-4 ${risk.badgeBg} ${risk.badgeText}`}
      >
        {student.riskLabel}
      </span>
    </article>
  );
};

export default AssignedStudentsStudentCard;


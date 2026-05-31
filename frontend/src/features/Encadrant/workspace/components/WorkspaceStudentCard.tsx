import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';
import { getEncadrantWorkspaceStudentDetailPath } from '../constants/routes';
import {
  WORKSPACE_ACTIVE_BADGE,
  WORKSPACE_CARD,
  WORKSPACE_CARD_HEADER,
  WORKSPACE_CARD_HEADER_MAIN,
  WORKSPACE_CARD_LEVEL,
  WORKSPACE_CARD_NAME,
  WORKSPACE_OPEN_BTN,
  WORKSPACE_STAT_LABEL,
  WORKSPACE_STAT_ROW,
  WORKSPACE_STAT_VALUE,
  WORKSPACE_STATS,
} from '../constants/workspaceLayout';
import type { WorkspaceStudent } from '../types';

interface WorkspaceStudentCardProps {
  student: WorkspaceStudent;
}

const WorkspaceStudentCard: FunctionComponent<WorkspaceStudentCardProps> = ({ student }) => {
  const navigate = useNavigate();

  return (
  <article className={WORKSPACE_CARD}>
    <div className={WORKSPACE_CARD_HEADER}>
      <div className={WORKSPACE_CARD_HEADER_MAIN}>
        <h3 className={WORKSPACE_CARD_NAME}>{student.name}</h3>
        <p className={WORKSPACE_CARD_LEVEL}>{student.level}</p>
      </div>
      {student.activeSessions > 0 ? (
        <span className={WORKSPACE_ACTIVE_BADGE}>{student.activeSessions} active</span>
      ) : null}
    </div>

    <div className={WORKSPACE_STATS}>
      <div className={WORKSPACE_STAT_ROW}>
        <span className={WORKSPACE_STAT_LABEL}>Active Sessions</span>
        <span className={WORKSPACE_STAT_VALUE}>{student.activeSessions}</span>
      </div>
      <div className={WORKSPACE_STAT_ROW}>
        <span className={WORKSPACE_STAT_LABEL}>Last Activity</span>
        <span className={WORKSPACE_STAT_VALUE}>{student.lastActivity}</span>
      </div>
    </div>

    <button
      type="button"
      className={WORKSPACE_OPEN_BTN}
      onClick={() => navigate(getEncadrantWorkspaceStudentDetailPath(student.id))}
    >
      <Video className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      Open Workspace
    </button>
  </article>
  );
};

export default WorkspaceStudentCard;

import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { MeetingActionButton } from '../../../shared/meeting-room';
import { useEncadrantStudentProfileId } from '../../../shared/meeting-room/hooks/useEncadrantStudentProfileId';
import type { WorkspaceStudent } from '../types';

interface WorkspaceStudentCardProps {
  student: WorkspaceStudent;
}

const WorkspaceStudentCard: FunctionComponent<WorkspaceStudentCardProps> = ({ student }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const studentProfileId = useEncadrantStudentProfileId(student.name);

  return (
    <article className={WORKSPACE_CARD}>
      <div className={WORKSPACE_CARD_HEADER}>
        <div className={WORKSPACE_CARD_HEADER_MAIN}>
          <h3 className={WORKSPACE_CARD_NAME}>{student.name}</h3>
          <p className={WORKSPACE_CARD_LEVEL}>{student.level}</p>
        </div>
        {student.activeSessions > 0 ? (
          <span className={WORKSPACE_ACTIVE_BADGE}>
            {t('encadrant.workspace.activeBadge', { count: student.activeSessions })}
          </span>
        ) : null}
      </div>

      <div className={WORKSPACE_STATS}>
        <div className={WORKSPACE_STAT_ROW}>
          <span className={WORKSPACE_STAT_LABEL}>{t('encadrant.workspace.activeSessions')}</span>
          <span className={WORKSPACE_STAT_VALUE}>{student.activeSessions}</span>
        </div>
        <div className={WORKSPACE_STAT_ROW}>
          <span className={WORKSPACE_STAT_LABEL}>{t('encadrant.workspace.lastActivity')}</span>
          <span className={WORKSPACE_STAT_VALUE}>{student.lastActivity}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          className={WORKSPACE_OPEN_BTN}
          onClick={() => navigate(getEncadrantWorkspaceStudentDetailPath(student.id))}
        >
          <Video className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('encadrant.workspace.open')}
        </button>
        <MeetingActionButton
          portal="encadrant"
          mode="video"
          studentProfileId={studentProfileId}
          title={t('meetingRoom.withParticipant', { name: student.name })}
          className={WORKSPACE_OPEN_BTN}
        >
          <Video className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('meetingRoom.callStudent')}
        </MeetingActionButton>
      </div>
    </article>
  );
};

export default WorkspaceStudentCard;

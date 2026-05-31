import { FunctionComponent } from 'react';
import { Volume2 } from 'lucide-react';
import {
  PARTICIPANT_GRADIENT_ENCADRANT,
  PARTICIPANT_GRADIENT_STUDENT,
  WORKSPACE_DETAIL_PARTICIPANT_AVATAR,
  WORKSPACE_DETAIL_PARTICIPANT_CARD,
  WORKSPACE_DETAIL_PARTICIPANT_NAME,
  WORKSPACE_DETAIL_SPEAKING_BADGE,
  WORKSPACE_DETAIL_VIDEO_GRID,
  WORKSPACE_DETAIL_VIDEO_SECTION,
} from '../constants/workspaceDetailLayout';

interface WorkspaceDetailVideoSessionProps {
  studentName: string;
  studentInitials: string;
}

const WorkspaceDetailVideoSession: FunctionComponent<WorkspaceDetailVideoSessionProps> = ({
  studentName,
  studentInitials,
}) => (
  <section className={WORKSPACE_DETAIL_VIDEO_SECTION} aria-label="Video session">
    <div className={WORKSPACE_DETAIL_VIDEO_GRID}>
      <article className={`${WORKSPACE_DETAIL_PARTICIPANT_CARD} ${PARTICIPANT_GRADIENT_STUDENT}`}>
        <div className={WORKSPACE_DETAIL_PARTICIPANT_AVATAR}>{studentInitials}</div>
        <p className={WORKSPACE_DETAIL_PARTICIPANT_NAME}>{studentName}</p>
        <span className={WORKSPACE_DETAIL_SPEAKING_BADGE}>
          <Volume2 className="h-3 w-3" strokeWidth={2} aria-hidden />
          Speaking
        </span>
      </article>

      <article className={`${WORKSPACE_DETAIL_PARTICIPANT_CARD} ${PARTICIPANT_GRADIENT_ENCADRANT}`}>
        <div className={WORKSPACE_DETAIL_PARTICIPANT_AVATAR}>ME</div>
        <p className={WORKSPACE_DETAIL_PARTICIPANT_NAME}>You (Encadrant)</p>
      </article>
    </div>
  </section>
);

export default WorkspaceDetailVideoSession;

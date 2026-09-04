import { FunctionComponent } from 'react';
import { Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MeetingActionButton } from '../../../shared/meeting-room';
import { useEncadrantStudentProfileId } from '../../../shared/meeting-room/hooks/useEncadrantStudentProfileId';
import {
  WORKSPACE_DETAIL_VIDEO_SECTION,
} from '../constants/workspaceDetailLayout';

interface WorkspaceMeetingLaunchPanelProps {
  studentName: string;
}

const WorkspaceMeetingLaunchPanel: FunctionComponent<WorkspaceMeetingLaunchPanelProps> = ({
  studentName,
}) => {
  const { t } = useTranslation();
  const studentProfileId = useEncadrantStudentProfileId(studentName);

  return (
    <section className={WORKSPACE_DETAIL_VIDEO_SECTION} aria-label={t('encadrant.workspace.videoSession')}>
      <div className="flex flex-col gap-4 rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-5 shadow-[var(--admin-shadow-sm)] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--admin-brand)]">
            {t('encadrant.workspace.videoSession')}
          </p>
          <h2 className="m-0 mt-1 text-lg font-semibold text-[var(--admin-text)]">
            {t('meetingRoom.withParticipant', { name: studentName })}
          </h2>
          <p className="m-0 mt-1 text-sm text-[var(--admin-text-muted)]">{t('meetingRoom.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MeetingActionButton
            portal="encadrant"
            mode="video"
            studentProfileId={studentProfileId}
            title={t('meetingRoom.withParticipant', { name: studentName })}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--admin-brand)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
          >
            <Video className="h-4 w-4" aria-hidden />
            {t('meetingRoom.modeVideo')}
          </MeetingActionButton>
          <MeetingActionButton
            portal="encadrant"
            mode="voice"
            studentProfileId={studentProfileId}
            title={t('meetingRoom.withParticipant', { name: studentName })}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-surface-muted)]"
          >
            <Video className="h-4 w-4" aria-hidden />
            {t('meetingRoom.modeVoice')}
          </MeetingActionButton>
        </div>
      </div>
    </section>
  );
};

export default WorkspaceMeetingLaunchPanel;

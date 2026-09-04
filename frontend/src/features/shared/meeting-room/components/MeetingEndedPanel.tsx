import { FunctionComponent } from 'react';
import { MessageSquare, ArrowLeft, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { MeetingPortal } from '../types';
import {
  agendaPathForPortal,
  backPathForPortal,
  chatPathForPortal,
  workspacePathForPortal,
} from '../constants/routes';

interface MeetingEndedPanelProps {
  portal: MeetingPortal;
  participantName: string;
  durationSeconds: number;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const MeetingEndedPanel: FunctionComponent<MeetingEndedPanelProps> = ({
  portal,
  participantName,
  durationSeconds,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-[420px] items-center justify-center rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6 sm:p-10">
      <div className="w-full max-w-lg text-center">
        <h2 className="m-0 text-xl font-semibold leading-8 text-[var(--admin-text)] sm:text-2xl">
          {t('meetingRoom.ended.title')}
        </h2>
        <p className="m-0 mt-2 text-sm text-[var(--admin-text-secondary)]">
          {t('meetingRoom.ended.withParticipant', { name: participantName })}
        </p>
        <p className="m-0 mt-1 text-sm font-medium tabular-nums text-[var(--admin-text-muted)]">
          {t('meetingRoom.duration')}: {formatDuration(durationSeconds)}
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={() => navigate(backPathForPortal(portal))}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[var(--admin-brand)] px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            {t('meetingRoom.ended.backToMeetings')}
          </button>
          <button
            type="button"
            onClick={() => navigate(chatPathForPortal(portal))}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-5 py-3 text-sm font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-surface-muted)]"
          >
            <MessageSquare className="h-4 w-4" aria-hidden />
            {t('meetingRoom.openChat')}
          </button>
          <button
            type="button"
            onClick={() => navigate(workspacePathForPortal(portal))}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-5 py-3 text-sm font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-surface-muted)]"
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
            {t('meetingRoom.ended.returnToWorkspace')}
          </button>
          <button
            type="button"
            onClick={() => navigate(agendaPathForPortal(portal))}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-5 py-3 text-sm font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-surface-muted)]"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            {t('meetingRoom.ended.backToAgenda')}
          </button>
        </div>
      </div>
    </div>
  );
};

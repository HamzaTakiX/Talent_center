import { Clock, Mic, Monitor, Users, Video, X } from 'lucide-react';
import { workspaceMeeting } from '../data/workspaceMock';
import {
  WORKSPACE_MEETING_BODY,
  WORKSPACE_MEETING_CARD,
  WORKSPACE_MEETING_HEADER,
  WORKSPACE_MEETING_VIDEO_GRID,
  WORKSPACE_MEETING_VIDEO_TILE,
} from '../constants/workspaceLayout';
import {
  WORKSPACE_MEETING_CONTROL_BTN,
  WORKSPACE_MEETING_CONTROL_BTN_END,
  WORKSPACE_MEETING_CONTROL_BTN_OUTLINE,
  WORKSPACE_MEETING_CONTROLS_ROW,
  WORKSPACE_MEETING_LIVE_BADGE,
  WORKSPACE_MEETING_META_ROW,
} from '../constants/workspaceStyles';

interface WorkspaceMeetingCardProps {
  onEndMeeting: () => void;
}

export default function WorkspaceMeetingCard({ onEndMeeting }: WorkspaceMeetingCardProps) {
  return (
    <section className={WORKSPACE_MEETING_CARD} aria-label="Réunion en cours">
      <header className={WORKSPACE_MEETING_HEADER}>
        <div className="min-w-0 max-w-full flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <Video className="h-5 w-5 shrink-0 text-[var(--admin-text)]" aria-hidden />
            <h2 className="m-0 break-words font-inter text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
              {workspaceMeeting.title}
            </h2>
          </div>
          <p className="m-0 mt-1 break-words pl-7 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)]">
            {workspaceMeeting.subtitle}
          </p>
        </div>
        <span className={WORKSPACE_MEETING_LIVE_BADGE}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef4444]" aria-hidden />
          {workspaceMeeting.liveLabel}
        </span>
      </header>

      <div className={WORKSPACE_MEETING_BODY}>
        <div className={WORKSPACE_MEETING_VIDEO_GRID}>
          {workspaceMeeting.participants.map((participant) => (
            <article
              key={participant.id}
              className={`${WORKSPACE_MEETING_VIDEO_TILE} ${participant.gradientClass}`}
            >
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--admin-bg-elevated)]/20 font-inter text-xl font-semibold text-white backdrop-blur-sm sm:h-20 sm:w-20 sm:text-2xl">
                {participant.initials}
              </span>
              <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-md bg-black/50 px-2 py-1 font-inter text-[12px] font-medium leading-4 text-white">
                {participant.label}
              </span>
            </article>
          ))}
        </div>

        <div className="flex w-full min-w-0 max-w-full flex-col items-center gap-4">
          <div className={WORKSPACE_MEETING_CONTROLS_ROW}>
            <button type="button" className={WORKSPACE_MEETING_CONTROL_BTN} aria-label="Microphone">
              <Mic className="h-5 w-5" />
            </button>
            <button type="button" className={WORKSPACE_MEETING_CONTROL_BTN} aria-label="Caméra">
              <Video className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={WORKSPACE_MEETING_CONTROL_BTN_OUTLINE}
              aria-label="Partage d'écran"
            >
              <Monitor className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={WORKSPACE_MEETING_CONTROL_BTN_END}
              aria-label="Terminer la réunion"
              onClick={onEndMeeting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className={WORKSPACE_MEETING_META_ROW}>
            <span className="inline-flex max-w-full items-center gap-1.5 font-inter text-[13px] leading-5">
              <Users className="h-4 w-4 shrink-0" aria-hidden />
              {workspaceMeeting.participantCountLabel}
            </span>
            <span className="inline-flex max-w-full items-center gap-1.5 font-inter text-[13px] leading-5">
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              {workspaceMeeting.durationLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

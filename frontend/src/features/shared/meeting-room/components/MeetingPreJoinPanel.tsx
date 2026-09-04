import { FunctionComponent } from 'react';
import {
  ArrowLeft,
  Calendar,
  LayoutGrid,
  MessageSquare,
  Mic,
  PhoneOff,
  Video,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { MeetingMediaMode, MeetingPortal, MeetingSessionPayload } from '../types';
import {
  agendaPathForPortal,
  backPathForPortal,
  chatPathForPortal,
  workspacePathForPortal,
} from '../constants/routes';
import { formatMeetingDateTime } from '../utils/meetingDisplayUtils';
import {
  MeetingParticipantAvatar,
  MEETING_DEFAULT_ENCADRANT_AVATAR,
} from './MeetingParticipantAvatar';
import { MeetingStatusBadge } from './MeetingStatusBadge';

interface MeetingPreJoinPanelProps {
  session: MeetingSessionPayload;
  portal: MeetingPortal;
  mode: MeetingMediaMode;
  onJoin: () => void;
  onLeave: () => void;
  connectionLabel: string;
  connectionError?: boolean;
  joining?: boolean;
}

export const MeetingPreJoinPanel: FunctionComponent<MeetingPreJoinPanelProps> = ({
  session,
  portal,
  mode,
  onJoin,
  onLeave,
  connectionLabel,
  connectionError = false,
  joining = false,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const partner = portal === 'student' ? session.encadrant : session.student;
  const titleMatch =
    portal === 'student'
      ? session.title?.match(/\b(?:avec|with)\s+(.+)$/i)?.[1]?.trim()
      : null;
  const partnerName = titleMatch || partner.display_name;
  /** Student lobby: always show the known encadrant portrait (matches supervisor card). */
  const partnerAvatar =
    portal === 'student'
      ? MEETING_DEFAULT_ENCADRANT_AVATAR
      : partner.avatar_url?.trim() || null;

  const roleLabel =
    portal === 'student'
      ? t('meetingRoom.preJoin.roleStudent')
      : t('meetingRoom.preJoin.roleEncadrant');
  const whenLabel = session.planned_start
    ? formatMeetingDateTime(session.planned_start, i18n.language)
    : null;
  const ModeIcon = mode === 'voice' ? Mic : Video;
  const meetingTitle = session.title || t('meetingRoom.title');

  const toolBtn =
    'inline-flex items-center gap-2 rounded-[10px] border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-bg-elevated)_70%,transparent)] px-3 py-2 text-sm font-medium text-[var(--admin-text)] backdrop-blur-sm transition-colors hover:bg-[var(--admin-surface-muted)]';

  return (
    <section
      className="meeting-prejoin relative flex h-full min-h-[520px] flex-col overflow-hidden rounded-[16px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]"
      aria-label={meetingTitle}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 50% at 50% 0%, color-mix(in srgb, var(--admin-brand) 20%, transparent), transparent 68%), radial-gradient(ellipse 45% 35% at 100% 100%, color-mix(in srgb, var(--admin-brand) 10%, transparent), transparent 60%)',
        }}
        aria-hidden
      />

      {/* Toolbar — same visual plane as the lobby */}
      <div className="relative z-[1] flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate(backPathForPortal(portal))}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-muted)]"
            aria-label={t('meetingRoom.back')}
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] px-3 py-1 text-xs text-[var(--admin-text-secondary)]">
            {connectionError ? (
              <WifiOff className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Wifi className="h-3.5 w-3.5" aria-hidden />
            )}
            {connectionLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => navigate(agendaPathForPortal(portal))} className={toolBtn}>
            <Calendar className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t('meetingRoom.header.agenda')}</span>
          </button>
          <button type="button" onClick={() => navigate(workspacePathForPortal(portal))} className={toolBtn}>
            <LayoutGrid className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t('meetingRoom.header.workspace')}</span>
          </button>
          <button type="button" onClick={() => navigate(chatPathForPortal(portal))} className={toolBtn}>
            <MessageSquare className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t('meetingRoom.openChat')}</span>
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#ef4444] px-3 py-2 text-sm font-semibold text-white hover:bg-[#dc2626]"
          >
            <PhoneOff className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t('meetingRoom.leave')}</span>
          </button>
        </div>
      </div>

      {/* Hero — image + encadrant / meeting data */}
      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center gap-6 px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          <div className="relative mb-5">
            <span
              className="pointer-events-none absolute inset-[-12px] rounded-full border border-[color-mix(in_srgb,var(--admin-brand)_30%,transparent)]"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute inset-[-22px] animate-pulse rounded-full border border-[color-mix(in_srgb,var(--admin-brand)_14%,transparent)]"
              aria-hidden
            />
            <MeetingParticipantAvatar
              name={partnerName}
              avatarUrl={partnerAvatar}
              size="xl"
              ring
            />
            <span className="absolute -bottom-1 -end-1 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--admin-bg-elevated)] bg-[var(--admin-brand)] text-white shadow-md">
              <ModeIcon className="h-4 w-4" aria-hidden />
            </span>
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--admin-brand)_14%,transparent)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--admin-brand)]">
              <ModeIcon className="h-3.5 w-3.5" aria-hidden />
              {mode === 'voice' ? t('meetingRoom.modeVoice') : t('meetingRoom.modeVideo')}
            </span>
            {session.status ? <MeetingStatusBadge status={session.status} /> : null}
          </div>

          <h1 className="m-0 max-w-full text-xl font-bold leading-snug text-[var(--admin-text)] sm:text-2xl">
            {partnerName}
          </h1>
          <p className="m-0 mt-1.5 max-w-full text-sm text-[var(--admin-text-secondary)] sm:text-[15px]">
            {meetingTitle}
          </p>
          {whenLabel ? (
            <p className="m-0 mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--admin-text-muted)] sm:text-[13px]">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-[var(--admin-brand)]" aria-hidden />
              {whenLabel}
            </p>
          ) : null}
          <p className="m-0 mt-2 text-xs font-medium text-[var(--admin-text-muted)]">{roleLabel}</p>
        </div>

        <div className="flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onJoin}
            disabled={joining}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-[var(--admin-brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--admin-brand)_32%,transparent)] transition-[filter,opacity,transform] hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            <ModeIcon className="h-4 w-4" aria-hidden />
            {t('meetingRoom.preJoin.joinMeeting')}
          </button>
          <button
            type="button"
            onClick={() => navigate(chatPathForPortal(portal))}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-bg-elevated)_80%,transparent)] px-5 py-3 text-sm font-semibold text-[var(--admin-text)] backdrop-blur-sm transition-colors hover:bg-[var(--admin-surface-muted)] sm:flex-none"
          >
            <MessageSquare className="h-4 w-4" aria-hidden />
            {t('meetingRoom.openChat')}
          </button>
        </div>
      </div>
    </section>
  );
};

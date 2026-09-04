import {

  FunctionComponent,

  ReactNode,

  useCallback,

  useEffect,

  useMemo,

  useState,

} from 'react';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {

  ArrowLeft,

  Calendar,

  LayoutGrid,

  Loader2,

  MessageSquare,

  PhoneOff,

  Wifi,

  WifiOff,

} from 'lucide-react';

import { useTranslation } from 'react-i18next';

import { useAuth } from '../../../auth/hooks/useAuth';

import { meetingSessionsApi } from '../api/meetingSessionsApi';

import JitsiMeetingEmbed from '../components/JitsiMeetingEmbed';

import { MeetingEndedPanel } from '../components/MeetingEndedPanel';

import { MeetingPreJoinPanel } from '../components/MeetingPreJoinPanel';

import { MeetingStatusBadge } from '../components/MeetingStatusBadge';

import {
  MeetingParticipantAvatar,
  MEETING_DEFAULT_ENCADRANT_AVATAR,
} from '../components/MeetingParticipantAvatar';

import {

  agendaPathForPortal,

  backPathForPortal,

  chatPathForPortal,

  workspacePathForPortal,

} from '../constants/routes';

import { formatMeetingDateTime } from '../utils/meetingDisplayUtils';

import {

  meetingErrorI18nKey,

  parseMeetingSessionError,

} from '../utils/parseMeetingSessionError';

import type {

  MeetingConnectionState,

  MeetingMediaMode,

  MeetingPortal,

  MeetingSessionPayload,

} from '../types';



interface MeetingRoomPageProps {

  portal: MeetingPortal;

  Layout: FunctionComponent<{

    children: ReactNode;

    contentFlush?: boolean;

    mainFillHeight?: boolean;

  }>;

}



function parseMode(value: string | null): MeetingMediaMode {

  return value === 'voice' ? 'voice' : 'video';

}



function formatDuration(totalSeconds: number): string {

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

}



const MeetingRoomPage: FunctionComponent<MeetingRoomPageProps> = ({ portal, Layout }) => {

  const { sessionId = '' } = useParams<{ sessionId: string }>();

  const [searchParams] = useSearchParams();

  const mode = parseMode(searchParams.get('mode'));

  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  const { user } = useAuth();



  const [session, setSession] = useState<MeetingSessionPayload | null>(null);

  const [connectionState, setConnectionState] = useState<MeetingConnectionState>('preparing');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [statusLine, setStatusLine] = useState<string | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [connectedAt, setConnectedAt] = useState<number | null>(null);

  const [preJoinAccepted, setPreJoinAccepted] = useState(false);

  const [endedDurationSeconds, setEndedDurationSeconds] = useState(0);



  useEffect(() => {

    let active = true;

    const load = async () => {

      setConnectionState('preparing');

      setErrorMessage(null);

      setPreJoinAccepted(false);

      try {

        const data = await meetingSessionsApi.joinSession(sessionId, mode);

        if (!active) return;

        setSession(data);

        setConnectionState('loading');

      } catch (err) {

        if (!active) return;

        console.error('[meeting-room] session join failed', err);

        const code = parseMeetingSessionError(err);

        setErrorMessage(t(meetingErrorI18nKey(code)));

        setConnectionState('error');

      }

    };

    if (sessionId) void load();

    return () => {

      active = false;

    };

  }, [sessionId, mode, t]);



  useEffect(() => {

    if (!connectedAt || !['connected', 'waiting'].includes(connectionState)) return undefined;

    const timer = window.setInterval(() => {

      setElapsedSeconds(Math.floor((Date.now() - connectedAt) / 1000));

    }, 1000);

    return () => window.clearInterval(timer);

  }, [connectionState, connectedAt]);



  const displayName = useMemo(() => {

    if (user?.full_name) return user.full_name;

    if (user?.profile?.first_name || user?.profile?.last_name) {

      return `${user.profile.first_name ?? ''} ${user.profile.last_name ?? ''}`.trim();

    }

    return user?.email ?? t('meetingRoom.you');

  }, [t, user]);



  const partnerName = useMemo(() => {

    if (!session) return '';

    if (portal === 'student') return session.encadrant.display_name;

    return session.student.display_name;

  }, [portal, session]);



  const partnerAvatarUrl = useMemo(() => {

    if (!session) return null;

    const partner = portal === 'student' ? session.encadrant : session.student;

    return (
      partner.avatar_url?.trim() ||
      (portal === 'student' ? MEETING_DEFAULT_ENCADRANT_AVATAR : null)
    );

  }, [portal, session]);



  const finishMeeting = useCallback(async () => {

    const duration = connectedAt

      ? Math.floor((Date.now() - connectedAt) / 1000)

      : elapsedSeconds;

    setEndedDurationSeconds(duration);

    setConnectionState('ended');

    try {

      if (sessionId) await meetingSessionsApi.endSession(sessionId);

    } catch {

      // Non-blocking on leave.

    }

  }, [connectedAt, elapsedSeconds, sessionId]);



  const handleLeave = useCallback(async () => {

    await finishMeeting();

  }, [finishMeeting]);



  const handlePreJoin = useCallback(() => {

    setPreJoinAccepted(true);

    setConnectionState('joining');

  }, []);



  const connectionLabel = useMemo(() => {

    switch (connectionState) {

      case 'preparing':

        return t('meetingRoom.connection.preparing');

      case 'loading':

        return t('meetingRoom.connection.loading');

      case 'joining':

        return t('meetingRoom.connection.joining');

      case 'connected':

        return t('meetingRoom.connection.connected');

      case 'waiting':

        return t('meetingRoom.connection.waiting');

      case 'reconnecting':

        return t('meetingRoom.connection.reconnecting');

      case 'ended':

        return t('meetingRoom.connection.ended');

      case 'error':

        return t('meetingRoom.connection.error');

      default:

        return '';

    }

  }, [connectionState, t]);



  const plannedStartLabel = useMemo(() => {

    if (!session?.planned_start) return null;

    return formatMeetingDateTime(session.planned_start, i18n.language);

  }, [i18n.language, session?.planned_start]);



  const showPreJoin =

    session && !preJoinAccepted && !['error', 'ended'].includes(connectionState);

  const showJitsi =

    session && preJoinAccepted && !['error', 'ended'].includes(connectionState);

  const showEnded = connectionState === 'ended' && session;



  return (

    <Layout contentFlush mainFillHeight>

      <div className="flex h-full min-h-0 flex-col gap-3 p-3 sm:p-4 md:p-5" dir={i18n.dir()}>

        {showEnded ? (

        <header className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-3 shadow-[var(--admin-shadow-sm)]">

          <div className="flex min-w-0 items-start gap-3">

            <button

              type="button"

              onClick={() => navigate(backPathForPortal(portal))}

              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-muted)]"

              aria-label={t('meetingRoom.back')}

            >

              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />

            </button>

            {partnerName ? (
              <MeetingParticipantAvatar
                name={partnerName}
                avatarUrl={partnerAvatarUrl}
                size="sm"
              />
            ) : null}

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <p className="m-0 text-xs font-medium uppercase tracking-wide text-[var(--admin-brand)]">

                  {mode === 'voice' ? t('meetingRoom.modeVoice') : t('meetingRoom.modeVideo')}

                </p>

                {session?.status ? <MeetingStatusBadge status={session.status} /> : null}

              </div>

              <h1 className="m-0 truncate text-base font-semibold text-[var(--admin-text)] sm:text-lg">

                {session?.title || t('meetingRoom.title')}

              </h1>

              {partnerName ? (

                <p className="m-0 mt-0.5 truncate text-sm font-medium text-[var(--admin-text-secondary)]">

                  {partnerName}

                </p>

              ) : null}

              {plannedStartLabel ? (

                <p className="m-0 mt-0.5 inline-flex items-center gap-1 text-xs text-[var(--admin-text-muted)]">

                  <Calendar className="h-3 w-3" aria-hidden />

                  {plannedStartLabel}

                </p>

              ) : null}

            </div>

          </div>



          <div className="flex flex-wrap items-center gap-2 sm:gap-3">

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] px-3 py-1 text-xs text-[var(--admin-text-secondary)]">

              {connectionState === 'error' ? (

                <WifiOff className="h-3.5 w-3.5" aria-hidden />

              ) : (

                <Wifi className="h-3.5 w-3.5" aria-hidden />

              )}

              {connectionLabel}

            </span>

            {['connected', 'waiting'].includes(connectionState) ? (

              <span className="rounded-full bg-[var(--admin-surface-muted)] px-3 py-1 text-xs font-medium tabular-nums text-[var(--admin-text)]">

                {t('meetingRoom.duration')}: {formatDuration(elapsedSeconds)}

              </span>

            ) : null}

            <button

              type="button"

              onClick={() => navigate(agendaPathForPortal(portal))}

              className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--admin-border)] px-3 py-2 text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-surface-muted)]"

            >

              <Calendar className="h-4 w-4" aria-hidden />

              <span className="hidden sm:inline">{t('meetingRoom.header.agenda')}</span>

            </button>

            <button

              type="button"

              onClick={() => navigate(workspacePathForPortal(portal))}

              className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--admin-border)] px-3 py-2 text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-surface-muted)]"

            >

              <LayoutGrid className="h-4 w-4" aria-hidden />

              <span className="hidden sm:inline">{t('meetingRoom.header.workspace')}</span>

            </button>

            <button

              type="button"

              onClick={() => navigate(chatPathForPortal(portal))}

              className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--admin-border)] px-3 py-2 text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-surface-muted)]"

            >

              <MessageSquare className="h-4 w-4" aria-hidden />

              {t('meetingRoom.openChat')}

            </button>

            {!showEnded ? (

              <button

                type="button"

                onClick={() => void handleLeave()}

                className="inline-flex items-center gap-2 rounded-[10px] bg-[#ef4444] px-3 py-2 text-sm font-semibold text-white hover:bg-[#dc2626]"

              >

                <PhoneOff className="h-4 w-4" aria-hidden />

                {t('meetingRoom.leave')}

              </button>

            ) : null}

          </div>

        </header>

        ) : null}



        {statusLine ? (

          <p className="m-0 rounded-[10px] border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm text-[var(--admin-text-secondary)]">

            {statusLine}

          </p>

        ) : null}



        {errorMessage ? (

          <div

            role="alert"

            className="rounded-[14px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] dark:border-[#7f1d1d] dark:bg-[#450a0a] dark:text-[#fecaca]"

          >

            <p className="m-0 font-semibold">{t('meetingRoom.errors.createTitle')}</p>

            <p className="m-0 mt-0.5">{errorMessage}</p>

          </div>

        ) : null}



        <div className="min-h-0 flex-1">

          {!session && connectionState !== 'error' ? (

            <div className="flex h-full min-h-[420px] items-center justify-center rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]">

              <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-brand)]" aria-hidden />

              <span className="sr-only">{connectionLabel}</span>

            </div>

          ) : null}



          {showPreJoin ? (

            <MeetingPreJoinPanel

              session={session}

              portal={portal}

              mode={mode}

              onJoin={handlePreJoin}

              onLeave={() => void handleLeave()}

              connectionLabel={connectionLabel}

              connectionError={connectionState === 'error'}

              joining={false}

            />

          ) : null}



          {showEnded ? (

            <MeetingEndedPanel

              portal={portal}

              participantName={partnerName}

              durationSeconds={endedDurationSeconds}

            />

          ) : null}



          {showJitsi ? (

            <div className="relative h-full min-h-0 flex-1">

              <div className="absolute end-3 top-3 z-20 flex flex-wrap items-center gap-2">

                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-bg-elevated)_88%,transparent)] px-3 py-1 text-xs text-[var(--admin-text-secondary)] backdrop-blur-sm">

                  {connectionState === 'error' ? (

                    <WifiOff className="h-3.5 w-3.5" aria-hidden />

                  ) : (

                    <Wifi className="h-3.5 w-3.5" aria-hidden />

                  )}

                  {connectionLabel}

                </span>

                {['connected', 'waiting'].includes(connectionState) ? (

                  <span className="rounded-full bg-[color-mix(in_srgb,var(--admin-bg-elevated)_88%,transparent)] px-3 py-1 text-xs font-medium tabular-nums text-[var(--admin-text)] backdrop-blur-sm">

                    {t('meetingRoom.duration')}: {formatDuration(elapsedSeconds)}

                  </span>

                ) : null}

                <button

                  type="button"

                  onClick={() => void handleLeave()}

                  className="inline-flex items-center gap-2 rounded-[10px] bg-[#ef4444] px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#dc2626]"

                >

                  <PhoneOff className="h-4 w-4" aria-hidden />

                  {t('meetingRoom.leave')}

                </button>

              </div>

              <JitsiMeetingEmbed

                domain={session.jitsi_domain}

                roomName={session.jitsi_room_name}

                displayName={displayName}

                email={user?.email}

                mode={mode}

                onReady={() => setConnectionState('joining')}

                onJoined={() => {

                  if (!connectedAt) setConnectedAt(Date.now());

                }}

                onParticipantCountChange={(count) => {

                  setConnectionState(count <= 1 ? 'waiting' : 'connected');

                  if (!connectedAt) setConnectedAt(Date.now());

                }}

                onLeft={() => {

                  void finishMeeting();

                }}

                onError={(message: string) => {

                  const lower = message.toLowerCase();

                  if (lower.includes('permission') || lower.includes('denied')) {

                    setErrorMessage(t('meetingRoom.permissions.denied'));

                  } else if (lower.includes('microphone')) {

                    setErrorMessage(t('meetingRoom.permissions.microphoneUnavailable'));

                  } else if (lower.includes('camera')) {

                    setErrorMessage(t('meetingRoom.permissions.cameraUnavailable'));

                  } else {

                    setErrorMessage(t('meetingRoom.connection.error'));

                  }

                  setConnectionState('error');

                }}

                onParticipantJoined={(name: string) =>

                  setStatusLine(t('meetingRoom.participantJoined', { name }))

                }

                onParticipantLeft={(name: string) =>

                  setStatusLine(t('meetingRoom.participantLeft', { name }))

                }

              />

            </div>

          ) : null}

        </div>



        <p className="m-0 text-xs leading-5 text-[var(--admin-text-muted)]">

          {t('meetingRoom.securityNote')}

        </p>

      </div>

    </Layout>

  );

};



export default MeetingRoomPage;



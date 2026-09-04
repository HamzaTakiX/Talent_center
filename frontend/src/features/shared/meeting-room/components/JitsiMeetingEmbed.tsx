import { FunctionComponent, useCallback, useMemo, useRef } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useTranslation } from 'react-i18next';
import type { MeetingMediaMode } from '../types';

interface JitsiMeetingEmbedProps {
  domain: string;
  roomName: string;
  displayName: string;
  email?: string;
  mode: MeetingMediaMode;
  onReady?: () => void;
  onJoined?: () => void;
  onLeft?: () => void;
  onError?: (message: string) => void;
  onParticipantJoined?: (displayName: string) => void;
  onParticipantLeft?: (displayName: string) => void;
  onParticipantCountChange?: (count: number) => void;
}

const JitsiMeetingEmbed: FunctionComponent<JitsiMeetingEmbedProps> = ({
  domain,
  roomName,
  displayName,
  email,
  mode,
  onReady,
  onJoined,
  onLeft,
  onError,
  onParticipantJoined,
  onParticipantLeft,
  onParticipantCountChange,
}) => {
  const { t } = useTranslation();
  const joinedRef = useRef(false);
  const apiRef = useRef<{
    getNumberOfParticipants: () => number;
    addListener: (event: string, handler: (payload?: Record<string, unknown>) => void) => void;
    executeCommand: (command: string, ...args: unknown[]) => void;
  } | null>(null);

  const emitParticipantCount = useCallback(() => {
    const count = apiRef.current?.getNumberOfParticipants?.() ?? 0;
    if (count > 0) onParticipantCountChange?.(count);
  }, [onParticipantCountChange]);

  const configOverwrite = useMemo(
    () => ({
      prejoinPageEnabled: true,
      startWithAudioMuted: false,
      startWithVideoMuted: mode === 'voice',
      disableDeepLinking: true,
      enableWelcomePage: false,
      enableClosePage: false,
      disableScreenshare: false,
    }),
    [mode],
  );

  const interfaceConfigOverwrite = useMemo(
    () => ({
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      MOBILE_APP_PROMO: false,
      HIDE_INVITE_MORE_HEADER: true,
    }),
    [],
  );

  const handleApiReady = useCallback(
    (externalApi: {
      addListener: (event: string, handler: (payload?: Record<string, unknown>) => void) => void;
      executeCommand: (command: string, ...args: unknown[]) => void;
      getNumberOfParticipants: () => number;
    }) => {
      apiRef.current = externalApi;
      onReady?.();
      externalApi.addListener('videoConferenceJoined', () => {
        joinedRef.current = true;
        onJoined?.();
        emitParticipantCount();
      });
      externalApi.addListener('videoConferenceLeft', () => {
        onLeft?.();
      });
      externalApi.addListener('participantJoined', (payload) => {
        const name = String(payload?.displayName || '');
        if (name) onParticipantJoined?.(name);
        emitParticipantCount();
      });
      externalApi.addListener('participantLeft', (payload) => {
        const name = String(payload?.displayName || '');
        if (name) onParticipantLeft?.(name);
        emitParticipantCount();
      });
      externalApi.addListener('errorOccurred', (payload) => {
        const message = String(payload?.message || payload?.error || 'Jitsi error');
        onError?.(message);
      });
      // connectionFailed exists on the Jitsi External API but is not typed in @jitsi/react-sdk.
      externalApi.addListener('connectionFailed', () => {
        onError?.('connection failed');
      });
      if (mode === 'voice') {
        externalApi.executeCommand('toggleVideo');
      }
    },
    [emitParticipantCount, mode, onError, onJoined, onLeft, onParticipantJoined, onParticipantLeft, onReady],
  );

  return (
    <div className="meeting-room-jitsi relative h-full min-h-[420px] w-full overflow-hidden rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]">
      <JitsiMeeting
        domain={domain}
        roomName={roomName}
        configOverwrite={configOverwrite}
        interfaceConfigOverwrite={interfaceConfigOverwrite}
        userInfo={{
          displayName,
          email: email ?? '',
        }}
        onApiReady={handleApiReady}
        onReadyToClose={() => {
          if (joinedRef.current) onLeft?.();
        }}
        getIFrameRef={(iframeRef) => {
          if (iframeRef) {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = '0';
            iframeRef.style.borderRadius = '14px';
          }
        }}
        spinner={() => (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-2 text-sm text-[var(--admin-text-muted)]">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[var(--admin-border)] border-t-[var(--admin-brand)]" aria-hidden />
            {t('meetingRoom.connection.loadingJitsi')}
          </div>
        )}
      />
    </div>
  );
};

export default JitsiMeetingEmbed;

import { FunctionComponent, useState } from 'react';
import { Loader2, Mic, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChatMeetingRequestPayload } from '../../types/chatMeetingRequest';
import type { MeetingPortal } from '../../types';
import { useMeetingNavigation } from '../../hooks/useMeetingNavigation';
import {
  meetingErrorI18nKey,
  parseMeetingSessionError,
} from '../../utils/parseMeetingSessionError';

interface ChatMeetingRequestBubbleProps {
  direction: 'in' | 'out';
  partnerName: string;
  meetingRequest: ChatMeetingRequestPayload;
  portal: MeetingPortal;
  studentProfileId?: number;
  onAccepted?: (requestId: string) => void;
}

export const ChatMeetingRequestBubble: FunctionComponent<ChatMeetingRequestBubbleProps> = ({
  direction,
  partnerName,
  meetingRequest,
  portal,
  studentProfileId,
  onAccepted,
}) => {
  const { t } = useTranslation();
  const { startMeeting } = useMeetingNavigation(portal);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ModeIcon = meetingRequest.mode === 'voice' ? Mic : Video;
  const isPending = meetingRequest.status === 'pending';
  const isAccepted = meetingRequest.status === 'accepted';
  const canAccept = direction === 'in' && isPending;

  const handleAccept = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await startMeeting({
        portal,
        mode: meetingRequest.mode,
        studentProfileId,
        title: meetingRequest.title ?? t('meetingRoom.withParticipant', { name: partnerName }),
      });
      onAccepted?.(meetingRequest.requestId);
    } catch (err) {
      console.error('[meeting-room] meeting request accept failed', err);
      const code = parseMeetingSessionError(err);
      setErrorMessage(t(meetingErrorI18nKey(code)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`meeting-request-card max-w-[min(100%,20rem)] rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-3.5 shadow-[var(--admin-shadow-sm)] ${
        direction === 'out'
          ? 'border-[color-mix(in_srgb,var(--admin-brand)_28%,var(--admin-border))]'
          : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[color-mix(in_srgb,var(--admin-brand)_12%,var(--admin-bg-elevated))] text-[var(--admin-brand)]">
          <ModeIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)]">
            {meetingRequest.mode === 'voice'
              ? t('meetingRoom.chat.requestTitleVoice')
              : t('meetingRoom.chat.requestTitleVideo')}
          </p>
          <p className="m-0 mt-1 text-[13px] leading-5 text-[var(--admin-text-secondary)]">
            {direction === 'out'
              ? t('meetingRoom.chat.requestBodyOut', { name: partnerName })
              : t('meetingRoom.chat.requestBodyIn', { name: partnerName })}
          </p>
        </div>
      </div>

      <div className="mt-3">
        {canAccept ? (
          <button
            type="button"
            onClick={() => void handleAccept()}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--admin-brand)] px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {t('meetingRoom.chat.acceptJoin')}
          </button>
        ) : null}

        {direction === 'out' && isPending ? (
          <p className="m-0 rounded-[10px] bg-[var(--admin-surface-muted)] px-3 py-2 text-center text-xs font-medium text-[var(--admin-text-muted)]">
            {t('meetingRoom.chat.waitingResponse')}
          </p>
        ) : null}

        {isAccepted ? (
          <p className="m-0 rounded-[10px] bg-[color-mix(in_srgb,var(--admin-brand)_10%,var(--admin-bg-elevated))] px-3 py-2 text-center text-xs font-medium text-[var(--admin-brand)]">
            {t('meetingRoom.chat.accepted')}
          </p>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="m-0 mt-2 text-xs leading-5 text-[#b91c1c]" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};

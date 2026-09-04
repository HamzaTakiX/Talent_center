import { FunctionComponent, useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMeetingNavigation } from '../hooks/useMeetingNavigation';
import type { MeetingMediaMode, MeetingPortal } from '../types';
import {
  meetingErrorI18nKey,
  parseMeetingSessionError,
} from '../utils/parseMeetingSessionError';

interface MeetingActionButtonProps {
  portal: MeetingPortal;
  mode?: MeetingMediaMode;
  meetingId?: number;
  studentProfileId?: number;
  title?: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  externalLoading?: boolean;
}

export const MeetingActionButton: FunctionComponent<MeetingActionButtonProps> = ({
  portal,
  mode = 'video',
  meetingId,
  studentProfileId,
  title,
  className,
  children,
  disabled = false,
  externalLoading = false,
}) => {
  const { t } = useTranslation();
  const { startMeeting } = useMeetingNavigation(portal);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isLoading = loading || externalLoading;

  const handleClick = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await startMeeting({
        portal,
        mode,
        meetingId,
        studentProfileId,
        title,
      });
    } catch (err) {
      console.error('[meeting-room] session create failed', err);
      const code = parseMeetingSessionError(err);
      setErrorMessage(t(meetingErrorI18nKey(code)));
    } finally {
      setLoading(false);
    }
  }, [meetingId, mode, portal, startMeeting, studentProfileId, t, title]);

  return (
    <div className="inline-flex min-w-0 max-w-full flex-col gap-2">
      <button
        type="button"
        className={className}
        onClick={() => void handleClick()}
        disabled={disabled || isLoading}
        aria-describedby={errorMessage ? 'meeting-action-error' : undefined}
        aria-busy={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {children}
      </button>
      {errorMessage ? (
        <div
          id="meeting-action-error"
          role="alert"
          className="rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-left text-[13px] leading-5 text-[#b91c1c] dark:border-[#7f1d1d] dark:bg-[#450a0a] dark:text-[#fecaca]"
        >
          <p className="m-0 font-semibold">{t('meetingRoom.errors.createTitle')}</p>
          <p className="m-0 mt-0.5">{errorMessage}</p>
        </div>
      ) : null}
    </div>
  );
};

export function useMeetingAction(portal: MeetingPortal) {
  const { t } = useTranslation();
  const { startMeeting } = useMeetingNavigation(portal);
  const [loading, setLoading] = useState(false);

  const launchMeeting = useCallback(
    async (options: {
      mode?: MeetingMediaMode;
      meetingId?: number;
      studentProfileId?: number;
      title?: string;
    }) => {
      setLoading(true);
      try {
        await startMeeting({ portal, ...options, mode: options.mode ?? 'video' });
      } catch (err) {
        console.error('[meeting-room] session create failed', err);
        const code = parseMeetingSessionError(err);
        throw new Error(t(meetingErrorI18nKey(code)));
      } finally {
        setLoading(false);
      }
    },
    [portal, startMeeting, t],
  );

  return { launchMeeting, loading };
}

import { FunctionComponent, ReactNode } from 'react';
import { Calendar, Clock, MapPin, User, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MeetingPortal } from '../types';
import { formatMeetingDateTime } from '../utils/meetingDisplayUtils';
import { MeetingStatusBadge } from './MeetingStatusBadge';

export type MeetingEntityType = 'online' | 'in-person' | 'video' | 'voice';

export interface MeetingEntityCardProps {
  portal: MeetingPortal;
  participantName: string;
  title: string;
  startAt?: string | null;
  dateTimeLabel?: string;
  duration?: string | null;
  meetingType?: MeetingEntityType;
  status?: string | null;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  compact?: boolean;
}

const TYPE_LABEL_KEY: Record<MeetingEntityType, string> = {
  online: 'encadrant.agenda.meetingType.online',
  'in-person': 'encadrant.agenda.meetingType.inPerson',
  video: 'meetingRoom.modeVideo',
  voice: 'meetingRoom.modeVoice',
};

export const MeetingEntityCard: FunctionComponent<MeetingEntityCardProps> = ({
  portal,
  participantName,
  title,
  startAt,
  dateTimeLabel,
  duration,
  meetingType = 'online',
  status,
  primaryAction,
  secondaryAction,
  className,
  compact = false,
}) => {
  const { t, i18n } = useTranslation();
  const whenLabel =
    (startAt ? formatMeetingDateTime(startAt, i18n.language) : null) || dateTimeLabel || null;
  const TypeIcon = meetingType === 'in-person' ? MapPin : Video;

  return (
    <article
      className={[
        'flex min-w-0 flex-col gap-3 rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[color-mix(in_srgb,var(--admin-brand)_12%,var(--admin-bg-elevated))] text-[var(--admin-brand)]">
          <TypeIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {status ? <MeetingStatusBadge status={status} /> : null}
            <span className="inline-flex w-fit items-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-2.5 py-0.5 text-xs font-medium text-[var(--admin-text-secondary)]">
              {t(TYPE_LABEL_KEY[meetingType])}
            </span>
          </div>
          <h3 className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)] sm:text-base">
            {title}
          </h3>
          <p className="m-0 inline-flex items-center gap-1.5 text-[13px] leading-5 text-[var(--admin-text-muted)]">
            <User className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            {t('meetingRoom.withParticipant', { name: participantName })}
          </p>
          {!compact && whenLabel ? (
            <p className="m-0 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-5 text-[var(--admin-text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                {whenLabel}
              </span>
              {duration ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                  {duration}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>

      {(primaryAction || secondaryAction) && (
        <div
          className={`flex shrink-0 flex-col gap-2 sm:items-end ${
            portal === 'student' ? 'w-full sm:w-auto' : 'w-full sm:w-auto'
          }`}
        >
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </article>
  );
};

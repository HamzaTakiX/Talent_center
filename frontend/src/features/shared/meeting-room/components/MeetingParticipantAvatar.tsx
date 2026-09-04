import { FunctionComponent, useState } from 'react';
import { resolveMediaUrl } from '../../../../shared/api/mediaUrl';

/** Demo portrait when API has no avatar (aligned with encadrant supervisor card). */
export const MEETING_DEFAULT_ENCADRANT_AVATAR =
  'https://randomuser.me/api/portraits/men/32.jpg';

export function meetingParticipantInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

interface MeetingParticipantAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ring?: boolean;
}

const SIZE_CLASS: Record<NonNullable<MeetingParticipantAvatarProps['size']>, string> = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-xl',
  xl: 'h-28 w-28 text-2xl sm:h-32 sm:w-32 sm:text-3xl',
};

export const MeetingParticipantAvatar: FunctionComponent<MeetingParticipantAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
  ring = false,
}) => {
  const resolved = resolveMediaUrl(avatarUrl) ?? avatarUrl?.trim() ?? null;
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(resolved) && !failed;

  return (
    <span
      className={[
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-[color-mix(in_srgb,var(--admin-brand)_88%,#0f172a)] font-semibold text-white',
        SIZE_CLASS[size],
        ring
          ? 'shadow-[0_0_0_4px_color-mix(in_srgb,var(--admin-brand)_22%,transparent),0_12px_32px_color-mix(in_srgb,var(--admin-brand)_28%,transparent)]'
          : 'shadow-[0_4px_14px_rgba(15,23,42,0.18)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!name}
    >
      {showImage ? (
        <img
          src={resolved!}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : null}
      <span className={showImage ? 'sr-only' : undefined}>{meetingParticipantInitials(name)}</span>
    </span>
  );
};

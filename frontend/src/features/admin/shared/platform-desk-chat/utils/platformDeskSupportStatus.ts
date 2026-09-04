import type { PlatformDeskViewerRole } from '../types/platformDeskChatTypes';

/** User-facing support thread status (not raw backend workflow_status). */
export type PlatformDeskSupportStatus = 'open' | 'pending' | 'resolved' | 'closed';

type StatusInput = {
  resolved?: boolean;
  archived?: boolean;
  workflowStatus?: string;
  messages: Array<{ direction: 'in' | 'out' }>;
};

function isResolvedStatus(workflowStatus?: string): boolean {
  const normalized = workflowStatus?.trim().toUpperCase();
  return normalized === 'RESOLVED';
}

function isWaitingOnAdmin(
  conversation: StatusInput,
  viewerRole: PlatformDeskViewerRole,
): boolean {
  const last = conversation.messages[conversation.messages.length - 1];
  if (!last) return false;
  return viewerRole === 'student' ? last.direction === 'out' : last.direction === 'in';
}

/**
 * Maps conversation lifecycle fields to a support status users can act on.
 * Raw `workflow_status` values like OPEN are internal defaults.
 */
export function resolvePlatformDeskSupportStatus(
  conversation: StatusInput,
  viewerRole: PlatformDeskViewerRole = 'admin',
): PlatformDeskSupportStatus | null {
  if (conversation.archived) return 'closed';
  if (conversation.resolved || isResolvedStatus(conversation.workflowStatus)) return 'resolved';
  if (isWaitingOnAdmin(conversation, viewerRole)) return 'pending';
  return 'open';
}

/**
 * User-facing support status for sidebar, header, and context panels.
 * Replaces raw backend values like OPEN with localized badges.
 */
export function visibleSupportStatus(
  conversation: StatusInput,
  viewerRole: PlatformDeskViewerRole = 'admin',
): PlatformDeskSupportStatus | null {
  return resolvePlatformDeskSupportStatus(conversation, viewerRole);
}

export function supportStatusPillClass(status: PlatformDeskSupportStatus): string {
  switch (status) {
    case 'open':
      return 'isi-status-pill isi-status-pill--success';
    case 'pending':
      return 'isi-status-pill isi-status-pill--warning';
    case 'resolved':
      return 'isi-status-pill isi-status-pill--info';
    case 'closed':
      return 'isi-status-pill isi-status-pill--danger';
    default:
      return 'isi-status-pill isi-status-pill--neutral';
  }
}

export function supportStatusLabelKey(
  status: PlatformDeskSupportStatus,
  viewerRole: PlatformDeskViewerRole = 'admin',
): string {
  const scope = viewerRole === 'student' ? 'student.support.chat.status' : 'admin.contextualChat.supportStatus';
  return `${scope}.${status}`;
}

export const SUPPORT_STATUS_DEFAULT_LABELS: Record<PlatformDeskSupportStatus, string> = {
  open: 'Open',
  pending: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed',
};

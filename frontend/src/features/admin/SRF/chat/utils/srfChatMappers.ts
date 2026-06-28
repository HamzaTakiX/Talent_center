import type { ConversationContextDto, ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
import { mapAnnouncementMessages } from '../../../announcements-stage/chat/utils/announcementChatMappers';
import type {
  AdminSrfChatMessage,
  AdminSrfConversation,
  AdminSrfFinancialObligation,
  AdminSrfFinancialSummary,
} from '../types/adminSrfChatTypes';

type Snapshot = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === 'string' ? v : v != null ? String(v) : '';
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? '??').toUpperCase();
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(d);
}

function isConversationResolved(dto: ConversationDto, ctx: ConversationContextDto | null | undefined): boolean {
  if (Boolean(dto.metadata_json?.resolved)) return true;
  const workflowState = ctx?.workflow_state ?? '';
  const workflowStatus = ctx?.workflow_status ?? '';
  return workflowState === 'RESOLVED' || workflowStatus === 'RESOLVED';
}

function isConversationArchived(dto: ConversationDto): boolean {
  const meta = (dto.metadata_json ?? {}) as Snapshot;
  if (Object.prototype.hasOwnProperty.call(meta, 'admin_inbox_archived')) {
    return meta.admin_inbox_archived === true;
  }
  return Boolean(dto.is_archived);
}

function mapObligations(raw: unknown): AdminSrfFinancialObligation[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Snapshot;
      const status = row.status === 'paid' ? 'paid' : 'unpaid';
      return {
        id: str(row.id),
        title: str(row.title),
        status,
        detail: str(row.detail),
      } as AdminSrfFinancialObligation;
    })
    .filter((item): item is AdminSrfFinancialObligation => item != null && Boolean(item.id));
}

function mapFinancialSummary(snap: Snapshot): AdminSrfFinancialSummary {
  return {
    totalDue: num(snap.total_due),
    totalPaid: num(snap.total_paid),
    totalRemaining: num(snap.total_remaining),
  };
}

export function mapSrfConversationDto(
  dto: ConversationDto,
  messages: AdminSrfChatMessage[] = [],
): AdminSrfConversation {
  const snap = (dto.context?.context_snapshot_json ?? {}) as Snapshot;
  const ctx = dto.context;
  const studentName = str(snap.student_name ?? ctx?.student_display_name ?? dto.title);
  const resolved = isConversationResolved(dto, ctx);
  const archived = isConversationArchived(dto);
  const obligations = mapObligations(snap.obligations);
  const upcomingRaw = snap.upcoming_deadline;
  const upcomingDeadline =
    upcomingRaw && typeof upcomingRaw === 'object' && upcomingRaw !== null
      ? { label: str((upcomingRaw as Snapshot).label) || '—' }
      : { label: '—' };

  return {
    id: String(dto.id),
    conversationId: Number(dto.id),
    studentUserId: ctx?.student_user_id ?? (num(snap.student_user_id) || null),
    studentName,
    studentInitials: initials(studentName),
    studentEmail: str(snap.student_email) || undefined,
    studentAvatarUrl:
      (typeof ctx?.student_avatar_url === 'string' && ctx.student_avatar_url) ||
      str(snap.student_avatar_url) ||
      undefined,
    program: str(snap.program) || '—',
    academicLevel: str(snap.academic_level) || '—',
    className: str(snap.class_group) || '—',
    statusLabel: str(snap.status_label) || '—',
    financialSummary: mapFinancialSummary(snap),
    obligations,
    upcomingDeadline,
    lastPreview: dto.last_preview || messages[messages.length - 1]?.text || '',
    lastMessageIsOwn: Boolean(dto.last_message_is_own),
    timeLabel: formatRelative(dto.last_message_at),
    lastMessageAt: dto.last_message_at ?? null,
    unreadCount: dto.unread_count ?? 0,
    resolved,
    archived,
    messages,
  };
}

export function mapSrfMessages(
  dtos: MessageDto[],
  studentUserId: number | null,
  inboxMode: 'admin' | 'student' = 'admin',
): AdminSrfChatMessage[] {
  return mapAnnouncementMessages(dtos, studentUserId, inboxMode) as AdminSrfChatMessage[];
}

export function mapSnapshotToFinancialSidebar(snap: Snapshot) {
  return {
    financialSummary: mapFinancialSummary(snap),
    obligations: mapObligations(snap.obligations),
    upcomingDeadline:
      snap.upcoming_deadline && typeof snap.upcoming_deadline === 'object'
        ? { label: str((snap.upcoming_deadline as Snapshot).label) || '—' }
        : { label: '—' },
  };
}

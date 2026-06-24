import { displayCellValue } from '../../../academic-structure/utils/academicStructureDisplay';
import { resolveMediaUrl } from '../../../../../shared/api/mediaUrl';
import { formatConversationPreview, findLatestChatPreview, resolveStudentDisplayName } from './internshipChatDisplayUtils';
import { getMessageStableKey } from './internshipChatMessageUtils';
import { parseSmartActionCode, shouldHideSmartActionForInbox } from './internshipChatSystemMessageUtils';
import type { ChatUrgency } from '../../../shared/admin-module-chat/adminChatTypes';
import type { ConversationContextDto, ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
import type {
  ApplicationStatusLabel,
  BackendApplicationStatus,
  ConversationPriority,
  ConversationTag,
  InternshipConversation,
  InternshipMessage,
  InternshipTypeLabel,
} from '../types/internshipChatTypes';

type Snapshot = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === 'string' ? v : v != null ? String(v) : '';
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? '??').toUpperCase();
}

function formatDate(iso: string | null | undefined, locale = 'fr-FR'): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
}

function formatRelative(iso: string | null | undefined, locale = 'fr-FR'): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(d);
}

function formatTime(iso: string, locale = 'fr-FR'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
}

export function mapBackendStatus(
  status: string | null | undefined,
  workflowStatus?: string
): { label: ApplicationStatusLabel; backend: BackendApplicationStatus | null } {
  if (!status) {
    if (workflowStatus === 'INQUIRY' || workflowStatus === 'RESOLVED') {
      return { label: 'Not Applied', backend: 'INQUIRY' };
    }
    return { label: 'Not Applied', backend: null };
  }
  const map: Record<string, ApplicationStatusLabel> = {
    SUBMITTED: 'Applied',
    UNDER_REVIEW: 'Under Review',
    SHORTLISTED: 'Shortlisted',
    INTERVIEW: 'Interview',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
    EXPIRED: 'Rejected',
    OFFER_ACCEPTED: 'Accepted',
    OFFER_DECLINED: 'Rejected',
    INTERNSHIP_STARTED: 'Accepted',
    INTERNSHIP_COMPLETED: 'Completed',
    INQUIRY: 'Not Applied',
  };
  return {
    label: map[status] ?? 'Applied',
    backend: status as BackendApplicationStatus,
  };
}

export function mapOfferType(raw: string): InternshipTypeLabel {
  const map: Record<string, InternshipTypeLabel> = {
    PFE: 'PFE',
    PFA: 'PFA',
    INTERNSHIP: 'Internship',
    ALTERNANCE: 'Alternance',
    JOB: 'Other',
    OTHER: 'Other',
  };
  return map[raw] ?? 'Other';
}

export function mapUrgency(urgency: ChatUrgency | string | undefined): ConversationPriority {
  const map: Record<string, ConversationPriority> = {
    NONE: 'Normal',
    LOW: 'Normal',
    NORMAL: 'Normal',
    HIGH: 'Urgent',
    CRITICAL: 'Critical',
  };
  return map[urgency ?? 'NORMAL'] ?? 'Normal';
}

const TAG_CODE_MAP: Record<string, ConversationTag> = {
  internship_followup: 'Application Question',
  correction: 'Document Request',
  urgency: 'General Inquiry',
  escalation: 'Technical Issue',
  meeting: 'Interview Question',
  validation: 'Offer Clarification',
};

export function mapMessageTags(codes: string[]): ConversationTag[] {
  return codes
    .map((c) => TAG_CODE_MAP[c])
    .filter((t): t is ConversationTag => Boolean(t));
}

function mapOwnMessageReadState(m: MessageDto): {
  deliveryStatus?: InternshipMessage['deliveryStatus'];
  seenAt?: string;
  seenTime?: string;
} {
  if (!m.is_own) return {};

  const otherReads = (m.read_by ?? []).filter(
    (receipt) => m.sender_id == null || receipt.user_id !== m.sender_id,
  );
  const latestRead = [...otherReads].sort(
    (a, b) => new Date(b.read_at).getTime() - new Date(a.read_at).getTime(),
  )[0];
  const isRead = m.delivery_status === 'read' || Boolean(latestRead);

  if (!isRead) {
    return {
      deliveryStatus:
        m.delivery_status === 'sent' || m.delivery_status === 'delivered'
          ? m.delivery_status
          : 'delivered',
    };
  }

  const seenAt = latestRead?.read_at;
  return {
    deliveryStatus: 'read',
    seenAt,
    seenTime: seenAt ? formatTime(seenAt) : undefined,
  };
}

export function mapMessages(
  dtos: MessageDto[],
  studentUserId: number | null,
  inboxMode: 'admin' | 'student' = 'admin',
): InternshipMessage[] {
  return [...dtos]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .filter((m) => {
      const isSystem = m.message_type === 'EVENT' || m.message_type === 'SYSTEM';
      if (!isSystem) return true;
      const actionCode = parseSmartActionCode(m.body, m.metadata_json);
      return !shouldHideSmartActionForInbox(actionCode, inboxMode);
    })
    .map((m) => {
      const isStudent = studentUserId != null && m.sender_id === studentUserId;
      const isSystem = m.message_type === 'EVENT' || m.message_type === 'SYSTEM';
      const smartActionCode = parseSmartActionCode(m.body, m.metadata_json) ?? undefined;
      const readState = mapOwnMessageReadState(m);
      const direction: 'in' | 'out' = isSystem
        ? 'in'
        : inboxMode === 'student'
          ? m.is_own
            ? 'out'
            : 'in'
          : m.is_own
            ? 'out'
            : isStudent
              ? 'in'
              : 'out';
      return {
        id: getMessageStableKey(m),
        direction,
        text: m.body,
        time: formatTime(m.created_at),
        read: readState.deliveryStatus === 'read',
        deliveryStatus: readState.deliveryStatus,
        seenAt: readState.seenAt,
        seenTime: readState.seenTime,
        messageType: m.message_type,
        smartActionCode,
        createdAt: m.created_at,
        tags: m.tags,
      };
    });
}

function parseEntityLabel(label: string): { company: string; offerTitle: string } {
  if (label.includes(' / ')) {
    const [company, offerTitle] = label.split(' / ', 2);
    return { company: company.trim(), offerTitle: offerTitle.trim() };
  }
  return { company: '', offerTitle: label };
}

function isConversationResolved(
  dto: ConversationDto,
  ctx: ConversationContextDto | null | undefined,
): boolean {
  if (Boolean(dto.metadata_json?.resolved)) return true;
  const workflowState = ctx?.workflow_state ?? '';
  const workflowStatus = ctx?.workflow_status ?? '';
  return workflowState === 'RESOLVED' || workflowStatus === 'RESOLVED';
}

function isConversationArchived(
  dto: ConversationDto,
  _ctx: ConversationContextDto | null | undefined,
  inboxMode: 'admin' | 'student' = 'admin',
): boolean {
  if (inboxMode === 'student') return false;
  const meta = (dto.metadata_json ?? {}) as Snapshot;
  if (Object.prototype.hasOwnProperty.call(meta, 'admin_inbox_archived')) {
    return meta.admin_inbox_archived === true;
  }
  return Boolean(dto.is_archived);
}

export function mapConversationDto(
  dto: ConversationDto,
  messages: InternshipMessage[] = [],
  inboxMode: 'admin' | 'student' = 'admin',
): InternshipConversation {
  const snap = (dto.context?.context_snapshot_json ?? {}) as Snapshot;
  const ctx = dto.context;
  const studentUserId = ctx?.student_user_id ?? null;
  const resolved = isConversationResolved(dto, ctx);
  const archived = isConversationArchived(dto, ctx, inboxMode);

  const studentEmail =
    str(snap.student_email) ||
    dto.participants.find((p) => p.user_id === studentUserId)?.email ||
    undefined;
  const participantName = dto.participants.find((p) => p.user_id === studentUserId)?.full_name;
  const studentName = resolveStudentDisplayName(
    str(snap.student_name) || str(ctx?.student_display_name) || '',
    studentEmail,
    participantName,
  );

  const { company, offerTitle } = parseEntityLabel(ctx?.entity_label ?? '');
  const statusInfo = mapBackendStatus(
    str(snap.application_status) || null,
    ctx?.workflow_status
  );

  const lastMsg = messages[messages.length - 1];
  const workflowState = ctx?.workflow_state ?? '';
  const waitingForAdmin =
    !resolved &&
    !archived &&
    (workflowState === 'WAITING_ADMIN' ||
      workflowState === 'NEW' ||
      workflowState === 'ESCALATED' ||
      (lastMsg?.direction === 'in'));
  const waitingForStudent =
    !resolved &&
    !archived &&
    (workflowState === 'WAITING_STUDENT' || (lastMsg?.direction === 'out' && workflowState !== 'RESOLVED'));

  const internshipRaw = str(snap.internship_type) || str(snap.offer_type);
  const allTags = messages.flatMap((m) => mapMessageTags(m.tags ?? []));
  const logoFromContext = ctx?.company_logo_url;
  const logoFromSnap = str(snap.company_logo_url) || str(snap.company_logo);
  const companyLogoUrl =
    resolveMediaUrl(typeof logoFromContext === 'string' ? logoFromContext : null) ??
    resolveMediaUrl(logoFromSnap || null) ??
    undefined;
  const avatarFromContext = (ctx as { student_avatar_url?: string | null } | undefined)?.student_avatar_url;
  const avatarFromSnap = str(snap.student_avatar_url);
  const studentAvatarUrl =
    resolveMediaUrl(typeof avatarFromContext === 'string' ? avatarFromContext : null) ??
    resolveMediaUrl(avatarFromSnap || null) ??
    undefined;

  const latestPreview = findLatestChatPreview(messages);
  const lastMessage =
    latestPreview?.text ?? formatConversationPreview(dto.last_preview || '');
  const lastMessageIsOwn = latestPreview?.isOwn ?? dto.last_message_is_own ?? false;
  const lastMessageAt = latestPreview?.createdAt ?? dto.last_message_at ?? null;

  return {
    id: String(dto.id),
    conversationId: dto.id,
    studentName,
    studentInitials: initials(studentName),
    studentAvatarUrl,
    offerTitle: str(snap.offer_title) || offerTitle || dto.title,
    offerUuid: str(snap.offer_uuid) || undefined,
    company: str(snap.company_name) || company,
    internshipType: mapOfferType(internshipRaw),
    program: displayCellValue(str(snap.filiere_name)) || '—',
    className: str(snap.class_code) || '—',
    academicLevel: str(snap.academic_level) || '—',
    applicationStatus: statusInfo.label,
    backendApplicationStatus: statusInfo.backend,
    appliedDate: formatDate(str(snap.applied_at) || null),
    deadline: formatDate(str(snap.application_deadline) || null),
    interviewDate: formatDate(str(snap.interview_at) || null),
    lastStatusChange: formatDate(str(snap.last_status_change_at) || null),
    lastMessage,
    lastMessageIsOwn,
    lastMessageAt,
    timeLabel: formatRelative(lastMessageAt),
    unreadCount: dto.unread_count,
    priority: mapUrgency(ctx?.urgency),
    resolved,
    archived,
    waitingForAdmin,
    waitingForStudent,
    tags: [...new Set(allTags)],
    messages,
    studentEmail,
    studentPhone: str(snap.student_phone) || undefined,
    studentProfileId: typeof snap.student_profile_id === 'number' ? snap.student_profile_id : undefined,
    studentUserId: typeof studentUserId === 'number' ? studentUserId : undefined,
    applicationUuid: str(snap.application_uuid) || undefined,
    applicationId: typeof snap.application_id === 'number' ? snap.application_id : undefined,
    companyLogoUrl,
  };
}

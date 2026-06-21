import { displayCellValue } from '../../../academic-structure/utils/academicStructureDisplay';
import type { ChatUrgency } from '../../../shared/admin-module-chat/adminChatTypes';
import type { ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
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
    NORMAL: 'Normal',
    HIGH: 'Urgent',
    CRITICAL: 'Critical',
  };
  return map[urgency ?? 'NONE'] ?? 'Normal';
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

export function mapMessages(dtos: MessageDto[], studentUserId: number | null): InternshipMessage[] {
  return [...dtos]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((m) => {
      const isStudent = studentUserId != null && m.sender_id === studentUserId;
      const isSystem = m.message_type === 'EVENT' || m.message_type === 'SYSTEM';
      return {
        id: String(m.id),
        direction: isSystem ? 'in' : m.is_own ? 'out' : isStudent ? 'in' : 'out',
        text: m.body,
        time: formatTime(m.created_at),
        read: m.is_own,
        messageType: m.message_type,
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

export function mapConversationDto(
  dto: ConversationDto,
  messages: InternshipMessage[] = []
): InternshipConversation {
  const snap = (dto.context?.context_snapshot_json ?? {}) as Snapshot;
  const ctx = dto.context;
  const studentUserId = ctx?.student_user_id ?? null;

  const studentName =
    str(snap.student_name) ||
    dto.participants.find((p) => p.user_id === studentUserId)?.full_name ||
    dto.title.split('—').pop()?.trim() ||
    'Étudiant';

  const { company, offerTitle } = parseEntityLabel(ctx?.entity_label ?? '');
  const statusInfo = mapBackendStatus(
    str(snap.application_status) || null,
    ctx?.workflow_status
  );

  const lastMsg = messages[messages.length - 1];
  const waitingForAdmin = lastMsg?.direction === 'in' && !dto.metadata_json?.resolved;
  const waitingForStudent = lastMsg?.direction === 'out' && !dto.metadata_json?.resolved;

  const internshipRaw = str(snap.internship_type) || str(snap.offer_type);
  const allTags = messages.flatMap((m) => mapMessageTags(m.tags ?? []));

  return {
    id: String(dto.id),
    conversationId: dto.id,
    studentName,
    studentInitials: initials(studentName),
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
    lastMessage: dto.last_preview || lastMsg?.text || '',
    timeLabel: formatRelative(dto.last_message_at),
    unreadCount: dto.unread_count,
    priority: mapUrgency(ctx?.urgency),
    resolved: ctx?.workflow_status === 'RESOLVED',
    archived: Boolean(dto.is_archived),
    waitingForAdmin,
    waitingForStudent,
    tags: [...new Set(allTags)],
    messages,
    studentEmail: str(snap.student_email) || undefined,
    studentPhone: str(snap.student_phone) || undefined,
    studentProfileId: typeof snap.student_profile_id === 'number' ? snap.student_profile_id : undefined,
    applicationUuid: str(snap.application_uuid) || undefined,
    applicationId: typeof snap.application_id === 'number' ? snap.application_id : undefined,
  };
}

import type { ConversationContextDto, ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
import { mapAnnouncementMessages } from '../../../announcements-stage/chat/utils/announcementChatMappers';
import type {
  DocumentCategory,
  DocumentConversation,
  DocumentMessage,
  DocumentPriority,
  DocumentRequestStatus,
  DeliveryMethod,
} from '../types/documentChatTypes';

type Snapshot = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === 'string' ? v : v != null ? String(v) : '';
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? '??').toUpperCase();
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(d);
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

function mapCategory(raw: string): DocumentCategory {
  const value = raw.toUpperCase();
  if (value === 'CONVENTION') return 'Convention';
  if (value === 'ATTESTATION') return 'Attestation';
  if (value === 'CERTIFICATE') return 'Certificate';
  if (value === 'AUTHORIZATION') return 'Insurance';
  if (value === 'REPORT') return 'Transcript';
  return 'Administrative';
}

function mapRequestStatus(workflowStatus: string, workflowState: string): DocumentRequestStatus {
  const status = (workflowStatus || workflowState).toUpperCase();
  if (status === 'RESOLVED') return 'Validated';
  if (status === 'UNDER_REVIEW' || status === 'WAITING_ADMIN') return 'Under Review';
  if (status === 'REJECTED') return 'Rejected';
  if (status === 'CORRECTION' || status === 'WAITING_STUDENT') return 'Correction Required';
  if (status === 'SUBMITTED') return 'Submitted';
  return 'Pending';
}

function mapPriority(urgency?: string): DocumentPriority {
  const value = (urgency ?? 'NORMAL').toUpperCase();
  if (value === 'CRITICAL' || value === 'HIGH') return 'Urgent';
  if (value === 'LOW') return 'Low';
  return 'Normal';
}

function mapDeliveryMethod(snap: Snapshot): DeliveryMethod {
  if (snap.physical_enabled) return 'Pickup';
  if (snap.online_enabled) return 'Digital';
  return 'Digital';
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

export function mapDocumentConversationDto(
  dto: ConversationDto,
  messages: DocumentMessage[] = [],
): DocumentConversation {
  const snap = (dto.context?.context_snapshot_json ?? {}) as Snapshot;
  const ctx = dto.context;
  const studentName = str(snap.student_name ?? ctx?.student_display_name ?? '');
  const serviceName = str(snap.document_service_name ?? dto.title);
  const urgency = ctx?.urgency;
  const priority = mapPriority(urgency);
  const resolved = isConversationResolved(dto, ctx);
  const archived = isConversationArchived(dto);
  const slaHours = Number(snap.sla_hours ?? 48);

  return {
    id: String(dto.id),
    conversationId: Number(dto.id),
    studentUserId: ctx?.student_user_id ?? null,
    studentName,
    studentInitials: initials(studentName),
    studentEmail: str(snap.student_email) || undefined,
    studentAvatarUrl:
      (typeof ctx?.student_avatar_url === 'string' && ctx.student_avatar_url) ||
      str(snap.student_avatar_url) ||
      undefined,
    serviceId: str(snap.document_service_id),
    serviceCode: str(snap.document_service_code),
    iconKey: str(snap.document_icon_key) || 'file-text',
    colorTheme: str(snap.document_color_theme) || 'brand',
    documentTitle: serviceName,
    serviceName,
    documentCategory: mapCategory(str(snap.document_category)),
    reference: str(snap.document_service_code) || `DOC-${str(snap.document_service_id)}`,
    requestStatus: mapRequestStatus(str(ctx?.workflow_status), str(ctx?.workflow_state)),
    priority,
    submittedDate: formatDate(dto.created_at),
    slaDeadline: `${slaHours} h`,
    deliveryMethod: mapDeliveryMethod(snap),
    lastMessage: dto.last_preview || messages[messages.length - 1]?.text || '',
    timeLabel: formatRelative(dto.last_message_at),
    lastMessageAt: dto.last_message_at ?? null,
    unreadCount: dto.unread_count ?? 0,
    urgent: priority === 'Urgent' || urgency === 'CRITICAL' || urgency === 'HIGH',
    resolved,
    archived,
    messages,
    program: str(snap.filiere_name) || '—',
    academicLevel: '—',
    className: '—',
  };
}

export function mapDocumentMessages(
  dtos: MessageDto[],
  studentUserId: number | null,
): DocumentMessage[] {
  return mapAnnouncementMessages(dtos, studentUserId, 'admin') as DocumentMessage[];
}

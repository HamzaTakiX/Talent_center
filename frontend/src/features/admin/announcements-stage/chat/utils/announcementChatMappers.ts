import type { ConversationContextDto, ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
import { mapMessageAttachments } from '../../../../shared/contextual-chat/utils/mapMessageAttachments';
import { getMessageStableKey } from '../../../offres-stage/chat/utils/internshipChatMessageUtils';
import {
  parseSmartActionCode,
  shouldHideSmartActionForInbox,
} from '../../../offres-stage/chat/utils/internshipChatSystemMessageUtils';
import type {
  AnnouncementCategory,
  AnnouncementConversation,
  AnnouncementMessage,
  AnnouncementPriority,
  AnnouncementPublishStatus,
} from '../types/announcementChatTypes';

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

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
}

function mapCategory(typeName: string): AnnouncementCategory {
  const normalized = typeName.toLowerCase();
  if (normalized.includes('academic') || normalized.includes('académ')) return 'Academic';
  if (normalized.includes('event') || normalized.includes('évén')) return 'Events';
  if (normalized.includes('stage') || normalized.includes('internship')) return 'Internship';
  if (normalized.includes('admin')) return 'Administrative';
  return 'General';
}

function mapPriority(raw: string, urgency?: string): AnnouncementPriority {
  const value = (raw || urgency || 'NORMAL').toUpperCase();
  if (value === 'HIGH' || value === 'URGENT' || value === 'CRITICAL') return 'Urgent';
  if (value === 'IMPORTANT' || value === 'MEDIUM') return 'Important';
  return 'Normal';
}

function mapPublishStatus(snap: Snapshot): AnnouncementPublishStatus {
  const raw = str(snap.announcement_status).toUpperCase();
  if (raw === 'SCHEDULED') return 'Scheduled';
  if (raw === 'DRAFT') return 'Draft';
  if (raw === 'EXPIRED' || raw === 'ARCHIVED' || raw === 'HIDDEN') return 'Expired';
  return 'Published';
}

function mapAudience(snap: Snapshot): string {
  const scope = str(snap.target_scope).toUpperCase();
  const filiere = str(snap.filiere_name);
  if (scope === 'ALL_STUDENTS') return 'Tous les étudiants';
  if (scope === 'TARGETED' && filiere) return filiere;
  if (filiere) return filiere;
  return '—';
}

function mapOwnMessageReadState(m: MessageDto): {
  read?: boolean;
  deliveryStatus?: AnnouncementMessage['deliveryStatus'];
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
      read: false,
      deliveryStatus:
        m.delivery_status === 'sent' || m.delivery_status === 'delivered'
          ? m.delivery_status
          : 'delivered',
    };
  }

  const seenAt = latestRead?.read_at;
  return {
    read: true,
    deliveryStatus: 'read',
    seenAt,
    seenTime: seenAt ? formatTime(seenAt) : undefined,
  };
}

export function mapAnnouncementMessages(
  dtos: MessageDto[],
  studentUserId: number | null,
  inboxMode: 'admin' | 'student' = 'admin',
): AnnouncementMessage[] {
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
        messageType: m.message_type,
        smartActionCode,
        createdAt: m.created_at,
        attachmentName: m.attachments?.[0]?.original_filename,
        attachments: mapMessageAttachments(m),
        tags: m.tags?.length ? m.tags : undefined,
        entityRefs: m.entity_refs?.length ? m.entity_refs : undefined,
        ...readState,
      };
    });
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

function isConversationArchived(dto: ConversationDto): boolean {
  const meta = (dto.metadata_json ?? {}) as Snapshot;
  if (Object.prototype.hasOwnProperty.call(meta, 'admin_inbox_archived')) {
    return meta.admin_inbox_archived === true;
  }
  return Boolean(dto.is_archived);
}

export function mapAnnouncementConversationDto(
  dto: ConversationDto,
  messages: AnnouncementMessage[] = [],
): AnnouncementConversation {
  const snap = (dto.context?.context_snapshot_json ?? {}) as Snapshot;
  const ctx = dto.context;
  const studentName = str(snap.student_name ?? ctx?.student_display_name ?? '');
  const avatarFromContext = ctx?.student_avatar_url;
  const avatarFromSnap = str(snap.student_avatar_url);
  const studentAvatarUrl =
    (typeof avatarFromContext === 'string' && avatarFromContext.trim()) ||
    avatarFromSnap ||
    undefined;
  const priority = mapPriority(str(snap.announcement_priority), ctx?.urgency);
  const coverFromContext = ctx?.cover_image_url;
  const coverFromSnap = str(snap.cover_image_url);
  const coverImageUrl =
    (typeof coverFromContext === 'string' && coverFromContext.trim()) ||
    coverFromSnap ||
    undefined;
  const lastMsg = messages[messages.length - 1];
  const resolved = isConversationResolved(dto, ctx);
  const archived = isConversationArchived(dto);

  return {
    id: String(dto.id),
    conversationId: Number(dto.id),
    studentUserId: ctx?.student_user_id ?? null,
    studentName,
    studentInitials: initials(studentName),
    studentAvatarUrl,
    program: str(snap.filiere_name) || '—',
    academicLevel: '—',
    className: '—',
    announcementTitle: str(snap.announcement_title ?? dto.title),
    announcementUuid: str(snap.announcement_uuid) || undefined,
    announcementTypeName: str(snap.announcement_type_name) || undefined,
    coverImageUrl,
    companyName: str(snap.company_name) || undefined,
    category: mapCategory(str(snap.announcement_type_name)),
    publishStatus: mapPublishStatus(snap),
    priority,
    publishDate: formatDate(
      str(snap.published_at) ||
        str(snap.created_at) ||
        str(ctx?.announcement_published_at) ||
        undefined,
    ),
    expiryDate: formatDate(
      str(snap.publish_end_at) ||
        str(snap.application_deadline) ||
        str(ctx?.announcement_publish_end_at) ||
        undefined,
    ),
    audience: mapAudience(snap),
    lastMessage: dto.last_preview || lastMsg?.text || '',
    timeLabel: formatRelative(dto.last_message_at),
    lastMessageAt: dto.last_message_at,
    unreadCount: dto.unread_count ?? 0,
    urgent: priority === 'Urgent',
    resolved,
    archived,
    messages,
    studentEmail: str(snap.student_email),
    announcementBody: str(snap.announcement_title),
    announcementNotes: '',
  };
}

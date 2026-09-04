import type { ConversationContextDto, ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
import { resolveMediaUrl } from '../../../../../shared/api/mediaUrl';
import { getMessageStableKey } from '../../../offres-stage/chat/utils/internshipChatMessageUtils';
import {
  parseSmartActionCode,
  shouldHideSmartActionForInbox,
} from '../../../offres-stage/chat/utils/internshipChatSystemMessageUtils';
import { mapMessageAttachments } from '../../../../shared/contextual-chat/utils/mapMessageAttachments';
import type {
  PlatformDeskConversation,
  PlatformDeskEntityType,
  PlatformDeskMessage,
  PlatformDeskViewerRole,
} from '../types/platformDeskChatTypes';
import { visibleSupportStatus } from './platformDeskSupportStatus';

type Snapshot = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === 'string' ? v : v != null ? String(v) : '';
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? '??').toUpperCase();
}

function resolveSnapshotAvatar(...paths: unknown[]): string | undefined {
  for (const path of paths) {
    const resolved = resolveMediaUrl(typeof path === 'string' ? path : null);
    if (resolved) return resolved;
  }
  return undefined;
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
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

function isConversationArchived(dto: ConversationDto, viewerRole: PlatformDeskViewerRole): boolean {
  if (viewerRole === 'student') return Boolean(dto.is_archived);
  const meta = (dto.metadata_json ?? {}) as Snapshot;
  if (Object.prototype.hasOwnProperty.call(meta, 'admin_inbox_archived')) {
    return meta.admin_inbox_archived === true;
  }
  return Boolean(dto.is_archived);
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

function resolveCounterparty(
  dto: ConversationDto,
  ctx: ConversationContextDto | null | undefined,
  snap: Snapshot,
  entityType: PlatformDeskEntityType,
  viewerRole: PlatformDeskViewerRole,
): {
  displayName: string;
  email?: string;
  avatarUrl?: string;
  userId?: number | null;
  encadrantProfileId?: number | null;
  roleLabel?: string;
} {
  const isStudentDm =
    entityType === 'student_admin_dm' || entityType === 'student_desk';

  if (isStudentDm && viewerRole === 'admin') {
    const displayName =
      str(snap.student_name) ||
      str(ctx?.student_display_name) ||
      dto.title ||
      'Étudiant';
    return {
      displayName,
      email: str(snap.student_email) || undefined,
      avatarUrl: resolveSnapshotAvatar(ctx?.student_avatar_url, snap.student_avatar_url),
      userId: ctx?.student_user_id ?? (snap.student_user_id as number | null) ?? null,
    };
  }

  if (isStudentDm && viewerRole === 'student') {
    return {
      displayName: str(snap.admin_name) || dto.title || 'Administrateur',
      email: str(snap.admin_email) || undefined,
      avatarUrl: resolveSnapshotAvatar(snap.admin_avatar_url),
      userId: (snap.admin_user_id as number | null) ?? null,
      roleLabel: str(snap.admin_role_label) || 'Administrateur',
    };
  }

  if (entityType === 'admin_desk') {
    const peerName = str(snap.peer_admin_name) || str(snap.admin_name);
    const peerEmail = str(snap.peer_admin_email) || str(snap.admin_email);
    const peerId = (snap.peer_admin_user_id as number | null) ?? (snap.admin_user_id as number | null);
    const participant = dto.participants.find((p) => !dto.last_message_is_own) ?? dto.participants[0];
    return {
      displayName: peerName || participant?.full_name || dto.title || 'Administrateur',
      email: peerEmail || participant?.email || undefined,
      avatarUrl: resolveSnapshotAvatar(snap.peer_admin_avatar_url, snap.admin_avatar_url),
      userId: peerId ?? participant?.user_id ?? null,
      roleLabel: str(snap.admin_role_label) || participant?.role || 'Administrateur',
    };
  }

  if (entityType === 'encadrant_desk' || entityType === 'supervision_dm') {
    const participant = dto.participants.find((p) => !dto.last_message_is_own) ?? dto.participants[0];
    if (viewerRole === 'admin' || entityType === 'supervision_dm') {
      // Student viewing supervision_dm (or admin viewing encadrant_desk): show encadrant.
      if (entityType === 'supervision_dm' && viewerRole === 'student') {
        return {
          displayName: str(snap.encadrant_name) || participant?.full_name || dto.title || 'Encadrant',
          email: str(snap.encadrant_email) || participant?.email || undefined,
          avatarUrl: resolveSnapshotAvatar(snap.encadrant_avatar_url),
          userId: (snap.encadrant_user_id as number | null) ?? participant?.user_id ?? null,
          roleLabel: str(snap.encadrant_role_label) || 'Encadrant',
          encadrantProfileId: (snap.encadrant_profile_id as number | null) ?? null,
        };
      }
      if (entityType === 'supervision_dm' && viewerRole !== 'student') {
        return {
          displayName: str(snap.student_name) || participant?.full_name || dto.title || 'Étudiant',
          email: str(snap.student_email) || participant?.email || undefined,
          avatarUrl: resolveSnapshotAvatar(snap.student_avatar_url),
          userId: (snap.student_user_id as number | null) ?? participant?.user_id ?? null,
          roleLabel: 'Étudiant',
        };
      }
      if (entityType === 'encadrant_desk' && viewerRole === 'admin') {
        return {
          displayName: str(snap.encadrant_name) || participant?.full_name || dto.title || 'Encadrant',
          email: str(snap.encadrant_email) || participant?.email || undefined,
          avatarUrl: resolveSnapshotAvatar(snap.encadrant_avatar_url),
          userId: (snap.encadrant_user_id as number | null) ?? participant?.user_id ?? null,
          roleLabel: str(snap.encadrant_role_label) || 'Encadrant',
          encadrantProfileId: (snap.encadrant_profile_id as number | null) ?? null,
        };
      }
    }
    return {
      displayName: str(snap.admin_name) || str(snap.student_name) || participant?.full_name || dto.title || 'Contact',
      email: str(snap.admin_email) || str(snap.student_email) || participant?.email || undefined,
      avatarUrl: resolveSnapshotAvatar(snap.admin_avatar_url, snap.student_avatar_url),
      userId:
        (snap.admin_user_id as number | null) ??
        (snap.student_user_id as number | null) ??
        participant?.user_id ??
        null,
      roleLabel: str(snap.admin_role_label) || 'Contact',
    };
  }

  const participant = dto.participants.find((p) => !dto.last_message_is_own) ?? dto.participants[0];
  return {
    displayName: participant?.full_name || dto.title || 'Contact',
    email: participant?.email || undefined,
    userId: participant?.user_id ?? null,
    roleLabel: participant?.role || str(ctx?.entity_label) || undefined,
  };
}

function mapOwnMessageReadState(m: MessageDto): Partial<PlatformDeskMessage> {
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
    seenTime: seenAt ? formatTime(seenAt) : undefined,
  };
}

export function mapPlatformDeskMessages(
  dtos: MessageDto[],
  studentUserId: number | null,
  viewerRole: PlatformDeskViewerRole,
  entityType?: PlatformDeskEntityType,
): PlatformDeskMessage[] {
  const deskPeerThread =
    entityType === 'admin_desk' ||
    entityType === 'encadrant_desk' ||
    entityType === 'supervision_dm';
  return [...dtos]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .filter((m) => {
      const isSystem = m.message_type === 'EVENT' || m.message_type === 'SYSTEM';
      if (!isSystem) return true;
      const actionCode = parseSmartActionCode(m.body, m.metadata_json);
      return !shouldHideSmartActionForInbox(actionCode, viewerRole === 'student' ? 'student' : 'admin');
    })
    .map((m) => {
      const isStudentSender = studentUserId != null && m.sender_id === studentUserId;
      const isSystem = m.message_type === 'EVENT' || m.message_type === 'SYSTEM';
      const smartActionCode = parseSmartActionCode(m.body, m.metadata_json) ?? undefined;
      const direction: 'in' | 'out' = isSystem
        ? 'in'
        : m.is_own
          ? 'out'
          : deskPeerThread
            ? 'in'
            : viewerRole === 'student'
              ? !isStudentSender
                ? 'in'
                : 'out'
              : isStudentSender
                ? 'in'
                : 'out';
      return {
        id: getMessageStableKey(m),
        direction,
        text: m.body,
        time: formatTime(m.created_at),
        messageType: m.message_type as PlatformDeskMessage['messageType'],
        smartActionCode,
        createdAt: m.created_at,
        tags: m.tags?.length ? m.tags : undefined,
        entityRefs: m.entity_refs?.length ? m.entity_refs : undefined,
        attachmentName: m.attachments?.[0]?.original_filename,
        attachments: mapMessageAttachments(m),
        ...mapOwnMessageReadState(m),
      };
    });
}

export function mapPlatformDeskConversationDto(
  dto: ConversationDto,
  entityType: PlatformDeskEntityType,
  viewerRole: PlatformDeskViewerRole,
  messages: PlatformDeskMessage[] = [],
): PlatformDeskConversation {
  const snap = (dto.context?.context_snapshot_json ?? {}) as Snapshot;
  const ctx = dto.context;
  const counterparty = resolveCounterparty(dto, ctx, snap, entityType, viewerRole);
  const urgency = (ctx?.urgency ?? 'NONE').toUpperCase();
  const lastMsg = messages[messages.length - 1];
  const specializationDomains = Array.isArray(snap.specialization_domains)
    ? snap.specialization_domains.map((item) => str(item)).filter(Boolean)
    : [];
  const supervisedInternshipTypes = Array.isArray(snap.supervised_internship_types)
    ? snap.supervised_internship_types.map((item) => str(item)).filter(Boolean)
    : [];

  return {
    id: String(dto.id),
    conversationId: Number(dto.id),
    entityType,
    title: counterparty.displayName || dto.title,
    displayName: counterparty.displayName,
    email: counterparty.email,
    avatarUrl: counterparty.avatarUrl,
    initials: initials(counterparty.displayName),
    program: str(snap.filiere_name) || '—',
    academicLevel: str(snap.academic_level_name) || '—',
    className: str(snap.class_code) || '—',
    roleLabel: counterparty.roleLabel,
    entityLabel: ctx?.entity_label || undefined,
    workflowStatus: ctx?.workflow_status || ctx?.workflow_state || undefined,
    contextKind: ctx?.context_kind,
    urgency,
    userId: counterparty.userId,
    encadrantProfileId: counterparty.encadrantProfileId ?? null,
    specializationDomains,
    supervisedInternshipTypes,
    currentStudents:
      typeof snap.current_students === 'number'
        ? snap.current_students
        : Number(snap.current_students) || 0,
    maxStudents:
      typeof snap.max_students === 'number' ? snap.max_students : Number(snap.max_students) || 0,
    acceptingStudents: snap.accepting_students === true,
    isEncadrantActive: snap.is_encadrant_active !== false,
    studentUserId: ctx?.student_user_id ?? (snap.student_user_id as number | null) ?? null,
    studentProfileId: (snap.student_profile_id as number | null) ?? null,
    lastMessage: dto.last_preview || lastMsg?.text || '',
    timeLabel: formatRelative(dto.last_message_at),
    lastMessageAt: dto.last_message_at,
    unreadCount: dto.unread_count ?? 0,
    urgent: urgency === 'HIGH' || urgency === 'CRITICAL',
    resolved: isConversationResolved(dto, ctx),
    archived: isConversationArchived(dto, viewerRole),
    messages,
  };
}

export function toDeskConversationRecord(conversation: PlatformDeskConversation) {
  const supportStatus = visibleSupportStatus(conversation, 'admin');
  return {
    id: conversation.id,
    avatarInitials: conversation.initials,
    title: conversation.title,
    meta: conversation.entityLabel ?? undefined,
    preview: conversation.lastMessage,
    timeLabel: conversation.timeLabel,
    unreadCount: conversation.unreadCount,
    contextLine: conversation.entityLabel,
    statusLabel: supportStatus ?? undefined,
    subtitle: conversation.entityLabel,
    program: conversation.program,
    academicLevel: conversation.academicLevel,
    className: conversation.className,
    messages: conversation.messages,
    entityLabel: conversation.entityLabel,
    workflowStatus: conversation.workflowStatus,
    urgency: conversation.urgency,
    contextKind: conversation.contextKind,
    displayName: conversation.displayName,
    email: conversation.email,
    avatarUrl: conversation.avatarUrl,
    roleLabel: conversation.roleLabel,
    userId: conversation.userId ?? undefined,
    encadrantProfileId: conversation.encadrantProfileId ?? undefined,
    specializationDomains: conversation.specializationDomains,
    supervisedInternshipTypes: conversation.supervisedInternshipTypes,
    currentStudents: conversation.currentStudents,
    maxStudents: conversation.maxStudents,
    acceptingStudents: conversation.acceptingStudents,
    isEncadrantActive: conversation.isEncadrantActive,
    archived: conversation.archived,
    resolved: conversation.resolved,
    urgent: conversation.urgent,
  };
}

export function normalizePlatformEntityType(entityType: PlatformDeskEntityType): string {
  if (entityType === 'student_desk') return 'student_admin_dm';
  return entityType;
}

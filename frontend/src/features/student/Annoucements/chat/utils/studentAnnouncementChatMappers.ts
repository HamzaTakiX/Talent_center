import type { ConversationContextDto, ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
import { resolveMediaUrl } from '../../../../../shared/api/mediaUrl';
import type { StudentAnnouncementPriority } from '../types/studentAnnouncementChatTypes';
import { mapStudentAnnouncementPriority } from './studentAnnouncementChatUtils';

export type StudentAnnouncementMessage = {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
  seenTime?: string;
};

export type StudentAnnouncementPublishStatus = 'Published' | 'Scheduled' | 'Draft' | 'Expired';

export type StudentAnnouncementConversation = {
  id: string;
  announcementId: string;
  announcementTitle: string;
  coverImageUrl?: string | null;
  companyName: string;
  category: string;
  publishStatus: StudentAnnouncementPublishStatus;
  priority: StudentAnnouncementPriority;
  publishDate: string;
  expiryDate: string;
  audience: string;
  announcementType: string;
  applicationDeadline: string;
  lastMessage: string;
  lastMessageIsOwn: boolean;
  timeLabel: string;
  lastMessageAt?: string | null;
  unreadCount: number;
  urgent: boolean;
  archived: boolean;
  messages: StudentAnnouncementMessage[];
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(d);
}

function formatDeadline(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(d);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
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

function mapCategory(typeName: string): string {
  const normalized = typeName.toLowerCase();
  if (normalized.includes('academic') || normalized.includes('académ')) return 'Academic';
  if (normalized.includes('event') || normalized.includes('évén')) return 'Events';
  if (normalized.includes('stage') || normalized.includes('internship')) return 'Internship';
  if (normalized.includes('admin')) return 'Administrative';
  return 'General';
}

function mapPublishStatus(raw: string): StudentAnnouncementPublishStatus {
  const value = raw.toUpperCase();
  if (value === 'SCHEDULED') return 'Scheduled';
  if (value === 'DRAFT') return 'Draft';
  if (value === 'EXPIRED' || value === 'ARCHIVED' || value === 'HIDDEN') return 'Expired';
  return 'Published';
}

function mapAudience(snap: Record<string, unknown>): string {
  const scope = String(snap.target_scope ?? '').toUpperCase();
  const filiere = String(snap.filiere_name ?? '');
  if (scope === 'ALL_STUDENTS') return 'Tous les étudiants';
  if (scope === 'TARGETED' && filiere) return filiere;
  if (filiere) return filiere;
  return '—';
}

function snapshot(ctx: ConversationContextDto | null | undefined): Record<string, unknown> {
  return ctx?.context_snapshot_json ?? {};
}

export function mapAnnouncementConversation(
  dto: ConversationDto,
  messages: StudentAnnouncementMessage[] = [],
): StudentAnnouncementConversation {
  const ctx = dto.context;
  const snap = snapshot(ctx);
  const announcementUuid = String(snap.announcement_uuid ?? '');
  const sorted = [...messages];
  const mappedMessages: StudentAnnouncementMessage[] = sorted;
  const coverFromContext = ctx?.cover_image_url;
  const coverFromSnap = snap.cover_image_url as string | null | undefined;
  const coverImageUrl =
    resolveMediaUrl(typeof coverFromContext === 'string' ? coverFromContext : null) ??
    resolveMediaUrl(typeof coverFromSnap === 'string' ? coverFromSnap : null) ??
    null;
  const priorityRaw = String(snap.announcement_priority ?? 'NORMAL');
  const priority = mapStudentAnnouncementPriority(priorityRaw);
  const urgency = ctx?.urgency;
  const announcementType = String(snap.announcement_type_name ?? '');
  const urgent =
    priority === 'Urgent' || urgency === 'CRITICAL' || urgency === 'HIGH';

  return {
    id: String(dto.id),
    announcementId: announcementUuid,
    announcementTitle: String(snap.announcement_title ?? dto.title ?? ''),
    coverImageUrl,
    companyName: String(snap.company_name ?? ''),
    category: mapCategory(announcementType),
    publishStatus: mapPublishStatus(String(snap.announcement_status ?? '')),
    priority,
    publishDate: formatDate(
      (snap.published_at as string | null | undefined) ||
        (snap.created_at as string | null | undefined) ||
        ctx?.announcement_published_at,
    ),
    expiryDate: formatDate(
      (snap.publish_end_at as string | null | undefined) ||
        (snap.application_deadline as string | null | undefined) ||
        ctx?.announcement_publish_end_at,
    ),
    audience: mapAudience(snap),
    announcementType,
    applicationDeadline: formatDeadline(snap.application_deadline as string | null | undefined),
    lastMessage: dto.last_preview || mappedMessages[mappedMessages.length - 1]?.text || '',
    lastMessageIsOwn: dto.last_message_is_own ?? false,
    timeLabel: formatRelative(dto.last_message_at),
    lastMessageAt: dto.last_message_at ?? null,
    unreadCount: dto.unread_count ?? 0,
    urgent,
    archived: Boolean(dto.is_archived),
    messages: mappedMessages,
  };
}

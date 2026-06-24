import { resolveMediaUrl } from '../../../../shared/api/mediaUrl';
import type { AnnouncementPriority, FullAnnouncementItem, StudentAnnouncementFeedItem } from '../types';

function mapPriorityBucket(bucket: string): AnnouncementPriority {
  if (bucket === 'urgent') return 'Urgent';
  if (bucket === 'important') return 'Important';
  return 'Normal';
}

function formatDate(iso: string | null | undefined, locale = 'fr-FR'): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
}

function formatDeadline(iso: string | null | undefined, locale = 'fr-FR'): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  const dateStr = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
  if (days < 0) return `${dateStr} (expiré)`;
  if (days === 0) return `${dateStr} (aujourd'hui)`;
  if (days === 1) return `${dateStr} (demain)`;
  return `${dateStr} (${days} j)`;
}

export function mapFeedItemToCard(item: StudentAnnouncementFeedItem): FullAnnouncementItem {
  return {
    id: item.id,
    title: item.title,
    typeCode: item.typeCode,
    typeName: item.typeName,
    typeIcon: item.typeIcon,
    typeColor: item.typeColor,
    company: item.companyName || '—',
    postedDate: formatDate(item.publishedAt),
    deadlineLabel: formatDeadline(item.applicationDeadline),
    deadlineUrgent: item.deadlineUrgent,
    description: item.summary || item.body || '',
    body: item.body,
    priority: mapPriorityBucket(item.priorityBucket),
    matchScore: item.matchScore,
    recommended: item.recommended,
    coverImageUrl: resolveMediaUrl(item.coverImageUrl),
    externalLink: item.externalLink,
    attachments: item.attachments.map((att) => ({
      ...att,
      fileUrl: resolveMediaUrl(att.fileUrl),
    })),
    internshipDetails: item.internshipDetails,
    isUnread: item.isUnread,
    isPinned: item.isPinned,
    allowComments: item.allowComments,
    publishedAt: item.publishedAt,
    applicationDeadline: item.applicationDeadline,
    isSaved: item.isSaved,
    isFavorited: item.isFavorited,
  };
}

import type {
  AnnouncementDetailResponse,
  AnnouncementPriority,
  AnnouncementStatus,
  AnnouncementTargetPayload,
} from '../types/announcement';

export interface AnnouncementAttachmentView {
  id: number | string;
  fileUrl: string | null;
  externalUrl: string | null;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  kind: string;
  label: string;
}

export interface AnnouncementDetailAnalytics {
  views: number;
  clicks: number;
  saves: number;
  dismissals: number;
  avgRecommendationScore: number;
  recommendedStudents: number;
  actionBreakdown: Record<string, number>;
}

export interface AnnouncementDetailViewModel {
  id: string;
  title: string;
  summary: string;
  body: string;
  bodyIsHtml: boolean;
  typeCode: string;
  typeName: string;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  coverImageUrl: string | null;
  companyName: string;
  externalLink: string;
  targetScope: string;
  targetAudienceLabel: string;
  targets: AnnouncementTargetPayload[];
  attachments: AnnouncementAttachmentView[];
  tags: string[];
  isPinned: boolean;
  createdByName: string;
  scheduleTimezone: string;
  dates: {
    publishedAt: string | null;
    publishStartAt: string | null;
    publishEndAt: string | null;
    applicationDeadline: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
  stats: {
    views: number;
    clicks: number;
    saves: number;
    dismissals: number;
    audienceCount: number;
    engagementRate: number;
  };
  analytics: AnnouncementDetailAnalytics;
  publicationHistory: AnnouncementDetailResponse['publicationHistory'];
}

function readString(raw: Record<string, unknown>, key: string): string {
  const value = raw[key];
  return value != null ? String(value) : '';
}

function readNumber(raw: Record<string, unknown>, key: string): number {
  const value = raw[key];
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function readNullableString(raw: Record<string, unknown>, key: string): string | null {
  const value = raw[key];
  if (value == null || value === '') return null;
  return String(value);
}

function looksLikeHtml(text: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

function normalizeAttachments(raw: unknown): AnnouncementAttachmentView[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((item, index) => {
    const row = item as Record<string, unknown>;
    return {
      id: row.id != null ? (row.id as number | string) : index,
      fileUrl: readNullableString(row, 'fileUrl'),
      externalUrl:
        readNullableString(row, 'external_url') || readNullableString(row, 'externalUrl'),
      originalFilename:
        readString(row, 'original_filename')
        || readString(row, 'originalFilename')
        || readString(row, 'label')
        || 'file',
      mimeType: readString(row, 'mime_type') || readString(row, 'mimeType'),
      fileSizeBytes: readNumber(row, 'file_size_bytes') || readNumber(row, 'fileSizeBytes'),
      kind: readString(row, 'kind') || 'FILE',
      label: readString(row, 'label'),
    };
  });
}

export interface AnnouncementUrlLinkView {
  id: string;
  label: string;
  url: string;
}

export function collectAnnouncementUrlLinks(
  model: Pick<AnnouncementDetailViewModel, 'externalLink' | 'attachments'>,
  externalLinkLabel = 'Lien externe',
): AnnouncementUrlLinkView[] {
  const links: AnnouncementUrlLinkView[] = [];
  const mainLink = model.externalLink.trim();
  if (mainLink) {
    links.push({ id: 'main-external', label: externalLinkLabel, url: mainLink });
  }

  for (const attachment of model.attachments) {
    const url = attachment.externalUrl?.trim();
    if (!url || attachment.fileUrl) continue;
    links.push({
      id: String(attachment.id),
      label: attachment.label || attachment.originalFilename || url,
      url,
    });
  }

  return links;
}

export function fileAttachmentsOnly(
  attachments: AnnouncementAttachmentView[],
): AnnouncementAttachmentView[] {
  return attachments.filter((attachment) => Boolean(attachment.fileUrl?.trim()));
}

function normalizeAnalytics(raw: unknown, announcement: Record<string, unknown>): AnnouncementDetailAnalytics {
  const row = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const breakdown =
    row.actionBreakdown && typeof row.actionBreakdown === 'object'
      ? (row.actionBreakdown as Record<string, number>)
      : {};

  return {
    views: readNumber(row, 'views') || readNumber(announcement, 'view_count'),
    clicks: readNumber(row, 'clicks') || readNumber(announcement, 'click_count'),
    saves: readNumber(row, 'saves') || readNumber(announcement, 'save_count'),
    dismissals: readNumber(row, 'dismissals') || readNumber(announcement, 'dismiss_count'),
    avgRecommendationScore: readNumber(row, 'avgRecommendationScore'),
    recommendedStudents: readNumber(row, 'recommendedStudents'),
    actionBreakdown: breakdown,
  };
}

export function buildAnnouncementDetailViewModel(
  data: AnnouncementDetailResponse,
): AnnouncementDetailViewModel {
  const announcement = (data.announcement ?? data) as Record<string, unknown>;
  const body = readString(announcement, 'body') || readString(announcement, 'summary');
  const tags = Array.isArray(announcement.tags)
    ? announcement.tags.map((tag) => String(tag))
    : [];

  return {
    id: readString(announcement, 'id'),
    title: readString(announcement, 'title'),
    summary: readString(announcement, 'summary'),
    body,
    bodyIsHtml: looksLikeHtml(body),
    typeCode: readString(announcement, 'typeCode') || readString(announcement, 'type_code'),
    typeName: readString(announcement, 'typeName') || readString(announcement, 'typeCode'),
    status: (readString(announcement, 'status') || 'DRAFT') as AnnouncementStatus,
    priority: (readString(announcement, 'priority') || 'NORMAL') as AnnouncementPriority,
    coverImageUrl: readNullableString(announcement, 'coverImageUrl'),
    companyName: readString(announcement, 'company_name') || readString(announcement, 'companyName'),
    externalLink:
      readString(announcement, 'external_link') || readString(announcement, 'externalLink'),
    targetScope: readString(announcement, 'target_scope') || 'ALL_STUDENTS',
    targetAudienceLabel:
      readString(announcement, 'targetAudienceLabel') || readString(announcement, 'target_scope'),
    targets: Array.isArray(announcement.targets)
      ? (announcement.targets as AnnouncementTargetPayload[])
      : [],
    attachments: normalizeAttachments(announcement.attachments),
    tags,
    isPinned: Boolean(announcement.is_pinned ?? announcement.isPinned),
    createdByName: readString(announcement, 'createdByName'),
    scheduleTimezone: readString(announcement, 'scheduleTimezone') || 'Africa/Casablanca',
    dates: {
      publishedAt:
        readNullableString(announcement, 'published_at')
        || readNullableString(announcement, 'publishedAt'),
      publishStartAt:
        readNullableString(announcement, 'publish_start_at')
        || readNullableString(announcement, 'publishStartAt'),
      publishEndAt:
        readNullableString(announcement, 'publish_end_at')
        || readNullableString(announcement, 'publishEndAt'),
      applicationDeadline:
        readNullableString(announcement, 'application_deadline')
        || readNullableString(announcement, 'applicationDeadline'),
      createdAt: readNullableString(announcement, 'created_at'),
      updatedAt: readNullableString(announcement, 'updated_at'),
    },
    stats: {
      views: readNumber(announcement, 'view_count'),
      clicks: readNumber(announcement, 'click_count'),
      saves: readNumber(announcement, 'save_count'),
      dismissals: readNumber(announcement, 'dismiss_count'),
      audienceCount: data.audienceCount ?? 0,
      engagementRate: readNumber(announcement, 'engagementRate'),
    },
    analytics: normalizeAnalytics(announcement.analytics, announcement),
    publicationHistory: data.publicationHistory ?? [],
  };
}

export function formatAnnouncementDate(
  value: string | null | undefined,
  locale?: string,
): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(locale);
}

export function formatAnnouncementDateShort(
  value: string | null | undefined,
  locale?: string,
): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

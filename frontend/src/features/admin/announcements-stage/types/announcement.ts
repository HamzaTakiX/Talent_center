export type AnnouncementStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'EXPIRED'
  | 'ARCHIVED'
  | 'HIDDEN';

export type AnnouncementPriority =
  | 'NORMAL'
  | 'IMPORTANT'
  | 'URGENT'
  | 'PINNED'
  | 'INSTITUTIONAL_CRITICAL';

export interface AnnouncementListItem {
  id: string;
  title: string;
  summary: string;
  typeCode: string;
  typeName: string;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  target_scope: string;
  company_name: string;
  is_pinned: boolean;
  publish_start_at: string | null;
  publish_end_at: string | null;
  application_deadline: string | null;
  published_at: string | null;
  view_count: number;
  click_count: number;
  save_count: number;
  audienceCount?: number;
  engagementRate?: number;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  internship_only?: boolean | string;
  ordering?: string;
}

export interface PaginatedAnnouncements {
  items: AnnouncementListItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface AnnouncementTargetPayload {
  target_type: string;
  filiereId?: number | null;
  classGroupId?: number | null;
  academicLevelId?: number | null;
  academicYearId?: number | null;
  academicSectorId?: number | null;
  internshipTypeId?: number | null;
  value_json?: Record<string, unknown>;
  is_inclusive?: boolean;
}

export interface InternshipDetailsPayload {
  internshipTypeId?: number | null;
  internship_type_code?: string;
  duration?: string;
  location?: string;
  work_mode?: string;
  required_skills?: string[];
  technologies?: string[];
  languages?: string[];
  recruiter_name?: string;
  recruiter_email?: string;
  company_sector?: string;
  internship_start_date?: string | null;
  internship_end_date?: string | null;
  compensation?: string;
  offer_status?: string;
}

export interface AnnouncementWritePayload {
  title: string;
  summary?: string;
  body?: string;
  announcementTypeCode: string;
  status?: AnnouncementStatus;
  priority?: AnnouncementPriority;
  target_scope?: string;
  company_name?: string;
  external_link?: string;
  tags?: string[];
  publish_start_at?: string | null;
  publish_end_at?: string | null;
  application_deadline?: string | null;
  is_pinned?: boolean;
  targets?: AnnouncementTargetPayload[];
  internshipDetails?: InternshipDetailsPayload;
}

export interface AnnouncementTypeItem {
  id: number;
  code: string;
  name: string;
  nameLocalized: string;
  name_i18n: Record<string, string>;
  default_priority: string;
  is_active: boolean;
  is_system: boolean;
  is_mutable: boolean;
  is_bannable: boolean;
  is_internship_related: boolean;
  recommendation_weight: string;
  recommendation_boost: string;
}

export interface AnnouncementDashboardData {
  summary: {
    activeCount: number;
    expiringCount: number;
    internshipOffersCount: number;
    urgentCount: number;
    draftCount: number;
    scheduledCount: number;
    totalViews: number;
    totalClicks: number;
    totalSaves: number;
  };
  engagement: {
    views: number;
    clicks: number;
    saves: number;
    engagementRate: number;
    clickThroughRate: number;
  };
  typeDistribution: { code: string; name: string; count: number }[];
  topAnnouncements: { id: string; title: string; views: number; clicks: number; saves: number; typeCode: string }[];
  recommendation: { averageScore: number; recommendedCount: number; totalScores: number };
  insights: { kind: string; severity: string; title: string; message: string; announcementId?: string }[];
}

export interface AnnouncementDetailResponse {
  announcement: Record<string, unknown>;
  publicationHistory: { action: string; created_at: string; note?: string }[];
  audienceCount: number;
}

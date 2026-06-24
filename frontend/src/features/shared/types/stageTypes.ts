import type { PaginatedListResponse } from '../../admin/api/types';

/** Backend offer status (InternshipOffer.Status). */
export type BackendOfferStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'OPEN'
  | 'CLOSED'
  | 'EXPIRED'
  | 'ARCHIVED'
  | 'DELETED';

/** UI display status used in admin tables. */
export type UiOfferStatus = 'Active' | 'Draft' | 'Expired' | 'Closed' | 'Archived';

export interface StageOfferListItem {
  uuid: string;
  title: string;
  slug: string;
  company_name: string;
  company_logo_url?: string | null;
  location_city: string;
  offer_type: string;
  status: BackendOfferStatus;
  is_remote: boolean;
  application_deadline: string | null;
  published_at: string | null;
  view_count: number;
  application_count: number;
  created_at: string;
  publish_readiness_score?: number | null;
  publish_ready?: boolean | null;
}

export interface StageOfferDetail extends StageOfferListItem {
  description?: string;
  location_country?: string;
  is_hybrid?: boolean;
  required_skills?: string[];
  preferred_skills?: string[];
  required_languages?: string[];
  min_education_level?: string;
  duration_months?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  compensation_amount?: string | null;
  compensation_currency?: string;
  compensation_period?: string;
  external_url?: string;
  updated_at?: string;
  metadata_json?: Record<string, unknown>;
  company_logo?: string | null;
  targeting_rules?: StageOfferTargetingRule[];
  [key: string]: unknown;
}

export interface StageOfferTargetingRule {
  rule_type: string;
  value_json: Record<string, unknown>;
  is_inclusive?: boolean;
  priority?: number;
  is_active?: boolean;
}

export interface StageTargetingPreviewPayload {
  programs?: string[];
  classes?: string[];
  levels?: string[];
  departments?: string[];
  categories?: string[];
  internship_types?: string[];
  targeting_rules?: unknown[];
}

export interface StageTargetingPreview {
  total_students: number;
  affected_students: number;
  recipient_count: number;
  rule_count: number;
  existing_match_records: number;
  matching_will_refresh: boolean;
}

export interface StageOfferWritePayload {
  title: string;
  company_name: string;
  description?: string;
  location_city?: string;
  location_country?: string;
  offer_type?: string;
  is_remote?: boolean;
  is_hybrid?: boolean;
  application_deadline?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  duration_months?: number | null;
  required_skills?: string[];
  preferred_skills?: string[];
  required_languages?: string[];
  min_education_level?: string;
  compensation_amount?: number | null;
  compensation_currency?: string;
  compensation_period?: string;
  external_url?: string;
  metadata_json?: Record<string, unknown>;
  targeting_rules?: unknown[];
  programs?: string[];
  classes?: string[];
  levels?: string[];
  departments?: string[];
  categories?: string[];
  internship_types?: string[];
}

export interface StageApplication {
  uuid: string;
  status: string;
  cover_letter: string;
  match_score_at_apply: number | null;
  applied_at: string;
  last_status_change_at: string | null;
  student_email: string;
  student_name?: string;
  student_class?: string;
  student_field?: string;
  student_avatar_url?: string | null;
  reviewer_notes?: string;
  metadata_json?: Record<string, unknown>;
}

export interface StageMatchScore {
  score: number;
  score_breakdown: Record<string, unknown>;
  is_recommended: boolean;
  computed_at: string;
  offer_title?: string;
  offer_uuid?: string;
}

export interface StageRecommendation {
  recommendation_type: string;
  score: number;
  reasons: unknown[];
  offer_uuid: string;
  offer_title: string;
  company_name: string;
  company_logo_url?: string | null;
  location_city?: string;
  location_country?: string;
  offer_type?: string;
  required_skills?: string[];
}

export interface StageDashboardSummary {
  total_offers: number;
  open_offers: number;
  published_offers: number;
  total_applications: number;
  ongoing_applications?: number;
  expiring_offers_this_week?: number;
  acceptance_rate: number;
  total_views: number;
}

export interface StageAnalyticsDashboard {
  summary: StageDashboardSummary;
  views: Record<string, unknown>;
  applications: {
    period_days?: number;
    total?: number;
    by_status?: Record<string, number>;
  };
  conversion: Record<string, unknown>;
  mostActiveOffers: {
    uuid: string;
    title: string;
    company_name: string;
    company_logo_url?: string | null;
    location_city?: string | null;
    application_deadline?: string | null;
    status?: string;
    view_count: number;
    application_count: number;
  }[];
  mostActiveCompanies: Record<string, unknown>[];
  topMatchingOffers: Record<string, unknown>[];
  studentEngagement: Record<string, unknown>;
}

export interface StageImportDuplicateInfo {
  uuid: string;
  title: string;
  company_name: string;
  similarity_percent: number;
  published_days_ago: number;
  status: string;
}

export interface StageImportHistoryStep {
  step: string;
  message: string;
  payload_json: Record<string, unknown>;
  created_at: string;
}

export interface StageImportJob {
  uuid: string;
  source_url: string;
  detected_platform: string;
  status: string;
  extracted_data: Record<string, unknown>;
  normalized_data: Record<string, unknown>;
  validation_errors: unknown[];
  duplicate_offer_id: number | null;
  duplicate_offer_uuid: string | null;
  duplicate_info: StageImportDuplicateInfo | null;
  resulting_offer_id: number | null;
  error_message: string;
  parser_used: string;
  import_metadata: Record<string, unknown>;
  history: StageImportHistoryStep[];
  created_at: string;
  completed_at: string | null;
}

export interface StageImportListResponse {
  items: StageImportJob[];
  pagination: Record<string, unknown>;
  analytics: {
    total_imports: number;
    published_imports: number;
    failed_imports: number;
    successful_extractions: number;
    source_distribution: Record<string, number>;
  };
}

export interface StagePipelineBoard {
  board: Record<string, unknown>;
  metrics: Record<string, unknown>;
}

export interface StageOfferListParams {
  page?: number;
  page_size?: number;
  status?: BackendOfferStatus | string;
  search?: string;
  ordering?: string;
}

export type PaginatedStageOffers = PaginatedListResponse<StageOfferListItem>;

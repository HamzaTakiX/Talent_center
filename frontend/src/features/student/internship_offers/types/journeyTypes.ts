export interface JourneyAcademicProfile {
  program: string;
  level: string;
  class_name: string;
  internship_type: string;
  internship_type_code: string;
}

export interface JourneyProfileCompletion {
  percent: number;
  is_complete: boolean;
  checks: Record<string, boolean>;
}

export interface JourneyOfferBrief {
  uuid: string;
  title: string;
  company_name: string;
  company_logo_url?: string | null;
  location_city: string;
  work_mode: string;
  offer_type: string;
  application_deadline: string | null;
  match_score: number | null;
  application_status?: string | null;
  has_applied?: boolean;
  reasons?: unknown[];
}

export interface JourneyApplication {
  uuid: string;
  status: string;
  applied_at: string | null;
  last_status_change_at: string | null;
  match_score_at_apply: number | null;
  offer: JourneyOfferBrief;
}

export interface JourneyDeadline {
  offer_uuid: string;
  offer_title: string;
  company_name: string;
  deadline: string;
  type: 'application_follow_up' | 'offer_expiring';
  application_uuid?: string;
  match_score?: number;
}

export interface JourneyInterview {
  uuid: string;
  status: string;
  scheduled_at: string;
  interview_type: string;
  location: string;
  meeting_url: string;
  offer_uuid: string;
  offer_title: string;
  company_name: string;
  application_uuid: string;
  application_status: string;
}

export interface JourneyActionItem {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title_key: string;
  href: string;
  offer_uuid?: string;
  offer_title?: string;
  scheduled_at?: string;
}

export interface JourneyStatusUpdate {
  application_uuid: string;
  offer_title: string;
  company_name: string;
  status: string;
  previous_status: string;
  changed_at: string;
}

export interface JourneyAnalytics {
  applications_sent: number;
  interviews_obtained: number;
  offers_accepted: number;
  success_rate: number;
  rejected: number;
}

export interface InternshipJourneyDashboard {
  academic_profile: JourneyAcademicProfile;
  profile_completion: JourneyProfileCompletion;
  cv_score: number | null;
  applications_in_progress: JourneyApplication[];
  upcoming_deadlines: JourneyDeadline[];
  interviews_scheduled: JourneyInterview[];
  recent_status_updates: JourneyStatusUpdate[];
  action_items: JourneyActionItem[];
  analytics: JourneyAnalytics;
  pipeline_steps: string[];
}

export interface OffersFeed {
  recommended: JourneyOfferBrief[];
  eligible: JourneyOfferBrief[];
  recent: JourneyOfferBrief[];
  closing_soon: JourneyOfferBrief[];
  popular: JourneyOfferBrief[];
}

export interface ReadinessChecklistItem {
  key: string;
  label_key: string;
  done: boolean;
  action: string;
}

export interface ApplicationReadiness {
  can_apply: boolean;
  already_applied: boolean;
  offer_applyable: boolean;
  external_tracking_available: boolean;
  offer_status: string;
  application_status: string | null;
  checklist: ReadinessChecklistItem[];
  match_score: number;
  match_reasons: { dimension?: string; reason: string; score?: number }[];
  missing_skills: string[];
  academic_profile: JourneyAcademicProfile;
  profile_completion: JourneyProfileCompletion;
  cv_score: number | null;
}

export interface OfferMatchDetail {
  offer_uuid: string;
  score: number;
  is_eligible: boolean;
  reasons: { dimension?: string; reason: string; score?: number }[];
  breakdown: Record<string, unknown>;
  missing_skills: string[];
  academic_profile: JourneyAcademicProfile;
}

export interface ApplicationTimelineEvent {
  status: string;
  previous_status: string;
  at: string | null;
  reason: string;
  is_automated: boolean;
}

export interface ApplicationDetail extends JourneyApplication {
  timeline: ApplicationTimelineEvent[];
  interviews: { uuid: string; status: string; scheduled_at: string; interview_type: string }[];
}

// CV Builder domain types — mirror the Django models in apps.cv_builder.

export type CvStatus = 'draft' | 'ready' | 'archived';

export type SectionType =
  | 'header'
  | 'contact'
  | 'summary'
  | 'education'
  | 'experience'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'certifications'
  | 'custom';

export type AssetType = 'profile_image' | 'attachment';

export type TemplateCategory = 'modern' | 'classic' | 'minimal' | 'creative';

export interface CvTemplate {
  id: number;
  code: string;
  name: string;
  description: string;
  category: TemplateCategory;
  preview_image: string | null;
  layout_schema: Record<string, unknown>;
  style_schema: Record<string, unknown>;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Section content shapes (by section_type) --------------------------------

export interface SummaryContent {
  text: string;
}

export interface ContactContent {
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  location: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
}
export interface EducationContent { items: EducationItem[]; }

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  bullets: string[];
}
export interface ExperienceContent { items: ExperienceItem[]; }

export interface SkillItem { id: string; name: string; level: string | null; }
export interface SkillsContent { items: SkillItem[]; }

export interface LanguageItem { id: string; name: string; level: string; }
export interface LanguagesContent { items: LanguageItem[]; }

export type AnySectionContent =
  | SummaryContent
  | ContactContent
  | EducationContent
  | ExperienceContent
  | SkillsContent
  | LanguagesContent
  | Record<string, unknown>;

// ---- Core CV entities --------------------------------------------------------

export interface CvSection {
  id: number;
  section_type: SectionType;
  label: string;
  order_index: number;
  is_visible: boolean;
  slot_name: string;
  config_json: Record<string, unknown>;
  content_json: AnySectionContent;
  created_at: string;
  updated_at: string;
}

export interface CvAsset {
  id: number;
  asset_type: AssetType;
  file: string;
  metadata_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StudentCvListItem {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  status: CvStatus;
  is_primary: boolean;
  current_score: number | null;
  template: number;
  template_code: string;
  template_name: string;
  last_analyzed_at: string | null;
  last_exported_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentCv extends Omit<StudentCvListItem, 'template'> {
  template: CvTemplate;
  sections: CvSection[];
  assets: CvAsset[];
}

export interface CvVersion {
  id: number;
  version_number: number;
  change_note: string;
  snapshot_json: Record<string, unknown>;
  created_by: number | null;
  created_at: string;
}

export interface CvAiAnalysisSuggestion {
  section: SectionType;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface CvAiAnalysis {
  id: number;
  score: number;
  provider: string;
  suggestions_json: CvAiAnalysisSuggestion[];
  strengths_json: string[];
  weaknesses_json: string[];
  raw_response_json: Record<string, unknown>;
  analyzed_at: string;
}

export interface CvShareLink {
  id: number;
  token: string;
  label: string;
  is_active: boolean;
  expires_at: string | null;
  view_count: number;
  last_viewed_at: string | null;
  share_url: string;
  created_at: string;
  updated_at: string;
}

export interface PublicCv {
  uuid: string;
  title: string;
  owner_name: string;
  template: CvTemplate;
  sections: Array<Omit<CvSection, 'is_visible' | 'created_at' | 'updated_at'>>;
}

// ---- API envelope ------------------------------------------------------------

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
